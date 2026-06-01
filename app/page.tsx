"use client";

import { useState, useCallback } from "react";
import BudgetInput from "@/components/BudgetInput";
import ProgressStepper from "@/components/ProgressStepper";
import CandidateGrid from "@/components/CandidateGrid";
import DebateFeed, { DebateEntry } from "@/components/DebateFeed";
import AllocationCard from "@/components/AllocationCard";
import { Quote, InvestmentPlan, AgentRole, AgentSide, HorizonKey } from "@/lib/types";
import { HORIZON_META } from "@/lib/agents";

type Phase = "idle" | "running" | "done" | "error";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [budget, setBudget] = useState<number>(0);
  const [horizon, setHorizon] = useState<HorizonKey>("medium");
  const [activeStep, setActiveStep] = useState(0);
  const [stepMsg, setStepMsg] = useState("");
  const [candidates, setCandidates] = useState<Quote[]>([]);
  const [debateEntries, setDebateEntries] = useState<DebateEntry[]>([]);
  const [plan, setPlan] = useState<InvestmentPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (b: number, h: HorizonKey) => {
    setBudget(b);
    setHorizon(h);
    setPhase("running");
    setActiveStep(1);
    setStepMsg("");
    setCandidates([]);
    setDebateEntries([]);
    setPlan(null);
    setError(null);

    let currentEntryId: string | null = null;

    try {
      const res = await fetch("/api/stream-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: b, horizon: h }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let event: { type: string; payload?: unknown };
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === "step") {
            const p = event.payload as { step: number; msg: string };
            setActiveStep(p.step);
            setStepMsg(p.msg);
          } else if (event.type === "candidates") {
            setCandidates(event.payload as Quote[]);
          } else if (event.type === "agent_start") {
            const p = event.payload as { side: AgentSide; role: AgentRole; icon: string; round: number };
            const id = `${p.side}-${p.role}-${p.round}-${Date.now()}`;
            currentEntryId = id;
            setDebateEntries(prev => [
              ...prev,
              { id, side: p.side, role: p.role, icon: p.icon, round: p.round, text: "", isStreaming: true },
            ]);
          } else if (event.type === "agent_token") {
            const { token } = event.payload as { token: string };
            if (currentEntryId) {
              const entryId = currentEntryId;
              setDebateEntries(prev =>
                prev.map(e => e.id === entryId ? { ...e, text: e.text + token } : e)
              );
            }
          } else if (event.type === "agent_done") {
            const p = event.payload as { side: AgentSide; role: AgentRole; round: number; fullText: string };
            if (currentEntryId) {
              const entryId = currentEntryId;
              setDebateEntries(prev =>
                prev.map(e => e.id === entryId ? { ...e, text: p.fullText, isStreaming: false } : e)
              );
            }
            currentEntryId = null;
          } else if (event.type === "verdict") {
            setPlan(event.payload as InvestmentPlan);
            setActiveStep(7);
          } else if (event.type === "error") {
            const p = event.payload as { step: number; message: string };
            setError(p.message);
            setPhase("error");
          } else if (event.type === "done") {
            setPhase("done");
            setActiveStep(7);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      setError(msg);
      setPhase("error");
    }
  }, []);

  const reset = () => {
    setPhase("idle");
    setActiveStep(0);
    setStepMsg("");
    setCandidates([]);
    setDebateEntries([]);
    setPlan(null);
    setError(null);
    setBudget(0);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {phase === "idle" && (
          <BudgetInput onSubmit={startAnalysis} isLoading={false} />
        )}

        {(phase === "running" || phase === "done") && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Investment Board</h1>
                <p className="text-gray-500 text-sm font-mono mt-0.5">
                  Budget:{" "}
                  {new Intl.NumberFormat("nl-NL", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(budget)}
                  {" · "}
                  <span className="text-gray-400">{HORIZON_META[horizon].label}</span>
                  <span className="text-gray-600"> ({HORIZON_META[horizon].period})</span>
                </p>
              </div>
              {phase === "done" && (
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-[#111] border border-[#333] rounded-lg text-gray-400 text-sm font-mono hover:border-[#555] hover:text-white transition-colors"
                >
                  Nieuwe analyse
                </button>
              )}
            </div>

            <ProgressStepper activeStep={activeStep} />

            {stepMsg && phase === "running" && (
              <p className="text-gray-500 text-sm font-mono animate-pulse">{stepMsg}</p>
            )}

            {candidates.length > 0 && <CandidateGrid candidates={candidates} />}

            {debateEntries.length > 0 && <DebateFeed entries={debateEntries} />}

            {plan && phase === "done" && <AllocationCard plan={plan} budget={budget} />}
          </>
        )}

        {phase === "error" && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="bg-[#1f0d0d] border border-[#ef4444]/30 rounded-xl p-6 max-w-md w-full text-center">
              <p className="text-[#ef4444] font-mono font-bold text-lg mb-2">Analyse mislukt</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
