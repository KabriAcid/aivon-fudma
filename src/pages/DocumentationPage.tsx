import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Book, Code, Cpu, Shield, Zap, Globe, MessageSquare, Terminal } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mb-16"
      >
        <span className="text-accent text-[10px] uppercase font-bold tracking-[4px] mb-4 block">Official Documentation</span>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
          The Aivon <br />
          <span className="text-text-secondary">System Protocols</span>
        </h1>
        <p className="text-xl text-text-secondary leading-relaxed">
          Aivon is a next-generation voice intelligence system designed for Federal University Dutsin-Ma (FUDMA). It bridges the gap between students and university services through real-time, trilingual AI communication.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DocCard 
          icon={<Cpu className="w-6 h-6 text-accent" />}
          title="Neural Engine"
          description="Powered by Gemini 1.5 Flash, Aivon processes complex student inquiries with sub-second latency and high semantic accuracy."
        />
        <DocCard 
          icon={<Globe className="w-6 h-6 text-accent" />}
          title="Multilingual Support"
          description="Native support for English, Hausa, and Arabic, ensuring accessibility for the entire university community regardless of language preference."
        />
        <DocCard 
          icon={<Shield className="w-6 h-6 text-accent" />}
          title="Secure Handshake"
          description="End-to-end encrypted voice transmission through our proprietary FUDMA Node-01 proxy system."
        />
      </div>

      <section className="mt-24 space-y-12">
        <h2 className="text-3xl font-bold tracking-tight">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-text-secondary">
          <div className="space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Instant Registration Info
            </h3>
            <p className="leading-relaxed">
              Students can query course registration requirements, deadlines, and procedural steps through natural voice dialogue.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              Campus Information
            </h3>
            <p className="leading-relaxed">
              Real-time updates on campus events, exam schedules, and department-specific announcements.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              API Integration
            </h3>
            <p className="leading-relaxed">
              Pluggable architecture allowing integration with FUDMA's existing student portal and database systems.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Code className="w-4 h-4 text-accent" />
              Live Transcription
            </h3>
            <p className="leading-relaxed">
              Proprietary speech-to-text engine that provides real-time visual feedback for every conversation.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-32 p-12 rounded-[40px] bg-white/5 border border-border flex flex-col items-center text-center">
        <Book className="w-12 h-12 text-accent mb-6" />
        <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
        <p className="text-text-secondary mb-8 max-w-lg">
          Explore the future of university communication. Test the Aivon system today.
        </p>
        <Link to="/call">
          <button className="px-10 py-4 bg-accent text-white font-bold rounded-2xl hover:bg-accent/80 transition-all">
            Launch Simulation
          </button>
        </Link>
      </div>
    </div>
  );
}

function DocCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-[32px] bg-white/5 border border-border group hover:border-accent/30 transition-all duration-500">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 ring-1 ring-accent/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[14px] leading-relaxed text-text-secondary group-hover:text-white transition-colors">
        {description}
      </p>
    </div>
  );
}
