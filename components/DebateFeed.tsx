"use client";

import { useEffect, useRef } from "react";
import { AgentRole, AgentSide } from "@/lib/types";
import AgentBubble from "./AgentBubble";
import ScoreBar from "./ScoreBar";

export interface DebateEntry {
  id: string;
  side: AgentSide;
  role: AgentRole;
  icon: string;
  round: number;
  text: string;
  isStreaming: boolean;
}

interface Props {
  entries: DebateEntry[];
}

export default function DebateFeed({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const bullCount = entries.filter(e => e.side === "bull" && !e.isStreaming).length;
  const bearCount = entries.filter(e => e.side === "bear" && !e.isStreaming).length;

  const byRound: Record<number, DebateEntry[]> = {};
  for (const e of entries) {
    if (!byRound[e.round]) byRound[e.round] = [];
    byRound[e.round].push(e);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-mono font-bold text-sm uppercase tracking-wider">
          Debat
        </h2>
        {(bullCount + bearCount) > 0 && (
          <div className="w-48">
            <ScoreBar bullCount={bullCount} bearCount={bearCount} />
          </div>
        )}
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1 scroll-smooth">
        {Object.entries(byRound).map(([round, roundEntries]) => (
          <div key={round}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[#222]" />
              <span className="text-gray-600 text-xs font-mono uppercase tracking-wider">
                Ronde {round}
              </span>
              <div className="h-px flex-1 bg-[#222]" />
            </div>
            <div className="space-y-4">
              {roundEntries.map(entry => (
                <AgentBubble
                  key={entry.id}
                  side={entry.side}
                  role={entry.role}
                  icon={entry.icon}
                  round={entry.round}
                  text={entry.text}
                  isStreaming={entry.isStreaming}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
