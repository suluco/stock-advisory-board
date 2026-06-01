"use client";

import { useState } from "react";
import { HorizonKey } from "@/lib/types";
import { HORIZON_META } from "@/lib/agents";

interface Props {
  onSubmit: (budget: number, horizon: HorizonKey) => void;
  isLoading: boolean;
}

const PRESETS = [1000, 5000, 10000, 25000, 50000];
const HORIZONS: HorizonKey[] = ["short", "medium", "long", "verylong"];

export default function BudgetInput({ onSubmit, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [horizon, setHorizon] = useState<HorizonKey>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (n > 0) onSubmit(n, horizon);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Investment Board</h1>
        <p className="text-gray-400 text-lg">AI-gestuurde multi-agent investeringsanalyse</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-400 font-mono uppercase tracking-wider">
            Investeringsbedrag (EUR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-mono">€</span>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="10.000"
              disabled={isLoading}
              className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-4 text-white text-xl font-mono focus:outline-none focus:border-[#555] placeholder-gray-700 disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setValue(String(p))}
                disabled={isLoading}
                className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded text-gray-400 text-sm font-mono hover:border-[#555] hover:text-white transition-colors disabled:opacity-50"
              >
                {fmt(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-400 font-mono uppercase tracking-wider">
            Beleggingshorizon
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HORIZONS.map(h => {
              const meta = HORIZON_META[h];
              const isSelected = horizon === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  disabled={isLoading}
                  className={`flex flex-col items-start px-4 py-3 rounded-lg border text-left transition-all disabled:opacity-50 ${
                    isSelected
                      ? "bg-white/5 border-white/40 text-white"
                      : "bg-[#111] border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-300"
                  }`}
                >
                  <span className="text-sm font-semibold font-mono leading-tight">
                    {meta.label}
                  </span>
                  <span className={`text-xs font-mono mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-600"}`}>
                    {meta.period}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-gray-600 text-xs font-mono">
            Focus: {HORIZON_META[horizon].focus}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !value}
          className="w-full py-4 bg-white text-black font-bold rounded-lg text-lg hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Analyse bezig..." : "Start Analyse →"}
        </button>
      </form>

      <p className="text-gray-600 text-sm text-center max-w-sm">
        10 AI-agents debatteren 3 rondes over de beste global stocks. Live gestreamd.
      </p>
    </div>
  );
}
