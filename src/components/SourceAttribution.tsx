interface Props {
  sources: string[];
  className?: string;
}

export function SourceAttribution({ sources, className = "" }: Props) {
  if (!sources.length) return null;

  return (
    <div className={`text-xs text-text-secondary/60 mt-4 p-4 rounded-2xl bg-white/5 border border-border ${className}`}>
      <p className="font-bold uppercase tracking-widest text-[9px] mb-2 text-accent">Information Sources:</p>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li key={source} className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-accent" />
            {source}
          </li>
        ))}
      </ul>
    </div>
  );
}
