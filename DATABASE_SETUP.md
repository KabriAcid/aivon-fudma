# Knowledge System Database Setup

## Overview

The FUDMA voice assistant uses Prisma ORM with SQLite for institutional knowledge storage. This guide covers initialization, seeding, and querying.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:

- `@prisma/client` - Type-safe database client
- `@prisma/cli` - Migration and studio tools
- `@google/generative-ai` - Gemini API library

### 2. Initialize Database

```bash
# Push schema to SQLite
npm run db:push

# Seed with realistic FUDMA data
npm run db:seed

# Open visual database explorer
npm run db:studio
```

## Database Schema

The schema includes 6 models:

### Department

- `id`: Unique identifier (CUID)
- `name`: Department/Faculty name
- `faculty`: Faculty classification
- `hodName`: Head of Department name
- `hodContact`: HOD phone number
- `officeLocation`: Physical location on campus

### FAQ

- `id`: Unique identifier
- `question`: Student question
- `answer`: Answer text
- `category`: "Admission" | "Academics" | "Counselling"
- `language`: "english" | "hausa"

### Contact

- `id`: Unique identifier
- `officeName`: Department/office name
- `contactEmail`: Email address
- `contactPhone`: Phone number
- `officeLocation`: Physical location

### AcademicInfo

- `id`: Unique identifier
- `title`: Information title
- `content`: Detailed content
- `category`: "Registration" | "Examination" | "Coursework"
- `language`: "english" | "hausa"

### Session

- `id`: Unique identifier
- `sessionId`: User session reference
- `selectedLanguage`: User's language preference
- `conversations`: One-to-many relationship

### Conversation

- `id`: Unique identifier
- `sessionId`: Foreign key to Session
- `role`: "user" | "assistant"
- `message`: Message content
- `createdAt`: Timestamp

## File Structure

```
prisma/
├── schema.prisma      # Complete database schema
├── seed.ts            # Seed script with FUDMA data
└── dev.db             # SQLite database (generated after db:push)

src/services/
├── retrieval.ts       # InstitutionalRetriever class
└── orchestration.ts   # AIOrchestrationService class
```

## Usage Examples

### Run Seeding Script

```bash
npm run db:seed
```

Output:

```
Starting database seed...
✅ Created 4 departments
✅ Created 5 English FAQs
✅ Created 3 Hausa FAQs
✅ Created 5 contacts
✅ Created 4 English academic info entries
✅ Created 2 Hausa academic info entries
✅ Created sample session with session_xxx
✅ Database seed completed successfully!
```

### Query in Application

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Find all FAQs in English
const faqs = await prisma.fAQ.findMany({
  where: { language: "english" },
});

// Find department by name
const dept = await prisma.department.findUnique({
  where: { name: "Faculty of Science" },
});

// Get session with conversations
const session = await prisma.session.findUnique({
  where: { sessionId: "session_123" },
  include: { conversations: true },
});

// Cleanup
await prisma.$disconnect();
```

### Open Database Studio

```bash
npm run db:studio
```

This opens a visual UI at http://localhost:5555 to browse and edit data.

## Institutional Data (Seeded)

### Departments

- Faculty of Science (Prof. Alhaji Mohammed Sabo)
- Faculty of Education (Dr. Khadija Musa Ibrahim)
- Faculty of Social Sciences (Prof. Abubakar Yusuf Hassan)
- Faculty of Engineering (Engr. Zainab Abubakar Ado)

### FAQs (10 total: 5 English + 3 Hausa)

- Admission requirements
- Course registration procedure
- CGPA requirements
- Counselling services access
- Tuition fees (English only)

### Contacts (5 total)

- Admissions Office
- Student Affairs Office
- Bursary Office
- Registrar's Office
- Library Services

### Academic Information (6 total: 4 English + 2 Hausa)

- Course registration procedure
- Examination guidelines
- Graduation requirements
- Academic probation policy
- Registration procedure (Hausa)
- Examination guidelines (Hausa)

## API Endpoints

### POST /api/process

Retrieves institutional context and generates AI-augmented responses.

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
  "contextUsed": [
    "What are the admission requirements for undergraduate programs?"
  ],
  "sources": ["FAQs", "Academic Information"]
}
```

**Flow:**

1. Search institutional knowledge base using `InstitutionalRetriever`
2. Format retrieved results for prompt injection
3. Construct system prompt with institutional context
4. Call Gemini API with augmented prompt
5. Return response with context metadata

## Development Notes

### Language Support

- English: "english" or "en"
- Hausa: "hausa" or "ha"
- Arabic: "arabic" or "ar" (extensible)

### Retrieval Strategy

- Keyword-based matching (no ML/vectors needed for MSc scope)
- Relevance scoring based on word frequency
- Category detection for targeted searches
- Top 3 results per category returned

### Error Handling

- Graceful fallback if database unavailable
- Service continues even if institutional context retrieval fails
- Logs errors to console for debugging

### Performance

- SQLite suitable for 1000s of records
- Queries indexed on `category` and `language` fields
- No N+1 query problems (Prisma optimization)
- In-memory caching possible for frequently accessed data

## Troubleshooting

### Database Already Exists

```bash
# Reset database (careful - deletes all data!)
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Prisma Client Generation Failed

```bash
npm install --save-dev @prisma/cli
npx prisma generate
```

### Seed Script Errors

```bash
# Check .env configuration
echo $DATABASE_URL
echo $GEMINI_API_KEY

# Run with debug logging
DEBUG=* npm run db:seed
```

### API Endpoint Not Found

- Ensure `npm run db:push` completed successfully
- Verify database file exists at `./prisma/dev.db`
- Check server logs for orchestration service errors

## Next Steps

1. **Test retrieval service** with sample queries
2. **Integrate with frontend** CallSimulationPage component
3. **Monitor performance** with query metrics
4. **Expand knowledge base** with additional departments/FAQs
5. **Add vector embeddings** if scaling beyond 10,000 records
