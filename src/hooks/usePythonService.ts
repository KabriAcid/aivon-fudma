import { useState, useCallback, useRef, useEffect } from "react";

interface AIResponse {
  message: string;
  language?: string;
  timestamp?: string;
  success: boolean;
}

interface SessionData {
  sessionId: string;
  duration: number;
  transcript: any[];
  language: string;
}

export function usePythonService() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pythonUrl = "http://localhost:5000";
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  // Test connection to Python service
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${pythonUrl}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setIsConnected(true);
          setError(null);
          console.log("✅ Connected to Python service");
        } else {
          setIsConnected(false);
          setError("Python service returned error");
        }
      } catch (err) {
        setIsConnected(false);
        setError("Python service unavailable - using Node.js fallback");
        console.warn("Python service not available, will use Node.js backend");
      }
    };

    // Test immediately and then every 10 seconds
    testConnection();
    const interval = setInterval(testConnection, 10000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Generate AI response using Python service or fallback to Node.js
   */
  const generateResponse = useCallback(
    async (text: string, language: string = "english"): Promise<AIResponse> => {
      // Try Python service first
      if (isConnected) {
        try {
          const response = await fetch(`${pythonUrl}/api/generate-response`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, language }),
          });

          if (response.ok) {
            const data = await response.json();
            return {
              message: data.message,
              language: data.language,
              timestamp: new Date().toISOString(),
              success: true,
            };
          }
        } catch (err) {
          console.warn("Python service error, falling back to Node.js:", err);
        }
      }

      // Fallback to Node.js backend
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, language }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            message: data.message,
            language,
            timestamp: new Date().toISOString(),
            success: true,
          };
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (err) {
        return {
          message: "Sorry, I couldn't process that request.",
          success: false,
          timestamp: new Date().toISOString(),
        };
      }
    },
    [isConnected],
  );

  /**
   * Analyze text using Python service
   */
  const analyzeText = useCallback(
    async (
      text: string,
    ): Promise<{ detectedLanguage: string; confidence: number }> => {
      if (!isConnected) {
        return { detectedLanguage: "english", confidence: 0.5 };
      }

      try {
        const response = await fetch(`${pythonUrl}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            detectedLanguage: data.detected_language,
            confidence: data.confidence || 0.8,
          };
        }
      } catch (err) {
        console.error("Analysis error:", err);
      }

      return { detectedLanguage: "english", confidence: 0.5 };
    },
    [isConnected],
  );

  /**
   * Generate session summary using Python service
   */
  const generateSessionSummary = useCallback(
    async (sessionData: SessionData) => {
      if (!isConnected) {
        console.log("Python service unavailable, skipping summary generation");
        return null;
      }

      try {
        const response = await fetch(`${pythonUrl}/api/session-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error("Session summary error:", err);
      }

      return null;
    },
    [isConnected],
  );

  /**
   * Get language-specific prompt
   */
  const getLanguagePrompt = useCallback(
    async (promptType: string, language: string): Promise<string> => {
      if (!isConnected) {
        return "";
      }

      try {
        const response = await fetch(
          `${pythonUrl}/api/language-prompt/${promptType}/${language}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.ok) {
          const data = await response.json();
          return data.content;
        }
      } catch (err) {
        console.error("Prompt fetch error:", err);
      }

      return "";
    },
    [isConnected],
  );

  return {
    isConnected,
    error,
    generateResponse,
    analyzeText,
    generateSessionSummary,
    getLanguagePrompt,
  };
}
