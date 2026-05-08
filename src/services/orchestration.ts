import { InstitutionalRetriever } from "./retrieval";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ProcessingRequest {
  message: string;
  language: string;
  sessionId: string;
}

interface ProcessingResponse {
  response: string;
  contextUsed: string[];
  sources: string[];
  rawContext?: string;
}

/**
 * AIOrchestrationService: Handles context injection and AI response generation
 * Retrieves institutional knowledge → constructs enhanced prompt → calls Gemini API
 */
export class AIOrchestrationService {
  private genai: GoogleGenerativeAI;
  private retriever: InstitutionalRetriever;
  private model = "gemini-1.5-flash";

  constructor(apiKey: string) {
    this.genai = new GoogleGenerativeAI(apiKey);
    this.retriever = new InstitutionalRetriever();
  }

  /**
   * Build system prompt with institutional context injection
   */
  private buildSystemPrompt(
    language: string,
    institutionalContext: string,
  ): string {
    const languageName =
      language === "ha" || language === "hausa"
        ? "Hausa"
        : language === "ar" || language === "arabic"
          ? "Arabic"
          : "English";

    const basePrompt = `You are a helpful FUDMA (Federal University Dutsinma) voice assistant speaking in ${languageName}.

Your role is to help students and visitors with questions about:
- Admissions and enrollment
- Course registration and academic procedures
- Department information and contacts
- Academic counseling and student support
- University facilities and locations

IMPORTANT INSTRUCTIONS:
1. Answer ONLY using the provided institutional information below
2. If the user asks something outside the provided context, politely redirect them to the appropriate office
3. Keep responses concise and conversational (suitable for voice interaction)
4. Use the student's language preference (${languageName})
5. Never make up information - always use official FUDMA data
6. Be helpful and professional

${institutionalContext ? `INSTITUTIONAL KNOWLEDGE BASE:\n${institutionalContext}\n` : ""}

Now, please assist the user with their inquiry.`;

    return basePrompt;
  }

  /**
   * Format retrieved results for prompt injection
   */
  private formatContextForPrompt(context: any): string {
    const parts = [];

    if (context.faqs && context.faqs.length > 0) {
      parts.push("FREQUENTLY ASKED QUESTIONS:");
      context.faqs.forEach((faq: any) => {
        parts.push(`Q: ${faq.question}`);
        parts.push(`A: ${faq.answer}\n`);
      });
    }

    if (context.academicInfo && context.academicInfo.length > 0) {
      parts.push("\nACADEMIC INFORMATION:");
      context.academicInfo.forEach((info: any) => {
        parts.push(`${info.title}:`);
        parts.push(info.content + "\n");
      });
    }

    if (context.contacts && context.contacts.length > 0) {
      parts.push("\nRELEVANT CONTACTS:");
      context.contacts.forEach((contact: any) => {
        parts.push(`${contact.officeName}`);
        parts.push(`Email: ${contact.contactEmail}`);
        parts.push(`Phone: ${contact.contactPhone}`);
        parts.push(`Location: ${contact.officeLocation}\n`);
      });
    }

    if (context.departments && context.departments.length > 0) {
      parts.push("\nDEPARTMENT INFORMATION:");
      context.departments.forEach((dept: any) => {
        parts.push(`${dept.name}`);
        parts.push(`Faculty: ${dept.faculty}`);
        parts.push(`HOD: ${dept.hodName}`);
        parts.push(`Contact: ${dept.hodContact}`);
        parts.push(`Location: ${dept.officeLocation}\n`);
      });
    }

    return parts.join("\n");
  }

  /**
   * Extract context sources from retrieved results
   */
  private extractSources(context: any): string[] {
    const sources = new Set<string>();

    if (context.faqs && context.faqs.length > 0) {
      sources.add("FAQs");
    }
    if (context.academicInfo && context.academicInfo.length > 0) {
      sources.add("Academic Information");
    }
    if (context.contacts && context.contacts.length > 0) {
      sources.add("Contact Directory");
    }
    if (context.departments && context.departments.length > 0) {
      sources.add("Department Directory");
    }

    return Array.from(sources);
  }

  /**
   * Main processing function: retrieve context → build prompt → call Gemini
   */
  async process(request: ProcessingRequest): Promise<ProcessingResponse> {
    try {
      // Normalize language code
      const language =
        request.language.toLowerCase().startsWith("ha") ||
        request.language.toLowerCase() === "hausa"
          ? "hausa"
          : request.language.toLowerCase().startsWith("ar")
            ? "arabic"
            : "english";

      // Step 1: Retrieve institutional context
      const searchContext = await this.retriever.search(
        request.message,
        language,
      );

      // Step 2: Format context for injection
      const formattedContext = this.formatContextForPrompt(
        searchContext.results,
      );

      // Step 3: Build enhanced system prompt
      const systemPrompt = this.buildSystemPrompt(language, formattedContext);

      // Step 4: Call Gemini API
      const model = this.genai.getGenerativeModel({ model: this.model });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: request.message,
              },
            ],
          },
        ],
        systemInstruction: systemPrompt,
      });

      const response =
        result.response.text() ||
        "I was unable to generate a response. Please try again.";

      // Step 5: Extract sources used
      const sources = this.extractSources(searchContext.results);

      return {
        response,
        contextUsed:
          searchContext.results.faqs?.map((f: any) => f.question) || [],
        sources,
        rawContext: formattedContext,
      };
    } catch (error) {
      console.error("AI orchestration error:", error);
      throw new Error(
        `Failed to process request: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const model = this.genai.getGenerativeModel({
        model: this.model,
      });
      // Test with minimal request
      await model.generateContent("test");
      return true;
    } catch (error) {
      console.error("AI service health check failed:", error);
      return false;
    }
  }
}

// Export factory function
export function createAIOrchestrationService(
  apiKey: string,
): AIOrchestrationService {
  return new AIOrchestrationService(apiKey);
}
