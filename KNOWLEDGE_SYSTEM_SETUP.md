# Knowledge System Implementation Guide

## Complete Setup & Integration

This guide covers the end-to-end implementation of the institutional knowledge system for FUDMA voice assistant.

## 1. Database Setup

### Install Dependencies

```bash
npm install
```

Installs:
- `@prisma/client` - ORM
- `@prisma/cli` - Migration tools
- `@google/generative-ai` - Gemini API

### Initialize Prisma

```bash
# Create and push schema to SQLite
npm run db:push

# Seed with FUDMA institutional data
npm run db:seed

# (Optional) Visual database explorer
npm run db:studio
```

**Files Created:**
- `prisma/schema.prisma` - 6 models (Department, FAQ, Contact, AcademicInfo, Session, Conversation)
- `prisma/seed.ts` - Bilingual seed data (English & Hausa)
- `prisma/dev.db` - SQLite database file

## 2. Backend Services

### InstitutionalRetriever (`src/services/retrieval.ts`)

Lightweight keyword-based search without ML:

```typescript
import { InstitutionalRetriever } from "@/services/retrieval";

const retriever = new InstitutionalRetriever();

// Search all resources
const context = await retriever.search("admission requirements", "english");
// Returns: { results, summary, hasResults }

// Search specific type
const faqs = await retriever.searchFAQs("admission", "english");
```

**Features:**
- Category detection (admission, academics, counselling, contacts, departments)
- Relevance scoring (keyword matching)
- Language-specific results
- Top 3 results per category

### AIOrchestrationService (`src/services/orchestration.ts`)

Orchestrates retrieval + context injection + Gemini API:

```typescript
import { createAIOrchestrationService } from "@/services/orchestration";

const aiService = createAIOrchestrationService(process.env.GEMINI_API_KEY);

// Main processing flow
const result = await aiService.process({
  message: "How do I register for courses?",
  language: "english",
  sessionId: "session_123",
});

// Returns: { response, contextUsed, sources, rawContext }
```

**Process Flow:**
1. Search institutional knowledge base
2. Format results for prompt injection
3. Build system prompt with context
4. Call Gemini API
5. Return response with metadata

### Server Endpoints (`server.ts`)

#### POST /api/process

**Request:**
```json
{
  "message": "What are the admission requirements?",
  "language": "english",
  "sessionId": "session_12345"
}
```

**Response:**
```json
{
  "response": "Admission requirements include: UTME score of minimum 180...",
  "contextUsed": ["What are the admission requirements for undergraduate programs?"],
  "sources": ["FAQs", "Academic Information"]
}
```

#### POST /api/chat (Fallback)

**Request:**
```json
{
  "text": "Hello, how can you help?",
  "language": "english"
}
```

**Response:**
```json
{
  "message": "Hello! I'm here to help with questions about FUDMA..."
}
```

## 3. Frontend Integration

### Hook: useKnowledgeAssistant

```typescript
// src/hooks/useKnowledgeAssistant.ts
import { useState, useCallback } from "react";

export function useKnowledgeAssistant() {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const query = useCallback(
    async (message: string, language: string, sessionId: string) => {
      setLoading(true);
      setError(undefined);

      try {
        const res = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, language, sessionId }),
        });

        if (!res.ok) throw new Error("API request failed");

        const data = await res.json();
        setResponse(data.response);
        setSources(data.sources || []);

        return data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { response, sources, loading, error, query };
}
```

### Component Integration

Update `src/pages/CallSimulationPage.tsx`:

```typescript
import { useKnowledgeAssistant } from "@/hooks/useKnowledgeAssistant";
import { SourceAttribution } from "@/components/SourceAttribution";

function CallSimulationPage() {
  const { response, sources, error, query } = useKnowledgeAssistant();
  // ... existing state ...

  async function processInput(userText: string) {
    try {
      const language = detectLanguage(userText);

      // Query with institutional knowledge
      const result = await query(userText, language, sessionId);

      // Speak response
      await speak(result.response, language);

      // Save to session
      await saveConversation({
        sessionId,
        role: "assistant",
        message: result.response,
      });
    } catch (error) {
      console.error("Processing error:", error);

      // Fallback to basic /api/chat
      const fallback = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, language }),
      }).then((r) => r.json());

      await speak(fallback.message, language);
    }
  }

  return (
    <div>
      {/* ... existing UI ... */}
      <SourceAttribution sources={sources} />
    </div>
  );
}
```

### SourceAttribution Component

```typescript
// src/components/SourceAttribution.tsx
interface Props {
  sources: string[];
  className?: string;
}

export function SourceAttribution({ sources, className = "" }: Props) {
  if (!sources.length) return null;

  return (
    <div className={`text-xs text-gray-500 mt-2 ${className}`}>
      <p className="font-semibold">Information from:</p>
      <ul className="list-disc list-inside">
        {sources.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 4. Type Definitions

Create `src/types/backend.ts` with complete API contracts:

```typescript
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

export interface Department {
  id: string;
  name: string;
  faculty: string;
  hodName: string;
  hodContact: string;
  officeLocation: string;
}

