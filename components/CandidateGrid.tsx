"use client";

import { Quote } from "@/lib/types";

interface Props {
  candidates: Quote[];
}

function fmtMarketCap(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n > 0 ? `${n}` : "N/A";
}

export default function CandidateGrid({ candidates }: Props) {
  return (
    <div>
      <h2 className="text-white font-mono font-bold text-sm uppercase tracking-wider mb-3">
        Geselecteerde Kandidaten
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {candidates.map(q => (
          <div
            key={q.ticker}
            className="bg-[#111] border border-[#222] rounded-lg p-3 hover:border-[#333] transition-colors"
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <span className="text-white font-mono font-bold text-sm">{q.ticker}</span>
              <span
                className={`text-xs font-mono font-bold ${
                  q.momentum30d >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                }`}
              >
                {q.momentum30d >= 0 ? "+" : ""}
                {q.momentum30d.toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-500 text-xs truncate mb-2">{q.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-mono">
                {q.currency} {q.price.toFixed(2)}
              </span>
              <span className="text-gray-600 text-xs">{fmtMarketCap(q.marketCap)}</span>
            </div>
            <div className="mt-1">
              <span className="text-gray-600 text-xs font-mono">{q.exchange}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
