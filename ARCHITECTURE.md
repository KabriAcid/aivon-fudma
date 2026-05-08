# Aivon Architecture Documentation

## Executive Summary

Aivon is a cloud-based, multi-modal AI voice assistant system designed to provide bilingual (English, Hausa, Arabic) student support through a simulated telecom voice interaction experience. The architecture prioritizes **reliability, simplicity, and demonstration quality** over computational complexity.

---

## 🎯 Design Philosophy

### Core Principles

1. **API-First Architecture** - Leverage proven cloud services rather than local ML models
2. **Minimal Dependencies** - Reduce deployment complexity and hardware requirements
3. **Graceful Degradation** - System remains functional even with partial component failures
4. **User-Centric Design** - Accessibility and UX are architectural priorities
5. **Academic Defensibility** - Design choices justified by research scope and practical constraints

### Design Rationale

Rather than pursuing computationally expensive local model implementations, this system focuses on architecting a robust multi-modal voice interface. This approach:

- Enables cross-platform compatibility without specialized hardware
- Ensures consistent, high-quality AI responses
- Reduces deployment friction and development overhead
- Aligns with the research goal: **system integration and accessibility**, not ML research

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER / FRONTEND                       │
│  React 19 + Vite + Tailwind CSS + Framer Motion            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │  SpeechRec   │      │ SpeechSynth  │  (Browser APIs)   │
│  │  (STT)       │      │  (TTS)       │                   │
│  └──────┬───────┘      └──────────────┘                   │
│         │                       ▲                          │
│         │ user transcript       │ text to speak            │
│         ▼                       │                          │
│  ┌──────────────────────────────┐                         │
│  │  CallSimulationPage          │                         │
│  │  - Call state management     │                         │
│  │  - Session tracking          │                         │
│  │  - Audio recording (Blob)    │                         │
│  └──────┬───────────────────────┘                         │
│         │ HTTP/JSON                                        │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS.js / NODE.js BACKEND               │
│           Port 3000 (Vite dev middleware + API)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  • POST /api/chat          (AI processing)           │  │
│  │  • POST /api/save-recording (Audio persistence)      │  │
│  │  • GET  /api/health        (Health check)            │  │
│  └──────┬──────────────────────────┬───────────────────┘  │
│         │                          │                      │
│         │ AI requests              │ Save audio blob      │
│         ▼                          ▼                      │
│  ┌──────────────────┐      ┌─────────────────┐          │
│  │ Gemini API call  │      │ File System     │          │
│  │ (generateContent)│      │ /recordings     │          │
│  └──────────────────┘      └─────────────────┘          │
│                                                          │
└────────────────────────────────────────────────────────┘
          ▲                           ▲
          │ (Cloud)                   │ (Persistent)
          │                           │
        INTERNET              Server Storage
          │                           │
    ┌─────┴──────────────────────────┴────┐
    │  Google Cloud / Gemini API          │
    │  • Model: gemini-3-flash            │
    │  • Bilingual support                │
    │  • Context-aware responses          │
    └─────────────────────────────────────┘
```

---

## 📦 Component Architecture

### Frontend Stack

| Component         | Technology      | Purpose                    |
| ----------------- | --------------- | -------------------------- |
| **UI Framework**  | React 19        | Component-based UI         |
| **Build Tool**    | Vite 6          | Fast dev server + bundling |
| **Styling**       | Tailwind CSS v4 | Utility-first CSS          |
| **Animations**    | Framer Motion   | Smooth transitions         |
| **Icons**         | Lucide React    | Professional icon set      |
| **Router**        | React Router v7 | Client-side routing        |
| **Notifications** | Sonner          | Toast messages             |
| **Components**    | Shadcn/ui       | Accessible UI primitives   |

### Backend Stack

| Component     | Technology          | Purpose                |
| ------------- | ------------------- | ---------------------- |
| **Runtime**   | Node.js (tsx)       | JavaScript runtime     |
| **Server**    | Express.js          | HTTP API framework     |
| **AI Client** | @google/genai       | Gemini API integration |
| **ORM**       | Prisma              | Database abstraction   |
| **Database**  | SQLite / PostgreSQL | Session persistence    |
| **Config**    | dotenv              | Environment management |

### Voice Components

| Component     | Technology            | Type           | Purpose              |
| ------------- | --------------------- | -------------- | -------------------- |
| **STT**       | SpeechRecognition API | Browser Native | User speech → text   |
| **TTS**       | SpeechSynthesis API   | Browser Native | Text → user audio    |
| **Recording** | MediaRecorder API     | Browser Native | Call session capture |

---

## 🔄 Data Flow

### Typical Call Flow

```
1. USER INITIATES CALL
   └─> Browser: Dial "800"
   └─> Frontend: setCallState("dialing")
   └─> UI: Show connecting animation (2s)
   └─> Frontend: setCallState("active")

