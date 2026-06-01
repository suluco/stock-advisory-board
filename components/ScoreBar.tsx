"use client";

interface Props {
  bullCount: number;
  bearCount: number;
}

export default function ScoreBar({ bullCount, bearCount }: Props) {
  const total = bullCount + bearCount;
  const bullPct = total > 0 ? (bullCount / total) * 100 : 50;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[#22c55e] font-mono text-sm font-bold w-16 text-right">
        Bull {bullCount}
      </span>
      <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#22c55e] transition-all duration-500 rounded-full"
          style={{ width: `${bullPct}%` }}
        />
      </div>
      <span className="text-[#ef4444] font-mono text-sm font-bold w-16">
        Bear {bearCount}
      </span>
    </div>
  );
}
