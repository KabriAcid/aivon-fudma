/**
 * React Hook for Real-Time Python Backend Communication
 * Provides WebSocket connection with fallback to HTTP
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface WebSocketMessage {
  type: "streaming_request" | "quick_response" | "analyze_request";
  text: string;
  language?: string;
  stream?: boolean;
}

interface UseAIServiceReturn {
  isConnected: boolean;
  status: ConnectionStatus;
  sendStreamingRequest: (text: string, language: string) => Promise<void>;
  sendQuickRequest: (text: string, language: string) => Promise<string>;
  analyzeText: (text: string) => Promise<string>;
  connectionStats: {
    connected: boolean;
    method: "websocket" | "http";
    reconnectAttempts: number;
  };
}

export function useAIService(
  onChunkReceived?: (chunk: string) => void,
  onResponseComplete?: (response: string) => void,
): UseAIServiceReturn {
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [useWebSocket, setUseWebSocket] = useState(true);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Initialize WebSocket connection
  useEffect(() => {
    const pythonBackendUrl = `${window.location.hostname}:5000`;

    const connectWebSocket = () => {
      try {
        setStatus("connecting");
        console.log("Attempting WebSocket connection to Python backend...");

        // Dynamically import Socket.IO client
        import("socket.io-client")
          .then(({ io }) => {
            const socket = io(pythonBackendUrl, {
              transports: ["websocket", "polling"],
              reconnection: true,
              reconnectionDelay: RECONNECT_DELAY,
              reconnectionDelayMax: 10000,
              reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            });

            socket.on("connect", () => {
              console.log("✅ Connected to Python WebSocket backend");
              setIsConnected(true);
              setStatus("connected");
              setUseWebSocket(true);
              reconnectAttemptsRef.current = 0;
              toast.success("Connected to AI service");
            });

            socket.on("connection_response", (data) => {
              console.log("Connection acknowledged:", data);
            });

            socket.on("response_chunk", (data) => {
              if (onChunkReceived) {
                onChunkReceived(data.chunk);
              }
            });

            socket.on("response_complete", (data) => {
              if (onResponseComplete) {
                onResponseComplete(data.full_response);
              }
            });

            socket.on("quick_response_ready", (data) => {
              if (onResponseComplete) {
                onResponseComplete(data.response);
              }
            });

            socket.on("error", (data) => {
              console.error("WebSocket error:", data);
              toast.error(`AI Service Error: ${data.message}`);
            });

            socket.on("disconnect", () => {
              console.log("❌ Disconnected from Python WebSocket backend");
              setIsConnected(false);
              setStatus("disconnected");
              reconnectAttemptsRef.current += 1;

              if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                setUseWebSocket(false);
                toast.warning("WebSocket unavailable. Using HTTP fallback.");
                console.log("Falling back to HTTP requests");
              }
            });

            socket.on("connect_error", (error) => {
              console.error("WebSocket connection error:", error);
              setStatus("error");
            });

            socketRef.current = socket;
          })
          .catch((err) => {
            console.warn("Socket.IO not available, using HTTP fallback:", err);
            setUseWebSocket(false);
            setStatus("disconnected");
          });
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        setUseWebSocket(false);
        toast.error("Could not connect to Python backend");
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Send streaming request
  const sendStreamingRequest = useCallback(
    async (text: string, language: string = "english") => {
      if (!text) return;

      try {
        if (useWebSocket && socketRef.current?.connected) {
          console.log("Sending streaming request via WebSocket");
          socketRef.current.emit("streaming_request", {
            text,
            language,
            stream: true,
          });
        } else {
          console.log("Falling back to HTTP for streaming request");
          // HTTP fallback
          const response = await fetch(
            "http://localhost:5000/api/generate-response",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, language }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (onResponseComplete) {
              onResponseComplete(data.message);
            }
          }
        }
      } catch (err) {
        console.error("Streaming request error:", err);
        toast.error("Failed to send streaming request");
      }
    },
    [useWebSocket, onResponseComplete],
  );

  // Send quick request (non-streaming)
  const sendQuickRequest = useCallback(
    async (text: string, language: string = "english"): Promise<string> => {
      if (!text) return "";

      try {
        if (useWebSocket && socketRef.current?.connected) {
          console.log("Sending quick request via WebSocket");
          return new Promise((resolve) => {
            const listener = (data: any) => {
              socketRef.current.off("quick_response_ready", listener);
              resolve(data.response);
            };
            socketRef.current.on("quick_response_ready", listener);
            socketRef.current.emit("quick_response", {
              text,
              language,
            });
          });
        } else {
          console.log("Falling back to HTTP for quick request");
          // HTTP fallback
          const response = await fetch(
            "http://localhost:5000/api/generate-response",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, language }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            return data.message;
          }
          return "";
        }
      } catch (err) {
        console.error("Quick request error:", err);
        toast.error("Failed to send request");
        return "";
      }
    },
    [useWebSocket],
  );

  // Analyze text (language detection, etc.)
  const analyzeText = useCallback(
    async (text: string): Promise<string> => {
      if (!text) return "english";

      try {
        if (useWebSocket && socketRef.current?.connected) {
          console.log("Analyzing via WebSocket");
          return new Promise((resolve) => {
            const listener = (data: any) => {
              socketRef.current.off("analysis_complete", listener);
              resolve(data.detected_language);
            };
            socketRef.current.on("analysis_complete", listener);
            socketRef.current.emit("analyze_request", { text });
          });
        } else {
          console.log("Analyzing via HTTP fallback");
          // HTTP fallback
          const response = await fetch("http://localhost:5000/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });

          if (response.ok) {
            const data = await response.json();
            return data.detected_language;
          }
          return "english";
        }
      } catch (err) {
        console.error("Analysis error:", err);
        return "english";
      }
    },
    [useWebSocket],
  );

  return {
    isConnected,
    status,
    sendStreamingRequest,
    sendQuickRequest,
    analyzeText,
    connectionStats: {
      connected: isConnected,
      method: useWebSocket ? "websocket" : "http",
      reconnectAttempts: reconnectAttemptsRef.current,
    },
  };
}
