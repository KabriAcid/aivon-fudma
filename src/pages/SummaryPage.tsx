import { motion } from "motion/react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2, Clock, MessageSquare, Phone, ArrowRight, Share2, Download, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SummaryPage() {
  const location = useLocation();
  const data = location.state as { 
    duration: number; 
    sessionId: string; 
    messageCount: number;
    transcript: any[];
    recordedAudioUrl?: string | null;
  };

  if (!data) return <Navigate to="/" />;

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-accent/30"
      >
        <CheckCircle2 className="w-10 h-10 text-accent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Connection Terminated</h1>
        <p className="text-text-secondary">Your session with Aivon Node-01 has been securely logged.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full mb-12">
        <div className="bg-white/5 border border-border p-6 rounded-[32px] flex flex-col items-center">
          <Clock className="w-5 h-5 text-accent mb-2" />
          <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Duration</span>
          <span className="text-2xl font-mono font-bold">{formatDuration(data.duration)}</span>
        </div>
        <div className="bg-white/5 border border-border p-6 rounded-[32px] flex flex-col items-center">
          <MessageSquare className="w-5 h-5 text-accent mb-2" />
          <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Exchanges</span>
          <span className="text-2xl font-mono font-bold">{data.messageCount}</span>
        </div>
      </div>

      <div className="w-full bg-white/5 border border-border rounded-[40px] p-8 mb-12">
        <h3 className="text-sm font-bold uppercase tracking-[2px] mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          Protocol Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm py-2 border-b border-border">
            <span className="text-text-secondary">Session ID</span>
            <span className="font-mono text-xs uppercase">{data.sessionId}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-border">
            <span className="text-text-secondary">Encryption</span>
            <span className="font-mono text-xs text-accent">AES-256 ACTIVE</span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span className="text-text-secondary">Signal Strength</span>
            <span className="font-mono text-xs">99.8% STABLE</span>
          </div>
        </div>
      </div>

      {data.recordedAudioUrl && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-accent/5 border border-accent/20 rounded-[40px] p-8 mb-12 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Session Recording</h3>
              <p className="text-[10px] text-text-secondary uppercase">Secure Voice Capture</p>
            </div>
          </div>
          
          <audio controls className="w-full h-10 filter invert opacity-80">
            <source src={data.recordedAudioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>

          <a 
            href={data.recordedAudioUrl} 
            download={`aivon-session-${data.sessionId}.webm`}
            className="w-full"
          >
            <Button variant="outline" className="w-full h-12 rounded-2xl border-accent/20 hover:bg-accent/10 hover:border-accent/40 text-accent font-bold gap-2">
              <Download className="w-4 h-4" />
              Download Recording
            </Button>
          </a>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Link to="/call" className="flex-1">
          <Button className="w-full h-14 rounded-2xl bg-accent hover:opacity-90 font-bold">
            Start New Session
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button variant="outline" className="w-full h-14 rounded-2xl border-border hover:bg-white/5 font-bold">
            Return Home
          </Button>
        </Link>
      </div>

      <Button variant="ghost" className="mt-8 text-text-secondary text-xs uppercase tracking-widest flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Export Interaction Log
      </Button>
    </div>
  );
}
