import { useState } from "react";
import { Phone, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialPadProps {
  onDial: (number: string) => void;
}

export default function DialPad({ onDial }: DialPadProps) {
  const [number, setNumber] = useState("");

  const handlePress = (digit: string) => {
    setNumber(prev => prev + digit);
  };

  const handleClear = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const keys = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "*", "0", "#"
  ];

  return (
    <div className="bg-surface p-8 rounded-[32px] border border-border backdrop-blur-xl w-full max-w-xs mx-auto shadow-2xl">
      <div className="mb-6 text-center">
        <div className="text-3xl font-mono tracking-widest text-accent h-10 mb-2">
          {number || "---"}
        </div>
        <div className="text-[10px] text-text-secondary uppercase tracking-[2px]">Enter Number</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className="aspect-square rounded-full border border-border bg-transparent text-text-primary text-lg flex items-center justify-center transition-all hover:bg-white/5 active:bg-accent active:border-accent active:scale-95"
          >
            {key}
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleClear}
          className="w-14 h-14 rounded-full bg-white/5 hover:bg-red-500/20 border border-border flex items-center justify-center transition-all text-text-secondary hover:text-red-400"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDial(number)}
          disabled={!number}
          className="w-14 h-14 rounded-full bg-accent hover:opacity-90 flex items-center justify-center transition-all shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-50 disabled:grayscale"
        >
          <Phone className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
