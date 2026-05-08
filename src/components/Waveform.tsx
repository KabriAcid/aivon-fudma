import { motion } from "motion/react";

interface WaveformProps {
  isActive?: boolean;
  color?: string;
  count?: number;
}

export default function Waveform({ isActive = false, color = "#228B22", count = 40 }: WaveformProps) {
  return (
    <div className="flex items-center justify-center gap-[2px] h-32 w-full max-w-md mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: isActive 
              ? [20, Math.random() * 80 + 20, 20] 
              : 8,
            opacity: isActive ? [0.3, 1, 0.3] : 0.2
          }}
          transition={{
            duration: isActive ? Math.random() * 0.5 + 0.5 : 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05
          }}
        />
      ))}
    </div>
  );
}
