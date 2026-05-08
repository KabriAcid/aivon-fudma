import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, PhoneOff, Globe, Volume2, User, MessageCircle, Network, ChevronLeft, Speaker, Disc, LayoutList, GripVertical, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
type Language = "english" | "hausa" | "arabic";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CallSimulationPageProps {
  onCallStateChange?: (isActive: boolean) => void;
}

export default function CallSimulationPage({ onCallStateChange }: CallSimulationPageProps) {
  const navigate = useNavigate();
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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [showKeypad, setShowKeypad] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTranscript && messages.length > 0) {
      const anchor = document.getElementById("anchor");
      anchor?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showTranscript, isThinking]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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
        ? "Welcome to Federal University Dutsin-Ma Voice Assistant. To continue in Hausa, press 1. For Arabic, press 2. How can I assist you with your studies today?" 
        : language === "hausa" 
          ? "Barka da zuwa mataimakin muryar Jami'ar Dutsin-Ma. Don ci gaba da Hausa, danna daya. Domin Larabci, danna biyu."
          : "أهلاً بك في مساعد صوت جامعة دوتسين-ما الفيدرالية. للاستمرار في الهوسا، اضغط ١. للعربية، اضغط ٢.";
      
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
      setRecordingDuration(0);
    }
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [callState, onCallStateChange]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        toast.success("Recording started", { description: "Capturing session audio..." });
      } catch (err) {
        console.error("Failed to start recording:", err);
        toast.error("Recording error", { description: "Microphone access is required." });
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      toast.info("Recording saved", { description: "Session audio stored in memory." });
    }
  };

  const handleDial = (number: string) => {
    if (callState === "active") {
      if (number === "1" || number.endsWith("1")) {
        setLanguage("hausa");
        const msg = "Hausa protocol initialized. Ta yaya zan iya taimaka muku da karatun ku na FUDMA a yau?";
        handleAssistantResponse(msg);
        setShowKeypad(false);
      } else if (number === "2" || number.endsWith("2")) {
        setLanguage("arabic");
        const msg = "Arabic protocol initialized. مرحباً بكم في مساعد جامعة FUDMA الصوتي. كيف يمكنني مساعدتكم اليوم؟";
        handleAssistantResponse(msg);
        setShowKeypad(false);
      }
      return;
    }

    if (number === "800") {
      setCallState("dialing");
      setTimeout(() => setCallState("active"), 2000);
    } else {
      toast.error("Invalid frequency. Please dial 800 for Aivon Voice Assistant.", {
        description: "Protocol mismatch detected."
      });
    }
  };

  const handleEndCall = () => {
    const endData = {
      duration,
      sessionId,
      messageCount: messages.length,
      transcript: messages,
      recordedAudioUrl
    };
    
    setCallState("ended");
    setHasGreeted(false);
    if (isRecording) {
      toggleRecording();
    }
    stopListening();
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      navigate("/summary", { state: endData });
      setCallState("idle");
      setMessages([]);
    }, 1500);
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported", { description: "Please use a modern browser for voice features." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "english" ? "en-US" : language === "hausa" ? "ha-NG" : "ar-SA";
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
        If language is arabic, respond strictly in Arabic.
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
    
    // Attempt to find a female voice
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;

    if (language === "hausa") {
      utterance.lang = "ha-NG";
      // Look for a voice that might be Hausa or generic female
      preferredVoice = voices.find(v => 
        (v.lang.startsWith("ha") || v.name.toLowerCase().includes("female")) && 
        v.name.toLowerCase().includes("female")
      ) || voices.find(v => v.lang.startsWith("ha"));
    } else if (language === "arabic") {
      utterance.lang = "ar-SA";
      preferredVoice = voices.find(v => v.lang.startsWith("ar") && v.name.toLowerCase().includes("female")) || 
                       voices.find(v => v.lang.startsWith("ar"));
    } else {
      utterance.lang = "en-US";
      preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 1.1; // Slightly higher pitch for female-leaning sound if default is used
    utterance.rate = 0.95; // Clearer pace

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={cn(
      "max-w-7xl mx-auto px-4 w-full flex-grow flex flex-col items-center justify-center transition-all duration-500",
      callState === 'active' || callState === 'dialing' ? "h-screen bg-[#050505] overflow-hidden fixed inset-0 z-30 px-6 py-8 md:px-12" : "py-8"
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
              "w-full h-full mx-auto flex flex-col transition-all duration-700",
              showTranscript 
                ? "max-w-6xl lg:grid lg:grid-cols-[1fr_450px] gap-12" 
                : "max-w-2xl flex-col"
            )}
          >
            {/* Top info bar */}
            <div className="flex justify-between items-center w-full py-4 mb-4">
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

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col items-center justify-center w-full">
              {/* Main Stage */}
              <main className="w-full bg-transparent flex flex-col items-center justify-center gap-6 md:gap-8 relative overflow-hidden backdrop-blur-3xl transition-all">
                <div className="text-center">
                  <div className="font-mono text-4xl md:text-5xl lg:text-6xl tracking-tight font-bold text-white mb-2 transition-all">
                    {formatDuration(duration)}
                  </div>
                  <div className="text-[10px] uppercase tracking-[6px] text-accent font-bold opacity-30">
                     ENCRYPTED SIGNAL
                  </div>
                  {isRecording && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center justify-center gap-2 text-red-500 font-mono text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      REC {formatDuration(recordingDuration)}
                    </motion.div>
                  )}
                </div>
 
                <div className="relative group">
                  <div className="absolute inset-0 bg-accent/10 blur-[80px] rounded-full scale-110 transition-transform duration-1000 group-hover:scale-125" />
                  <div className={cn(
                    "relative w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-full border border-white/5 transition-all duration-700 flex items-center justify-center bg-white/[0.02] backdrop-blur-2xl",
                    isThinking && "scale-105",
                    isSpeaking && "scale-110 bg-accent/5 border-accent/20 shadow-[0_0_60px_var(--color-accent-glow)]"
                  )}>
                    <Waveform isActive={isSpeaking || isThinking} color={isSpeaking ? "#fff" : "#228B22"} count={16} />
                  </div>
                </div>

                <div className="text-center w-full">
                  {/* Action Grid */}
                  <div className="grid grid-cols-3 gap-6 md:gap-8 w-fit mx-auto p-2">
                     <Button 
                       variant="ghost"
                       onClick={() => setIsMuted(!isMuted)}
                       className={cn(
                         "flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-border transition-all p-0",
                         isMuted ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5 text-text-secondary hover:text-white"
                       )}
                     >
                       {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                     </Button>

                     <Button 
                       variant="ghost"
                       onClick={() => setShowKeypad(true)}
                       className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-border bg-white/5 text-text-secondary hover:text-white transition-all p-0"
                     >
                       <Hash className="w-5 h-5 md:w-6 md:h-6" />
                     </Button>

                     <Button 
                       variant="ghost"
                       onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                       className={cn(
                         "flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-border transition-all p-0",
                         isSpeakerOn ? "bg-accent/20 text-accent border-accent/30" : "bg-white/5 text-text-secondary hover:text-white"
                       )}
                     >
                       <Speaker className="w-5 h-5 md:w-6 md:h-6" />
                     </Button>

                     <Button 
                       variant="ghost"
                       onClick={toggleRecording}
                       className={cn(
                         "flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-border transition-all p-0",
                         isRecording ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-white/5 text-text-secondary hover:text-white"
                       )}
                     >
                       <Disc className={cn("w-5 h-5 md:w-6 md:h-6", isRecording && "animate-pulse")} />
                     </Button>

                     <Button 
                       variant="ghost"
                       onClick={() => setShowTranscript(!showTranscript)}
                       className={cn(
                         "flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-border transition-all p-0",
                         showTranscript ? "bg-accent/20 text-accent border-accent/30" : "bg-white/5 text-text-secondary hover:text-white"
                       )}
                     >
                       <LayoutList className="w-5 h-5 md:w-6 md:h-6" />
                     </Button>

                     <Button 
                       onClick={() => setShowConfirmCancel(true)}
                       className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl shadow-red-500/30 p-0"
                     >
                       <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
                     </Button>
                  </div>
                </div>
              </main>
            </div>

            <AnimatePresence>
              {showTranscript && (
                <motion.aside 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "flex flex-col bg-surface/40 border border-border rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl transition-all",
                    "lg:h-[650px] w-full",
                    !showTranscript && "hidden"
                  )}
                >
                  <div className="px-6 py-5 border-b border-border bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Network Stream</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowTranscript(false)} className="h-6 w-6 p-0 text-text-secondary hover:text-white">
                      ×
                    </Button>
                  </div>
                  <ScrollArea className="flex-grow p-6">
                    <div className="space-y-6 pb-4">
                      {messages.length === 0 && (
                        <div className="h-60 flex flex-col items-center justify-center text-white/10 italic text-xs gap-4">
                          <Disc className="w-12 h-12 opacity-10 animate-spin-slow" />
                          Awaiting Neural Handshake...
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
                          <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-2">
                            {m.role === 'user' ? 'Student' : 'Aivon Node-01'}
                          </span>
                          <div className={cn(
                            "max-w-[95%] px-5 py-4 rounded-3xl text-[14px] leading-relaxed shadow-lg",
                            m.role === 'user' 
                              ? "bg-white/5 border border-border rounded-tr-none text-text-secondary" 
                              : "bg-accent/10 border border-accent/20 rounded-tl-none text-white ring-1 ring-accent/5"
                          )}>
                            {m.content}
                          </div>
                        </motion.div>
                      ))}
                      {isThinking && (
                        <div className="flex items-center gap-3 text-accent text-[10px] uppercase font-bold tracking-[2px] animate-pulse">
                          <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-accent animate-bounce" />
                            <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                          </div>
                          Processing Protocol
                        </div>
                      )}
                      <div id="anchor" />
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
