import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, PhoneOff, Globe, Volume2, User, MessageCircle, Network } from "lucide-react";
import DialPad from "@/components/DialPad";
import Waveform from "@/components/Waveform";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { GoogleGenAI } from "@google/genai";

type CallState = "idle" | "dialing" | "active" | "ended";
type Language = "english" | "hausa";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CallSimulationPage() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [language, setLanguage] = useState<Language>("english");
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiRef = useRef<any>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }, []);

  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      handleAssistantResponse(
        language === "english" 
          ? "Aivon here. How can I assist you with your FUDMA studies today?" 
          : "Aivon ne. Ta yaya zan iya taimaka muku da karatun ku na FUDMA a yau?"
      );
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const handleDial = (number: string) => {
    if (number === "800") {
      setCallState("dialing");
      setTimeout(() => setCallState("active"), 2000);
    } else {
      alert("Invalid number. Please dial 800 for Aivon.");
    }
  };

  const handleEndCall = () => {
    setCallState("ended");
    stopListening();
    window.speechSynthesis.cancel();
    setTimeout(() => {
      setCallState("idle");
      setMessages([]);
    }, 3000);
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "english" ? "en-US" : "ha-NG";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => [...prev, { role: "user", content: transcript }]);
      processInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const processInput = async (text: string) => {
    if (!aiRef.current) return;
    setIsThinking(true);
    try {
      const systemInstruction = `
        You are Aivon (AI Voice of Network), a premium AI telecom assistant for the Federal University Dutsin-Ma (FUDMA).
        Your goal is to assist students with their academic and administrative queries.
        Current Language: ${language}.
        If language is hausa, respond strictly in Hausa.
        If language is english, respond strictly in English.
        Be concise, supportive, and professional.
        Focus on student registration, courses, campus life, and general inquiries.
      `;

      const model = aiRef.current.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
      });

      const result = await model.generateContent(text);
      const response = await result.response;
      const assistantMessage = response.text() || "I'm sorry, I couldn't process that.";
      handleAssistantResponse(assistantMessage);

    } catch (error) {
      console.error(error);
      handleAssistantResponse("Sorry, system network error.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleAssistantResponse = (text: string) => {
    setMessages(prev => [...prev, { role: "assistant", content: text }]);
    speak(text);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "english" ? "en-US" : "ha-NG";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex-grow flex flex-col items-center">
      <AnimatePresence mode="wait">
        {callState === "idle" && (
          <motion.div
            key="dialer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex flex-col items-center py-12"
          >
            <h2 className="text-[10px] font-bold mb-8 text-text-secondary uppercase tracking-[4px]">Network: FUDMA Node-01</h2>
            <DialPad onDial={handleDial} />
            <p className="mt-8 text-white/20 text-xs font-mono tracking-widest uppercase">Dial 800 for Aivon Voice Assistant</p>
          </motion.div>
        )}

        {(callState === "dialing" || callState === "active" || callState === "ended") && (
          <motion.div
            key="call"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full lg:grid lg:grid-cols-[280px_1fr_280px] gap-6"
          >
            {/* Left: Call Controls */}
            <aside className="bg-surface border border-border rounded-[32px] p-6 flex flex-col gap-6 backdrop-blur-xl mb-6 lg:mb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Line 01</span>
                <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">
                  {callState.toUpperCase()}
                </Badge>
              </div>
              
              <div className="bg-white/5 p-1 rounded-2xl flex">
                <button 
                  onClick={() => setLanguage("english")}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
                    language === "english" ? "bg-accent text-white" : "text-text-secondary hover:text-white"
                  )}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage("hausa")}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
                    language === "hausa" ? "bg-accent text-white" : "text-text-secondary hover:text-white"
                  )}
                >
                  Hausa
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-4 block">Quick Actions</span>
                <div className="flex flex-col gap-2">
                  {["Course Registration", "Exam Schedule", "Department Info"].map(action => (
                    <button key={action} className="text-left px-4 py-3 rounded-xl bg-white/5 border border-border text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-all">
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex gap-3">
                  <Button 
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? "destructive" : "outline"}
                    className="flex-1 rounded-xl h-12 border-border"
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button 
                    onClick={handleEndCall}
                    className="bg-red-500 hover:bg-red-600 text-white flex-1 rounded-xl h-12 shadow-lg shadow-red-500/20"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </aside>

            {/* Middle: AI Orb & Stage */}
            <main className="bg-gradient-to-b from-[#1a2e1a]/30 to-bg border border-border rounded-[40px] p-12 flex flex-col items-center justify-center gap-12 relative overflow-hidden min-h-[500px]">
              <div className="text-center">
                <div className="font-mono text-5xl tracking-[4px] font-bold text-white mb-2">
                  {formatDuration(duration)}
                </div>
                <div className="text-[10px] uppercase tracking-[4px] text-accent animate-pulse">● Active Connection</div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full scale-125 transition-transform duration-1000 group-hover:scale-150" />
                <div className={cn(
                  "relative w-48 h-48 rounded-full border-2 border-accent transition-all duration-500 flex items-center justify-center shadow-[0_0_50px_var(--color-accent-glow)] bg-[#050505]/50 backdrop-blur-sm",
                  isThinking && "scale-110",
                  isSpeaking && "border-white"
                )}>
                  <Waveform isActive={isSpeaking || isThinking} color={isSpeaking ? "#fff" : "#228B22"} count={12} />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Aivon Assistant</h2>
                <p className="text-text-secondary text-sm">
                  {isThinking ? "Processing network protocols..." : isSpeaking ? "Transmitting response..." : "Listening for student inquiry..."}
                </p>
              </div>
            </main>

            {/* Right: Transcript */}
            <aside className="bg-surface border border-border rounded-[32px] overflow-hidden flex flex-col backdrop-blur-xl h-full">
              <div className="px-6 py-4 border-b border-border bg-white/5 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Live Transcript</span>
              </div>
              <ScrollArea className="flex-grow p-6">
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="h-40 flex items-center justify-center text-white/20 italic text-xs">
                      Connecting to FUDMA Node...
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col",
                        m.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed",
                        m.role === 'user' 
                          ? "bg-white/5 border border-border rounded-tr-none text-text-secondary" 
                          : "bg-accent/10 border border-accent/20 rounded-tl-none text-white shadow-sm"
                      )}>
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                  {isThinking && (
                    <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase font-bold tracking-widest animate-pulse">
                      Aivon is processing
                    </div>
                  )}
                </div>
              </ScrollArea>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