2. ASSISTANT GREETS
   └─> Frontend: handleAssistantResponse(welcomeMsg)
   └─> Backend: /api/chat endpoint not called (pre-recorded)
   └─> Browser TTS: Speak welcome message
   └─> UI: Show waveform animation

3. USER SPEAKS
   └─> Browser: SpeechRecognition starts listening
   └─> Browser: User speaks (audio captured)
   └─> Frontend: recognition.onresult → transcript
   └─> State: messages = [..., {role: "user", content: transcript}]

4. AI PROCESSES
   └─> Frontend: POST /api/chat {text, language}
   └─> Backend: Receives request
   └─> Backend: Call Gemini API with system instruction
   └─> Gemini: Returns bilingual response
   └─> Backend: Send response to frontend

5. RESPONSE PLAYS
   └─> Frontend: handleAssistantResponse(aiResponse)
   └─> State: messages = [..., {role: "assistant", content}]
   └─> Browser TTS: Speak response with language-specific voice
   └─> UI: Waveform animates during speech

6. RECORDING CAPTURED (throughout)
   └─> Browser: MediaRecorder records audio stream
   └─> Browser: Creates Blob (WebM format)
   └─> Frontend: setRecordedAudioUrl(blob URL)

7. USER ENDS CALL
   └─> Frontend: handleEndCall() async
   └─> Frontend: Stop listening, stop TTS, stop recording
   └─> Recording: Convert blob to base64
   └─> Backend: POST /api/save-recording {audioData, sessionId}
   └─> Backend: Write WebM file to /recordings directory
   └─> Backend: Return recording path
   └─> Frontend: Navigate to /summary with call data
   └─> Summary: Display transcript, duration, playable recording
