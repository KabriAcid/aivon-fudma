# Aivon (AI Voice of Network)

Aivon is a premium, production-quality AI voice assistant system designed for the Federal University Dutsin-Ma (FUDMA). It provides bilingual (English & Hausa) student support through a simulated telecom voice interaction experience.

## Features

- **Premium Telecom UI**: Sleek, futuristic dark-themed interface with glassmorphism and soft glow effects.
- **Voice Simulation**: Dial 800 to interact with Aivon using browser-native Speech-to-Text and Text-to-Speech.
- **Bilingual Intelligence**: Supports queries in both English and Hausa, powered by Google Gemini AI.
- **Real-time Visualization**: Animated waveforms and live transcripts track the conversation flow.
- **Architectural Transparency**: Detailed visualization of the AI pipeline and system infrastructure.
- **Persistence**: Conversation history and sessions are stored using Prisma and SQLite.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, Shadcn UI.
- **Backend**: Express.js, Prisma ORM, SQLite.
- **AI**: Google Gemini 3 Flash (via @google/genai).
- **Icons**: Lucide React.
- **Voice**: Web Speech API (SpeechRecognition & SpeechSynthesis).

## Setup & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   DATABASE_URL="file:./dev.db"
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Usage

1. Open the application.
2. Navigate to the **Simulation** page.
3. Use the dial pad to dial **800**.
4. Once the call is active, click the **Microphone** icon to speak.
5. Select your preferred language (English/Hausa) from the language selector.
6. Aivon will process your speech, display it in the transcript, and respond with synthesized voice.

---

*Note: This is a simulation environment and does not involve real telecom routing or PSTN integration.*
