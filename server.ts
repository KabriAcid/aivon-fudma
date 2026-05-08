import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not set. AI features will not work. Please check your .env file.",
  );
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Basic Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { text, language = "english" } = req.body;

      if (!ai) {
        return res
          .status(500)
          .json({ error: "AI service not configured. Missing API key." });
      }

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      const systemInstruction = `
        You are Aivon (AI Voice of Network), a premium AI telecom assistant for the Federal University Dutsin-Ma (FUDMA).
        Your goal is to assist students with their academic and administrative queries.
        Current Language: ${language}.
        If language is hausa, respond strictly in Hausa.
        If language is english, respond strictly in English.
        If language is arabic, respond strictly in Arabic.
        Be concise, supportive, and professional.
        Focus on student registration, courses, campus life, and general inquiries.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const assistantMessage =
        response.text || "I'm sorry, I couldn't process that.";
      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Save recorded audio
  app.post("/api/save-recording", async (req, res) => {
    try {
      const { audioData, sessionId, duration } = req.body;

      if (!audioData || !sessionId) {
        return res
          .status(400)
          .json({ error: "Missing audio data or session ID" });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(audioData, "base64");

      // Save to file
      const fs = await import("fs").then((m) => m.promises);
      const recordingsDir = path.join(process.cwd(), "recordings");

      // Create directory if it doesn't exist
      await fs.mkdir(recordingsDir, { recursive: true });

      const filename = `${sessionId}-${Date.now()}.webm`;
      const filepath = path.join(recordingsDir, filename);

      await fs.writeFile(filepath, buffer);

      res.json({
        success: true,
        filename,
        path: `/recordings/${filename}`,
      });
    } catch (error) {
      console.error("Recording save error:", error);
      res.status(500).json({ error: "Failed to save recording" });
    }
  });

  // Serve recordings
  app.use(
    "/recordings",
    express.static(path.join(process.cwd(), "recordings")),
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