```

---

## 🔐 API Specifications

### POST /api/chat

**Purpose:** Process user input and get AI response

**Request:**

```json
{
  "text": "What are the admission requirements?",
  "language": "english"
}
```

**Response:**

```json
{
  "message": "The admission requirements for FUDMA include..."
}
```

**Error Handling:**

- `400`: Missing text or language
- `500`: AI service not configured or API error
- Falls back to generic error message on frontend

---

### POST /api/save-recording

**Purpose:** Persist call audio to server storage

**Request:**

```json
{
  "audioData": "base64_encoded_webm_audio",
  "sessionId": "abc123def456",
  "duration": 245
}
```

**Response:**

```json
{
  "success": true,
  "filename": "abc123def456-1715245901234.webm",
  "path": "/recordings/abc123def456-1715245901234.webm"
}
```

**File Storage:**

- Location: `{project_root}/recordings/`
- Format: WebM audio
- Naming: `{sessionId}-{timestamp}.webm`
- Access: Served via static `/recordings` route

---

## 🌐 Language Support

### Implementation Strategy

Rather than implementing complex multilingual NLP pipelines, language support is achieved through:

1. **Browser API Language Codes**

   ```typescript
   language === "english" → "en-US"
   language === "hausa"   → "ha-NG"
   language === "arabic"  → "ar-SA"
   ```

2. **Gemini System Instructions**
   - Explicit prompts for language selection
   - Clear instructions to respond in target language only
   - No code-switching or translation

3. **Voice Selection**
   - Attempts to find native speakers for each language
   - Falls back to language-matching voices
   - Preferred: Female voices for accessibility

### Limitations & Mitigations

| Challenge              | Approach                                              |
| ---------------------- | ----------------------------------------------------- |
| Hausa STT accuracy     | Accept browser API limits; provide clear instructions |
| Arabic rendering       | Use system fonts; test on target devices              |
| Voice availability     | Provide fallback to default language voice            |
| Context in non-English | System instructions handle language context           |

---

## 💾 Data Persistence

### Session Data

Stored in browser state during call:

```typescript
interface CallData {
  duration: number;
  sessionId: string;
  messageCount: number;
  transcript: Message[];
  recordedAudioUrl: string | null;
  recordingSaved: boolean;
  recordingPath?: string;
}
```

### Recording Files

Persisted on server:

- **Location:** `./recordings/`
- **Format:** WebM (audio/webm)
- **Retention:** Indefinite (can be pruned)
- **Access:** Via `/recordings/{filename}` static route

### Future: Database Integration (Prisma)

When expanded:

```sql
TABLE sessions
├── id (PK)
├── sessionId (unique)
├── startTime
├── endTime
├── duration
├── language
├── transcript (JSON)
├── recordingPath
└── metadata
```

---

## 🔧 Development Architecture

### Local Development Setup

```
npm run dev
├─> tsx server.ts (Backend on port 3000)
├─> Vite dev server (Frontend with HMR)
└─> Middleware mode: Vite handles /src requests
    Backend handles /api/* requests
```

### Production Build

```
npm run build
├─> Vite builds React app → ./dist
└─> npm start
    ├─> Express serves static files from ./dist
    └─> API routes available on same port
```

---

## 🛡️ Error Handling & Resilience

### Graceful Degradation

| Failure Point        | Behavior                        | User Impact                 |
| -------------------- | ------------------------------- | --------------------------- |
| No microphone        | Toast error; offer text input   | Low - can still interact    |
| STT fails            | Retry; show transcript field    | Low - fallback available    |
| API timeout          | Generic error message; continue | Medium - one response fails |
| TTS unavailable      | Silent response; show text      | Medium - no audio feedback  |
| Recording save fails | Warning toast; continue call    | Low - demo still works      |
| Internet loss        | Cannot contact Gemini           | High - core feature breaks  |

### Defensive Programming

```typescript
// Type safety
const endData: CallDataType = { ... }

// Null checks
if (recordedAudioUrl && !isRecording) { ... }

// Try-catch blocks
try { const response = await fetch(...) } catch { ... }

// Fallback messages
const message = response.text || "I'm sorry, I couldn't process that."

// Console logging for debugging
console.error("Recording save error:", error)
```

---

## 📊 Why This Architecture?

### Trade-offs Made

| Choice                    | Alternative           | Why This Choice                       |
| ------------------------- | --------------------- | ------------------------------------- |
| **Cloud AI (Gemini)**     | Local LLM (Ollama)    | Reliability, quality, simplicity      |
| **Browser Voice APIs**    | Whisper/Piper locally | No GPU needed, instant, free          |
| **File system storage**   | Database              | Simpler for MSc scope, audio-friendly |
| **Node.js orchestration** | Full Python backend   | Tighter frontend-backend coupling     |
| **WebM recording**        | WAV/MP3               | Browser native, good compression      |

### Academic Justification

> "Cloud-based AI services were adopted to reduce computational overhead and improve development efficiency within the scope of the study. This architectural choice prioritizes system reliability and user experience over local model optimization, allowing the research to concentrate on multi-modal interface design, accessibility features, and bilingual interaction patterns."

---

## 🚀 Scalability Considerations

### For Production (Post-MSc)

1. **Add Database Layer**
   - Replace file storage with PostgreSQL
   - Index sessions for retrieval

2. **Audio Processing**
   - Compress recordings (MP3 conversion)
   - Implement S3/cloud storage

3. **Monitoring**
   - Track API response times
   - Log errors and failures
   - User analytics

4. **Caching**
   - Cache common responses
   - Reduce Gemini API calls

5. **Advanced Features**
   - Sentiment analysis
   - Response quality scoring
   - Multi-session conversation history

---

## 📋 Component Responsibilities

### Frontend (`src/pages/CallSimulationPage.tsx`)

- ✅ Manage call lifecycle (idle → dialing → active → ended)
- ✅ Handle user speech input via SpeechRecognition API
- ✅ Call `/api/chat` for each user message
- ✅ Play responses via SpeechSynthesis API
- ✅ Record session audio via MediaRecorder
- ✅ Save recording via `/api/save-recording`
- ✅ Display UI feedback (waveforms, indicators, transcript)
- ✅ Language switching (English/Hausa/Arabic)

### Backend (`server.ts`)

- ✅ Receive `/api/chat` requests from frontend
- ✅ Call Gemini API with user context
- ✅ Return AI response to frontend
- ✅ Receive `/api/save-recording` requests
- ✅ Write WebM files to `./recordings/`
- ✅ Serve static recording files
- ✅ Serve frontend in production mode
- ✅ Handle errors gracefully

### Browser APIs

- ✅ **SpeechRecognition:** Convert voice → text
- ✅ **SpeechSynthesis:** Convert text → voice
- ✅ **MediaRecorder:** Capture audio stream
- ✅ **FileReader:** Convert blobs to base64

---

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] English conversation flow works
- [ ] Language switching (press 1 for Hausa, 2 for Arabic)
- [ ] Recording starts/stops correctly
- [ ] Recording file saves to server
- [ ] Recording playable from summary page
- [ ] Network error handling works
- [ ] Responsive on mobile/tablet
- [ ] Accessibility (keyboard navigation, screen reader compatibility)

### Demo Scenarios

1. **Basic Inquiry** (English)
   - User: "What courses do you offer?"
   - System: Lists sample courses
   - Recording: Captured successfully

2. **Language Switching** (English → Hausa)
   - User: "Press 1"
   - System: "Hausa protocol initialized"
   - Subsequent responses in Hausa

3. **Extended Conversation** (5+ exchanges)
   - Demonstrates call duration tracking
   - Shows transcript growth
   - Recording persists

---

## 📚 References & Academic Positioning

### Design Paradigm

- **Multi-modal Interfaces:** Speech-based interaction for accessibility (WCAG 2.1)
- **Cloud APIs:** Microservices architecture reducing deployment complexity
- **User-Centered Design:** Accessibility prioritized over technical complexity

### Technologies Justified

- **Gemini API:** Industry-standard LLM with free tier
- **Browser APIs:** Native platform capabilities eliminating additional dependencies
- **Node.js:** Lightweight middleware between frontend and cloud services

### Scope Boundaries

This system is **not** a research project in:

- Machine learning model training
- NLP algorithm development
- Speech processing research

It **is** a systems integration project in:

- Multi-modal interface design
- Accessibility and localization
- Voice-based UX for developing regions
- Educational technology deployment

---

## 🎓 For Thesis/Dissertation

### Suggested Abstract Language

> "This work presents Aivon, a cloud-based multi-modal voice assistant for higher education institutions in resource-constrained environments. The system integrates browser-native speech APIs with Google Gemini LLM to deliver bilingual student support through a telecom-inspired interface. The architecture prioritizes accessibility and reliability over computational complexity, demonstrating the feasibility of production-quality voice assistants for emerging markets."

---

## 📞 Support & Maintenance

### Common Issues

| Issue                    | Solution                                  |
| ------------------------ | ----------------------------------------- |
| API key missing          | Set `GEMINI_API_KEY` in `.env`            |
| Recording not saving     | Check `/recordings` directory permissions |
| Hausa STT not working    | Verify browser language settings          |
| TTS voice not found      | Fallback voice will be used               |
| Port 3000 already in use | `lsof -ti:3000 \| xargs kill`             |

---

**Document Version:** 1.0  
**Last Updated:** May 8, 2026  
**Status:** Active (Production-Ready)
