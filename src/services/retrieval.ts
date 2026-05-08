import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RetrievalResult {
  faqs?: any[];
  contacts?: any[];
  academicInfo?: any[];
  departments?: any[];
  relevanceScore?: number;
}

interface SearchContext {
  results: RetrievalResult;
  summary: string;
  hasResults: boolean;
}

/**
 * InstitutionalRetriever: Lightweight keyword-based search for FUDMA knowledge base
 * No vector embeddings - just pattern matching and relevance scoring
 */
export class InstitutionalRetriever {
  private keywords: {
    [key: string]: string[];
  } = {
    admission: [
      "admission",
      "apply",
      "apply",
      "entry",
      "requirement",
      "utme",
      "jamb",
      "qualify",
    ],
    academics: [
      "course",
      "registration",
      "register",
      "semester",
      "exam",
      "examination",
      "study",
      "cgpa",
    ],
    counselling: [
      "counsel",
      "support",
      "help",
      "advice",
      "problem",
      "issue",
      "stress",
      "mental",
    ],
    contacts: [
      "contact",
      "office",
      "phone",
      "email",
      "location",
      "address",
      "reach",
    ],
    departments: [
      "department",
      "faculty",
      "hod",
      "head",
      "office",
      "building",
      "location",
    ],
  };

  /**
   * Calculate relevance score based on keyword matches
   */
  private calculateRelevance(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let score = 0;

    // Exact phrase match (highest score)
    if (lowerText.includes(lowerQuery)) {
      score += 10;
    }

    // Individual word matches
    const queryWords = lowerQuery.split(/\s+/);
    queryWords.forEach((word) => {
      if (lowerText.includes(word) && word.length > 3) {
        score += 2;
      }
    });

    return score;
  }

  /**
   * Detect query category based on keywords
   */
  private detectCategory(query: string): string[] {
    const detectedCategories = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.keywords).forEach(([category, words]) => {
      if (words.some((word) => lowerQuery.includes(word))) {
        detectedCategories.push(category);
      }
    });

    return detectedCategories.length > 0 ? detectedCategories : ["general"];
  }

  /**
   * Search FAQs by relevance
   */
  async searchFAQs(
    query: string,
    language: string = "english",
  ): Promise<any[]> {
    const faqs = await prisma.fAQ.findMany({
      where: {
        language,
      },
    });

    return faqs
      .map((faq) => ({
        ...faq,
        relevanceScore: Math.max(
          this.calculateRelevance(faq.question, query),
          this.calculateRelevance(faq.answer, query),
        ),
      }))
      .filter((faq) => faq.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // Return top 3
  }

  /**
   * Search academic information
   */
  async searchAcademicInfo(
    query: string,
    language: string = "english",
  ): Promise<any[]> {
    const info = await prisma.academicInfo.findMany({
      where: {
        language,
      },
    });

    return info
      .map((item) => ({
        ...item,
        relevanceScore: Math.max(
          this.calculateRelevance(item.title, query),
          this.calculateRelevance(item.content, query),
        ),
      }))
      .filter((item) => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // Return top 3
  }

  /**
   * Search contacts by office name or query
   */
  async searchContacts(query: string): Promise<any[]> {
    const contacts = await prisma.contact.findMany();

    return contacts
      .map((contact) => ({
        ...contact,
        relevanceScore: Math.max(
          this.calculateRelevance(contact.officeName, query),
          this.calculateRelevance(contact.officeLocation, query),
        ),
      }))
      .filter((contact) => contact.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 2);
  }

  /**
   * Search departments
   */
  async searchDepartments(query: string): Promise<any[]> {
    const departments = await prisma.department.findMany();

    return departments
      .map((dept) => ({
        ...dept,
        relevanceScore: Math.max(
          this.calculateRelevance(dept.name, query),
          this.calculateRelevance(dept.faculty, query),
          this.calculateRelevance(dept.hodName, query),
        ),
      }))
      .filter((dept) => dept.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 2);
  }

  /**
   * Comprehensive search across all institutional data
   */
  async search(
    query: string,
    language: string = "english",
  ): Promise<SearchContext> {
    try {
      const categories = this.detectCategory(query);

      let results: RetrievalResult = {};
      const promises = [];

      // Search based on detected categories
      if (categories.includes("admission") || categories.includes("general")) {
        promises.push(
          this.searchFAQs(query, language)
            .then((res) => {
              results.faqs = res;
            })
            .catch(() => {
              results.faqs = [];
            }),
        );
      }

      if (categories.includes("academics") || categories.includes("general")) {
        promises.push(
          this.searchAcademicInfo(query, language)
            .then((res) => {
              results.academicInfo = res;
            })
            .catch(() => {
              results.academicInfo = [];
            }),
        );
      }

      if (
        categories.includes("contacts") ||
        categories.includes("departments")
      ) {
        promises.push(
          this.searchContacts(query)
            .then((res) => {
              results.contacts = res;
            })
            .catch(() => {
              results.contacts = [];
            }),
        );

        promises.push(
          this.searchDepartments(query)
            .then((res) => {
              results.departments = res;
            })
            .catch(() => {
              results.departments = [];
            }),
        );
      }

      // Always search general resources
      if (!promises.length) {
        results.faqs = await this.searchFAQs(query, language).catch(() => []);
        results.academicInfo = await this.searchAcademicInfo(
          query,
          language,
        ).catch(() => []);
      }

      await Promise.all(promises);

      // Generate summary
      const hasResults =
        (results.faqs && results.faqs.length > 0) ||
        (results.academicInfo && results.academicInfo.length > 0) ||
        (results.contacts && results.contacts.length > 0) ||
        (results.departments && results.departments.length > 0);

      const summary = this.generateSummary(results, hasResults);

      return {
        results,
        summary,
        hasResults,
      };
    } catch (error) {
      console.error("Retrieval error:", error);
      return {
        results: {},
        summary: "Unable to retrieve institutional information at this time.",
        hasResults: false,
      };
    }
  }

  /**
   * Generate plain text summary of retrieved results
   */
  private generateSummary(
    results: RetrievalResult,
    hasResults: boolean,
  ): string {
    if (!hasResults) {
      return "No relevant information found in the knowledge base.";
    }

    const parts = [];

    if (results.faqs && results.faqs.length > 0) {
      parts.push(`Found ${results.faqs.length} FAQ(s) matching your query.`);
      results.faqs.forEach((faq) => {
        parts.push(`- Q: ${faq.question}`);
      });
    }

    if (results.academicInfo && results.academicInfo.length > 0) {
      parts.push(
        `Found ${results.academicInfo.length} academic information item(s).`,
      );
      results.academicInfo.forEach((info) => {
        parts.push(`- ${info.title}`);
      });
    }

    if (results.contacts && results.contacts.length > 0) {
      parts.push(`Found ${results.contacts.length} contact(s) that may help.`);
    }

    if (results.departments && results.departments.length > 0) {
      parts.push(`Found ${results.departments.length} relevant department(s).`);
    }

    return parts.join("\n");
  }
}

// Export singleton instance
export const retriever = new InstitutionalRetriever();
