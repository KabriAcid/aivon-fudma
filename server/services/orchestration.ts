import { InstitutionalRetriever } from "./retrieval.js";
import { GoogleGenAI } from "@google/genai";

interface ProcessingRequest {
  message: string;
  language: string;
  sessionId: string;
}

export class AIOrchestrationService {
  private genai: GoogleGenAI;
  private retriever: InstitutionalRetriever;
  private model = "gemini-3-flash-preview";

  constructor(apiKey: string) {
    this.genai = new GoogleGenAI({ apiKey });
    this.retriever = new InstitutionalRetriever();
  }

  private buildSystemPrompt(language: string, institutionalContext: string): string {
    const languageName = language.startsWith("ha") ? "Hausa" : language.startsWith("ar") ? "Arabic" : "English";
    return `You are Aivon, a FUDMA voice assistant. Language: ${languageName}.
    
    Use ONLY the following context to answer. If not in context, say you can't help with that.
    
    CONTEXT:
    ${institutionalContext}
    `;
  }

  async process(request: ProcessingRequest) {
    const searchContext = await this.retriever.search(request.message, request.language);
    const formattedContext = JSON.stringify(searchContext.results);
    const systemPrompt = this.buildSystemPrompt(request.language, formattedContext);

    const result = await this.genai.models.generateContent({
      model: this.model,
      contents: request.message,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return {
      response: result.text || "I'm sorry, I couldn't find an answer.",
      sources: searchContext.hasResults ? ["Institutional Data"] : [],
      contextUsed: searchContext.hasResults ? ["Knowledge Base"] : []
    };
  }
}

export function createAIOrchestrationService(apiKey: string) {
  return new AIOrchestrationService(apiKey);
}
