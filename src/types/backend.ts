// Type definitions for backend services and API contracts

// ==================== REQUEST/RESPONSE TYPES ====================

export interface ChatRequest {
  text: string;
  language?: string;
}

export interface ChatResponse {
  message: string;
}

export interface ProcessRequest {
  message: string;
  language?: string;
  sessionId?: string;
}

export interface ProcessResponse {
  response: string;
  contextUsed: string[];
  sources: string[];
}

export interface RecordingRequest {
  audioData: string; // base64 encoded
  sessionId: string;
  duration?: number;
}

export interface RecordingResponse {
  success: boolean;
  filename: string;
  path: string;
}

export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp?: string;
  backends?: {
    nodejs: { connected: boolean; latency: number };
    python?: { connected: boolean; latency: number };
  };
}

// ==================== DATABASE MODELS ====================

export interface Department {
  id: string;
  name: string;
  faculty: string;
  hodName: string;
  hodContact: string;
  officeLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "Admission" | "Academics" | "Counselling";
  language: "english" | "hausa";
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  officeName: string;
  contactEmail: string;
  contactPhone: string;
  officeLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicInfo {
  id: string;
  title: string;
  content: string;
  category: "Registration" | "Examination" | "Coursework";
  language: "english" | "hausa";
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionId: string;
  selectedLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  conversations?: Conversation[];
}

export interface Conversation {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  message: string;
  createdAt: Date;
  session?: Session;
}

// ==================== SERVICE RESPONSES ====================

export interface RetrievalResult {
  faqs?: FAQ[];
  contacts?: Contact[];
  academicInfo?: AcademicInfo[];
  departments?: Department[];
  relevanceScore?: number;
}

export interface SearchContext {
  results: RetrievalResult;
  summary: string;
  hasResults: boolean;
}

export interface AIResponse {
  response: string;
  contextUsed: string[];
  sources: string[];
  rawContext?: string;
}

export interface OrchestrationRequest {
  message: string;
  language: string;
  sessionId: string;
}

// ==================== LANGUAGE TYPES ====================

export type Language = "english" | "hausa" | "arabic";
export type LanguageCode = "en" | "ha" | "ar";

export const LANGUAGE_MAP: Record<LanguageCode, Language> = {
  en: "english",
  ha: "hausa",
  ar: "arabic",
};

// ==================== API ERROR TYPES ====================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// ==================== REQUEST/RESPONSE VALIDATION ====================

export function isValidLanguage(lang: string): lang is Language {
  return ["english", "hausa", "arabic"].includes(lang.toLowerCase());
}

export function validateProcessRequest(req: unknown): req is ProcessRequest {
  if (typeof req !== "object" || req === null) return false;
  const obj = req as Record<string, unknown>;
  return (
    typeof obj.message === "string" &&
    (obj.language === undefined || typeof obj.language === "string") &&
    (obj.sessionId === undefined || typeof obj.sessionId === "string")
  );
}

export function validateRecordingRequest(
  req: unknown,
): req is RecordingRequest {
  if (typeof req !== "object" || req === null) return false;
  const obj = req as Record<string, unknown>;
  return (
    typeof obj.audioData === "string" &&
    typeof obj.sessionId === "string" &&
    (obj.duration === undefined || typeof obj.duration === "number")
  );
}

// ==================== UTILITY TYPES ====================

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SearchOptions {
  query: string;
  language: Language;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

// ==================== STATUS TYPES ====================

export interface BackendStatus {
  nodejs: {
    connected: boolean;
    latency: number;
    lastCheck: Date;
  };
  python: {
    connected: boolean;
    latency: number;
    lastCheck: Date;
  };
  activeBackend: "nodejs" | "python" | "none";
}

export interface ServiceStatus {
  service: string;
  status: "healthy" | "degraded" | "offline";
  latency: number;
  timestamp: Date;
}

// ==================== CONVERSATION TYPES ====================

export interface ConversationMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  message: string;
  timestamp: Date;
  confidence?: number;
  language?: string;
}

export interface CallSession {
  sessionId: string;
  language: Language;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordings: string[];
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
}
