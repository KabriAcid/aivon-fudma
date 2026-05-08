import knowledgeBase from "../../prisma/knowledge_base.json";

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
 * InstitutionalRetriever: Fast JSON-based search for FUDMA knowledge base
 */
export class InstitutionalRetriever {
  private data = knowledgeBase;
  private keywords: {
    [key: string]: string[];
  } = {
    admission: [
      "admission",
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
      if (word.length > 3 && lowerText.includes(word)) {
        score += 2;
      }
    });

    return score;
  }

  /**
   * Detect query category based on keywords
   */
  private detectCategory(query: string): string[] {
    const detectedCategories: string[] = [];
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
    const faqs = this.data.faqs.filter(f => f.language === language);

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
      .slice(0, 3);
  }

  /**
   * Search academic information
   */
  async searchAcademicInfo(
    query: string,
    language: string = "english",
  ): Promise<any[]> {
    const info = this.data.academicInfo.filter(f => f.language === language);

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
      .slice(0, 3);
  }

  /**
   * Search contacts
   */
  async searchContacts(query: string): Promise<any[]> {
    const contacts = this.data.contacts;

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
    const departments = this.data.departments;

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
      const results: RetrievalResult = {};

      const searches = [];

      if (categories.includes("admission") || categories.includes("general")) {
        searches.push(this.searchFAQs(query, language).then(res => results.faqs = res));
      }

      if (categories.includes("academics") || categories.includes("general")) {
        searches.push(this.searchAcademicInfo(query, language).then(res => results.academicInfo = res));
      }

      if (categories.includes("contacts") || categories.includes("departments")) {
        searches.push(this.searchContacts(query).then(res => results.contacts = res));
        searches.push(this.searchDepartments(query).then(res => results.departments = res));
      }

      // If nothing detected, search all
      if (searches.length === 0) {
        searches.push(this.searchFAQs(query, language).then(res => results.faqs = res));
        searches.push(this.searchAcademicInfo(query, language).then(res => results.academicInfo = res));
      }

      await Promise.all(searches);

      const hasResults =
        (results.faqs?.length || 0) > 0 ||
        (results.academicInfo?.length || 0) > 0 ||
        (results.contacts?.length || 0) > 0 ||
        (results.departments?.length || 0) > 0;

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
        summary: "Error searching knowledge base.",
        hasResults: false,
      };
    }
  }

  private generateSummary(results: RetrievalResult, hasResults: boolean): string {
    if (!hasResults) return "No matches found.";
    const parts = [];
    if (results.faqs?.length) {
      parts.push(`Retrieved ${results.faqs.length} FAQ items.`);
    }
    if (results.academicInfo?.length) {
      parts.push(`Retrieved ${results.academicInfo.length} academic guides.`);
    }
    return parts.join(" ");
  }
}

export const retriever = new InstitutionalRetriever();

