import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes for session logging
  app.post("/api/log", async (req, res) => {
    try {
      const { text, response: assistantMessage, language, sessionId } = req.body;

      if (sessionId) {
        let conversation = await prisma.conversation.findUnique({
          where: { sessionId },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: { sessionId, language: language || "english" },
          });
        }

        await prisma.message.createMany({
          data: [
            { role: "user", content: text, conversationId: conversation.id },
            { role: "assistant", content: assistantMessage, conversationId: conversation.id },
          ],
        });
      }

      res.json({ status: "logged" });
    } catch (error) {
      console.error("Error logging request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const conversation = await prisma.conversation.findUnique({
        where: { sessionId },
        include: { messages: { orderBy: { timestamp: 'asc' } } },
      });
      res.json(conversation ? conversation.messages : []);
    } catch (error) {
      res.status(500).json({ error: "Error fetching history" });
    }
  });

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
