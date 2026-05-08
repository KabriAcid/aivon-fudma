import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, PhoneOff, Globe, Volume2, User, MessageCircle, Network, ChevronLeft, Speaker, Disc, LayoutList, GripVertical, Hash } from "lucide-react";
import DialPad from "@/components/DialPad";
import Waveform from "@/components/Waveform";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { GoogleGenAI } from "@google/genai";

type CallState = "idle" | "dialing" | "active" | "ended";
type Language = "english" | "hausa";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CallSimulationPageProps {
  onCallStateChange?: (isActive: boolean) => void;
}

export default function CallSimulationPage({ onCallStateChange }: CallSimulationPageProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [language, setLanguage] = useState<Language>("english");
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiRef = useRef<any>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (callState === "active") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [callState]);

  useEffect(() => {
    onCallStateChange?.(callState === "active" || callState === "dialing");

    if (callState === "active" || callState === "dialing") {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    if (callState === "active" && !hasGreeted) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      const welcomeMsg = language === "english" 
        ? "Welcome to Federal University Dutsin-Ma Voice Assistant. To continue in Hausa, press 1. How can I assist you with your studies today?" 
        : "Barka da zuwa mataimakin muryar Jami'ar Dutsin-Ma. Don ci gaba da Hausa, danna daya. Ta yaya zan taimake ku da karatun ku yau?";
      
      handleAssistantResponse(welcomeMsg);
      setHasGreeted(true);
    } else if (callState === "active") {
      // Just keep timer if already greeted
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState, onCallStateChange]);

  const handleDial = (number: string) => {
    if (callState === "active") {
      if (number.endsWith("1")) {
        setLanguage("hausa");
      }
      return;
    }

    if (number === "800") {
      setCallState("dialing");
      setTimeout(() => setCallState("active"), 2000);
    } else {
      alert("Invalid number. Please dial 800 for Aivon.");
    }
  };

  const handleEndCall = () => {
    setCallState("ended");
    setHasGreeted(false);
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
    <div className={cn(
      "max-w-7xl mx-auto px-4 w-full flex-grow flex flex-col items-center justify-center transition-all duration-500 overflow-hidden",
      callState === 'active' || callState === 'dialing' ? "h-screen bg-[#050505] overflow-hidden fixed inset-0 z-[100] px-8 py-12" : "py-8"
    )}>
      <AnimatePresence mode="wait">
        {callState === "idle" && (
          <motion.div
            key="dialer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex flex-col items-center py-12"
          >
            <div className="w-full max-w-xs flex justify-start mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-text-secondary hover:text-white group"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </div>
            <h2 className="text-[10px] font-bold mb-8 text-text-secondary uppercase tracking-[4px]">Network: FUDMA Node-01</h2>
            <DialPad onDial={handleDial} />
            <p className="mt-8 text-white/20 text-xs font-mono tracking-widest uppercase">Dial 800 for Aivon Voice Assistant</p>
          </motion.div>
        )}

        {(callState === "dialing" || callState === "active" || callState === "ended") && (
          <motion.div
            key="call"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "w-full h-full max-w-5xl mx-auto relative flex flex-col items-center justify-center transition-all duration-700",
              showTranscript ? "lg:grid lg:grid-cols-[1fr_400px] gap-8" : "max-w-2xl"
            )}
          >
            {/* Top info bar */}
            <div className="absolute top-8 left-0 right-0 flex justify-between items-center px-6 w-full z-10">
               <Button 
                variant="ghost" 
                size="sm" 
                className="text-text-secondary hover:text-white rounded-xl bg-white/5 border border-border group"
                onClick={() => setShowConfirmCancel(true)}
              >
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
              <div className="bg-white/5 px-4 py-2 rounded-2xl border border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-[2px]">Line Security Active</span>
              </div>
            </div>

            {/* Main Stage */}
            <main className="w-full bg-transparent p-4 lg:p-8 flex flex-col items-center justify-center gap-12 relative overflow-hidden h-full backdrop-blur-3xl transition-all">
              <div className="text-center">
                <div className="font-mono text-7xl md:text-8xl lg:text-9xl tracking-tighter font-bold text-white mb-4 transition-all">
                  {formatDuration(duration)}
                </div>
                <div className="text-[10px] uppercase tracking-[8px] text-accent font-bold opacity-30 ml-2">
                   ENCRYPTED SIGNAL
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-accent/10 blur-[120px] rounded-full scale-110 transition-transform duration-1000 group-hover:scale-125" />
                <div className={cn(
                  "relative w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-full border border-white/5 transition-all duration-700 flex items-center justify-center bg-white/[0.02] backdrop-blur-2xl",
                  isThinking && "scale-105",
                  isSpeaking && "scale-110 bg-accent/5 border-accent/20 shadow-[0_0_100px_var(--color-accent-glow)]"
                )}>
                  <Waveform isActive={isSpeaking || isThinking} color={isSpeaking ? "#fff" : "#228B22"} count={24} />
                </div>
              </div>

              <div className="text-center w-full">
                {/* Action Grid */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-sm mx-auto p-4">
                   <Button 
                     variant="ghost"
                     onClick={() => setIsMuted(!isMuted)}
                     className={cn(
                       "flex items-center justify-center w-full aspect-square rounded-full border border-border transition-all",
                       isMuted ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5 text-text-secondary hover:text-white"
                     )}
                   >
                     {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                   </Button>

                   <Button 
                     variant="ghost"
                     onClick={() => setShowKeypad(true)}
                     className="flex items-center justify-center w-full aspect-square rounded-full border border-border bg-white/5 text-text-secondary hover:text-white transition-all"
                   >
                     <Hash className="w-6 h-6" />
                   </Button>

                   <Button 
                     variant="ghost"
                     onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                     className={cn(
                       "flex items-center justify-center w-full aspect-square rounded-full border border-border transition-all",
                       isSpeakerOn ? "bg-accent/20 text-accent border-accent/30" : "bg-white/5 text-text-secondary hover:text-white"
                     )}
                   >
                     <Speaker className="w-6 h-6" />
                   </Button>

                   <Button 
                     variant="ghost"
                     onClick={() => setIsRecording(!isRecording)}
                     className={cn(
                       "flex items-center justify-center w-full aspect-square rounded-full border border-border transition-all",
                       isRecording ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-white/5 text-text-secondary hover:text-white"
                     )}
                   >
                     <Disc className={cn("w-6 h-6", isRecording && "animate-pulse")} />
                   </Button>

                   <Button 
                     variant="ghost"
                     onClick={() => setShowTranscript(!showTranscript)}
                     className={cn(
                       "flex items-center justify-center w-full aspect-square rounded-full border border-border transition-all",
                       showTranscript ? "bg-accent/20 text-accent border-accent/30" : "bg-white/5 text-text-secondary hover:text-white"
                     )}
                   >
                     <LayoutList className="w-6 h-6" />
                   </Button>

                   <Button 
                     onClick={() => setShowConfirmCancel(true)}
                     className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center w-full aspect-square rounded-full shadow-2xl shadow-red-500/30"
                   >
                     <PhoneOff className="w-6 h-6" />
                   </Button>
                </div>
              </div>
            </main>

            {/* Transcript (Side Panel / Mobile Below) */}
            <AnimatePresence>
              {showTranscript && (
                <motion.aside 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "flex flex-col bg-surface border border-border rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl transition-all",
                    "lg:h-[700px] w-full",
                    !showTranscript && "hidden"
                  )}
                >
                  <div className="px-6 py-5 border-b border-border bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Network History</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowTranscript(false)} className="h-6 w-6 p-0 text-text-secondary">
                      ×
                    </Button>
                  </div>
                  <ScrollArea className="flex-grow p-6 min-h-[300px]">
                    <div className="space-y-6">
                      {messages.length === 0 && (
                        <div className="h-60 flex flex-col items-center justify-center text-white/10 italic text-xs gap-4">
                          <Disc className="w-12 h-12 opacity-10 animate-spin-slow" />
                          Awaiting Signal Initialization...
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
                            "max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                            m.role === 'user' 
                              ? "bg-white/5 border border-border rounded-tr-none text-text-secondary" 
                              : "bg-accent/10 border border-accent/20 rounded-tl-none text-white"
                          )}>
                            {m.content}
                          </div>
                        </motion.div>
                      ))}
                      {isThinking && (
                        <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase font-bold tracking-[2px] animate-pulse">
                          <Disc className="w-3 h-3 animate-spin" />
                          Aivon Processing Data
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </motion.aside>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleEndCall}
        title="Cancel Call?"
        description="This will disconnect the secure network link and end the session."
        confirmText="End Session"
        cancelText="Stay Connected"
        variant="destructive"
      />

      <Dialog open={showKeypad} onOpenChange={setShowKeypad}>
        <DialogContent className="bg-surface/90 backdrop-blur-xl border-border max-w-sm rounded-[40px] p-8">
          <div className="flex flex-col items-center">
            <h2 className="text-[10px] font-bold mb-6 text-text-secondary uppercase tracking-[4px]">In-Call Keypad</h2>
            <DialPad onDial={(val) => {
              handleDial(val);
              // if it's a single digit dial from in-call modal, we might want to stay open or close
            }} />
            <Button variant="ghost" className="mt-6 text-text-secondary uppercase text-[10px] tracking-widest" onClick={() => setShowKeypad(false)}>
              Close Keypad
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