// ... more types ...
```

## 5. Testing

### Quick Test with cURL

```bash
# Test institutional knowledge endpoint
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are admission requirements?",
    "language": "english",
    "sessionId": "test_123"
  }'

# Test fallback endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello",
    "language": "english"
  }'
```

### Verify Database

```bash
# Open Studio
npm run db:studio

# Check data:
# - Departments (4 entries)
# - FAQs (8 entries)
# - Contacts (5 entries)
# - AcademicInfo (6 entries)
```

### Test Complete Flow

1. Start development server: `npm run dev`
2. Open http://localhost:5173
3. Initiate call (speech recognition)
4. Ask: "What are the admission requirements?"
5. Verify:
   - ✅ AI responds with admission info
   - ✅ Sources shown (FAQs, Academic Information)
   - ✅ Response sounds natural (TTS)
   - ✅ Message saved to session

## 6. File Structure

```
.
├── server.ts                          # Express backend (updated)
├── package.json                       # NPM deps (updated)
├── .env                               # Environment config (updated)
├── prisma/
│   ├── schema.prisma                  # Prisma schema (NEW)
│   ├── seed.ts                        # Seed script (NEW)
│   └── dev.db                         # SQLite database (generated)
├── src/
│   ├── services/
│   │   ├── retrieval.ts               # InstitutionalRetriever (NEW)
│   │   └── orchestration.ts           # AIOrchestrationService (NEW)
│   ├── hooks/
│   │   └── useKnowledgeAssistant.ts  # Frontend hook (NEW)
│   ├── components/
│   │   └── SourceAttribution.tsx      # Attribution display (NEW)
│   ├── pages/
│   │   └── CallSimulationPage.tsx     # Updated for integration
│   └── types/
│       └── backend.ts                 # Type definitions (NEW)
├── DATABASE_SETUP.md                  # Database guide (NEW)
└── KNOWLEDGE_SYSTEM_SETUP.md          # This file
```

## 7. Configuration

### Environment Variables (.env)

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# AI Service
GEMINI_API_KEY="your_api_key_here"
AI_PROVIDER=gemini

# Server
NODE_ENV=development
NODE_PORT=3000

# App
APP_URL="http://localhost:3000"
```

## 8. Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push
npm run db:seed

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:5173

# 5. Test voice assistant
# - Click "Start Call"
# - Ask about admissions, courses, contacts, etc.

# 6. View database (optional)
npm run db:studio
```

## 9. Performance Considerations

### Database Indexing
- Indexed on `category` and `language` for fast queries
- Supports up to 10,000+ records efficiently

### Caching (Optional)
```typescript
const cache = new Map<string, any>();

async function cachedQuery(msg: string, lang: string) {
  const key = `${msg}:${lang}`;
  if (cache.has(key)) return cache.get(key);

  const result = await query(msg, lang);
  cache.set(key, result);
  return result;
}
```

### Retrieval Optimization
- Top 3 results per category (limits prompt size)
- Relevance scoring (most relevant first)
- Category detection (targeted searches)

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database not found" | Run `npm run db:push` |
| Empty search results | Run `npm run db:seed` |
| API 500 errors | Check GEMINI_API_KEY in .env |
| Slow responses | Implement caching, check DB indexes |
| TypeScript errors | Run `npx prisma generate` |
| Frontend hook not found | Create useKnowledgeAssistant.ts |

## 11. Next Steps

1. **Test end-to-end flow** with sample queries
2. **Monitor performance** and adjust caching
3. **Expand knowledge base** with more departments/FAQs
4. **Add analytics** to track query types
5. **Scale to vector search** if records exceed 10k
6. **Implement feedback** for response quality

## 12. Architecture Summary

```
┌─────────────────────────────────────────┐
│      React Frontend (CallSimulationPage) │
└────────────────┬────────────────────────┘
                 │ POST /api/process
                 ↓
      ┌──────────────────────────┐
      │   Express Backend        │
      │   (server.ts)            │
      │                          │
      │ /api/process endpoint    │
      └──────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
    ┌─────────────────┐   ┌──────────────────┐
    │ Institutional   │   │ Gemini API       │
    │ Retriever       │   │ (Context Inject) │
    │                 │   │                  │
    │ SQLite DB       │   │ Response Gen     │
    │ (6 models)      │   │                  │
    └─────────────────┘   └──────────────────┘
        │
        ↓ (Search + Format)
    ┌─────────────────────┐
    │ FAQs, Departments   │
    │ Contacts, Academic  │
    │ Info, Sessions      │
    └─────────────────────┘
```

## Deployment Checklist

- [ ] Dependencies installed: `npm install`
- [ ] Database migrated: `npm run db:push`
- [ ] Database seeded: `npm run db:seed`
- [ ] .env configured with GEMINI_API_KEY
- [ ] Retrieval service created
- [ ] Orchestration service created
- [ ] Server endpoints added
- [ ] Frontend hook implemented
- [ ] SourceAttribution component added
- [ ] Type definitions created
- [ ] End-to-end test completed
- [ ] Error handling implemented
- [ ] Performance tested
- [ ] Caching implemented (optional)

---

**Status:** ✅ Complete knowledge system implementation
**Test:** Start with `npm run dev` and ask about admissions or courses
