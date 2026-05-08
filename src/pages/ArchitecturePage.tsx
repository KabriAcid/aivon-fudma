import { motion } from "motion/react";
import { Mic, Cpu, MessageSquare, Volume2, Network, Server, Database, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ArchitecturePage() {
  const steps = [
    {
      icon: Mic,
      title: "Speech-to-Text (STT)",
      desc: "Captures bilingual audio (English/Hausa) and converts it to text using browser-native Web Speech API.",
      color: "#3b82f6"
    },
    {
      icon: Cpu,
      title: "AI Processing (LLM)",
      desc: "Gemini 3 Flash processes student queries with bilingual context and academic knowledge.",
      color: "#228B22"
    },
    {
      icon: MessageSquare,
      title: "NLS & Context",
      desc: "Handles linguistic nuances between English and Hausa to ensure accurate understanding.",
      color: "#8b5cf6"
    },
    {
      icon: Volume2,
      title: "Text-to-Speech (TTS)",
      desc: "Converts AI response back to synthesized voice for a natural telecom experience.",
      color: "#f59e0b"
    }
  ];

  const infrastructure = [
    { icon: Network, title: "Telecom Sim", desc: "Dial 800 simulation interface" },
    { icon: Server, title: "Backend Engine", desc: "Node.js service orchestration" },
    { icon: Database, title: "Prisma DB", desc: "Session & transcript persistence" },
    { icon: Globe, title: "FUDMA Hub", desc: "Institutional knowledge base" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-24">
        <span className="text-[10px] font-bold uppercase tracking-[4px] text-accent mb-4 block">System Blueprints</span>
        <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">System Architecture</h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
          Deep dive into the Aivon ecosystem: How audio flows through our AI pipeline to provide seamless student support.
        </p>
      </div>

      {/* AI Pipeline Flow */}
      <div className="relative mb-32 group">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2 hidden md:block" />
        <div className="grid md:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <Card className="bg-surface border-border p-8 rounded-[32px] hover:bg-white/5 transition-all z-10 relative h-full flex flex-col items-center text-center backdrop-blur-xl group/card shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-2xl -z-10 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover/card:scale-110 duration-500" style={{ backgroundColor: `${step.color}15` }}>
                  <step.icon className="w-8 h-8" style={{ color: step.color }} />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                <div className="mt-8 text-[9px] font-bold uppercase tracking-[3px] text-white/10">Protocol 0{i+1}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Infrastructure Components */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-black mb-10 flex items-center gap-4 tracking-tight">
            <Server className="text-accent w-10 h-10" />
            Core Infrastructure
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {infrastructure.map((item, i) => (
              <div key={i} className="bg-surface border border-border p-8 rounded-3xl hover:border-accent/40 transition-colors">
                <item.icon className="w-6 h-6 text-text-secondary mb-4" />
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">{item.title}</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-border rounded-[48px] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] -z-10" />
          <h3 className="text-3xl font-bold mb-8 tracking-tight">Simulation Layer</h3>
          <p className="text-text-secondary mb-10 italic text-lg leading-relaxed">
            "Aivon operates on a conceptual Asterisk layer for telecom routing, while utilizing a modern web stack for the visual and AI orchestration."
          </p>
          <div className="grid gap-4">
            {[
              { label: "Session Persistence", color: "bg-accent" },
              { label: "Multi-modal AI Pipeline", color: "bg-blue-500" },
              { label: "Bilingual Hausa support", color: "bg-purple-500" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-5 text-sm bg-bg border border-border p-5 rounded-2xl shadow-sm">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", feature.color)} />
                <span className="font-bold uppercase tracking-[2px] text-[10px] text-text-secondary">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
