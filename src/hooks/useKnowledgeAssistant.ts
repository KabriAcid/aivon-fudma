import { useState, useCallback } from "react";
import { ProcessResponse } from "@/types";

export function useKnowledgeAssistant() {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const query = useCallback(
    async (message: string, language: string, sessionId: string): Promise<ProcessResponse> => {
      setLoading(true);
      setError(undefined);

      try {
        const res = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, language, sessionId }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "API request failed");
        }

        const data: ProcessResponse = await res.json();
        setResponse(data.response);
        setSources(data.sources || []);

        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { response, sources, loading, error, query };
}
