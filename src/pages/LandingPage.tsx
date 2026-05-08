import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Phone, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import Waveform from "@/components/Waveform";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/10 blur-[120px] rounded-full -z-10" />

      <section className="pt-24 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-[3px] uppercase mb-6">
              Next-Gen Student Support
            </span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
              AI Voice of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">
                FUDMA Network
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-text-secondary text-lg md:text-xl mb-12">
              Bilingual AI assistant designed to streamline student interaction through a premium telecom-inspired voice experience.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/call">
                <Button size="lg" className="bg-accent hover:opacity-90 text-white px-10 rounded-full h-14 text-[13px] font-bold uppercase tracking-[2px] shadow-[0_0_30px_var(--color-accent-glow)] transition-all">
                  Dial 800 Now
                  <Phone className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" size="lg" className="border-border hover:bg-white/5 rounded-full h-14 px-10 text-[13px] font-bold uppercase tracking-[2px] transition-all text-text-secondary">
                  Documentation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-32 bg-surface rounded-[48px] border border-border p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] -z-10" />
            <div className="grid md:grid-cols-2 gap-16 items-center text-left">
              <div>
                <h2 className="text-4xl font-bold mb-8 tracking-tight">Voice AI Interface</h2>
                <p className="text-text-secondary mb-10 text-lg leading-relaxed">
                  Aivon uses advanced LLMs and Speech Synthesis to provide human-like assistance in both English and Hausa.
                </p>
                <div className="grid gap-6">
                  {[
                    { icon: Globe, title: "Bilingual Support", desc: "English & Hausa fluency" },
                    { icon: Zap, title: "Low Latency", desc: "Real-time processing" },
                    { icon: Shield, title: "Verified Hub", desc: "FUDMA Academic Data" },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-5 items-start">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-1">{f.title}</h4>
                        <p className="text-sm text-text-secondary leading-snug">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-bg rounded-[32px] border border-border p-8 h-[450px] flex flex-col justify-center overflow-hidden shadow-inner translate-z-10">
                  <div className="absolute top-6 left-6 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent/20" />
                    <div className="w-2 h-2 rounded-full bg-accent/40" />
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <Waveform isActive={true} color="#228B22" count={30} />
                  <div className="mt-12 text-center">
                    <p className="text-accent font-mono text-xs tracking-[4px] animate-pulse uppercase">
                      Transmitting Node Data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
