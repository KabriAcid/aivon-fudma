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
      "address",
    ],
  };

  private calculateRelevance(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let score = 0;
    if (lowerText.includes(lowerQuery)) score += 10;
    
    const queryWords = lowerQuery.split(/\s+/);
    queryWords.forEach((word) => {
      if (word.length > 3 && lowerText.includes(word)) score += 2;
    });

    return score;
  }

  private detectCategory(query: string): string[] {
    const detectedCategories: string[] = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.keywords).forEach(([category, words]) => {
      if (words.some((word) => lowerQuery.includes(word))) detectedCategories.push(category);
    });

    return detectedCategories.length > 0 ? detectedCategories : ["general"];
  }

  async searchFAQs(query: string, language: string = "english"): Promise<any[]> {
    const faqs = (this.data as any).faqs.filter((f: any) => f.language === language);
    return faqs
      .map((faq: any) => ({
        ...faq,
        relevanceScore: Math.max(
          this.calculateRelevance(faq.question, query),
          this.calculateRelevance(faq.answer, query),
        ),
      }))
      .filter((faq: any) => faq.relevanceScore > 0)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  }

  async searchAcademicInfo(query: string, language: string = "english"): Promise<any[]> {
    const info = (this.data as any).academicInfo.filter((f: any) => f.language === language);
    return info
      .map((item: any) => ({
        ...item,
        relevanceScore: Math.max(
          this.calculateRelevance(item.title, query),
          this.calculateRelevance(item.content, query),
        ),
      }))
      .filter((item: any) => item.relevanceScore > 0)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  }

  async search(query: string, language: string = "english"): Promise<SearchContext> {
    const results: RetrievalResult = {};
    const categories = this.detectCategory(query);

    const searches = [];
    if (categories.includes("admission") || categories.includes("general")) {
      searches.push(this.searchFAQs(query, language).then(res => results.faqs = res));
    }
    if (categories.includes("academics") || categories.includes("general")) {
      searches.push(this.searchAcademicInfo(query, language).then(res => results.academicInfo = res));
    }

    await Promise.all(searches);

    const hasResults = (results.faqs?.length || 0) > 0 || (results.academicInfo?.length || 0) > 0;
    const summary = hasResults ? "Found relevant institutional info." : "No specific matches found.";

    return { results, summary, hasResults };
  }
}
