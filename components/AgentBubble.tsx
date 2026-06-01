"use client";

import { AgentRole, AgentSide } from "@/lib/types";
import { AGENT_META } from "@/lib/agents";

interface Props {
  side: AgentSide;
  role: AgentRole;
  icon: string;
  round: number;
  text: string;
  isStreaming: boolean;
}

export default function AgentBubble({ side, role, icon, round, text, isStreaming }: Props) {
  const isBull = side === "bull";
  const meta = AGENT_META[role];

  return (
    <div className={`flex gap-3 ${isBull ? "flex-row" : "flex-row-reverse"}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 border ${
          isBull ? "border-[#22c55e]/30 bg-[#22c55e]/10" : "border-[#ef4444]/30 bg-[#ef4444]/10"
        }`}
      >
        {icon}
      </div>
      <div className={`max-w-[85%] ${isBull ? "" : "items-end flex flex-col"}`}>
        <div className={`flex items-center gap-2 mb-1 ${isBull ? "" : "flex-row-reverse"}`}>
          <span
            className={`text-xs font-mono font-bold ${
              isBull ? "text-[#22c55e]" : "text-[#ef4444]"
            }`}
          >
            {meta.label}
          </span>
          <span className="text-gray-600 text-xs font-mono">Ronde {round}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${
              isBull
                ? "bg-[#22c55e]/10 text-[#22c55e]"
                : "bg-[#ef4444]/10 text-[#ef4444]"
            }`}
          >
            {isBull ? "BULL" : "BEAR"}
          </span>
        </div>
        <div
          className={`rounded-lg px-4 py-3 text-sm text-gray-200 leading-relaxed border ${
            isBull
              ? "bg-[#0d1f0d] border-[#22c55e]/20"
              : "bg-[#1f0d0d] border-[#ef4444]/20"
          }`}
        >
          <p className="whitespace-pre-wrap">
            {text}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
