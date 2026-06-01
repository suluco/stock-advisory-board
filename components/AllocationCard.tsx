"use client";

import { InvestmentPlan } from "@/lib/types";

interface Props {
  plan: InvestmentPlan;
  budget: number;
}

export default function AllocationCard({ plan, budget }: Props) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const riskColor = {
    Conservatief: "text-[#22c55e]",
    Gematigd: "text-yellow-400",
    Agressief: "text-[#ef4444]",
  }[plan.riskProfile] ?? "text-white";

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-white font-bold text-lg">Board Verdict</h2>
          <p className="text-gray-500 text-sm mt-0.5">{plan.horizon}</p>
        </div>
        <span className={`font-mono font-bold text-sm px-3 py-1.5 rounded-full border ${riskColor} border-current bg-current/10`}>
          {plan.riskProfile}
        </span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-6 border-l-2 border-[#333] pl-4">
        {plan.summary}
      </p>

      <div className="space-y-3 mb-4">
        {plan.allocations.map(a => (
          <div key={a.ticker} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <div className="flex-shrink-0 w-20">
              <div className="text-white font-mono font-bold text-sm">{a.ticker}</div>
              <div className="text-gray-600 text-xs font-mono">{a.exchange}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-gray-300 text-sm truncate">{a.name}</span>
                <span className="text-white font-mono font-bold text-sm flex-shrink-0">
                  {fmt((a.pct / 100) * budget)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22c55e] rounded-full"
                    style={{ width: `${Math.min(a.pct, 100)}%` }}
                  />
                </div>
                <span className="text-[#22c55e] font-mono text-xs font-bold w-10 text-right">
                  {a.pct.toFixed(1)}%
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{a.rationale}</p>
              <div className="mt-2 space-y-1">
                {a.bull_case && (
                  <p className="text-xs leading-relaxed">
                    <span className="text-[#22c55e] font-mono font-bold mr-1">▲</span>
                    <span className="text-[#22c55e]/80">{a.bull_case}</span>
                  </p>
                )}
                {a.bear_case && (
                  <p className="text-xs leading-relaxed">
                    <span className="text-[#ef4444] font-mono font-bold mr-1">▼</span>
                    <span className="text-[#ef4444]/80">{a.bear_case}</span>
                  </p>
                )}
                {a.why_included && (
                  <p className="text-xs leading-relaxed">
                    <span className="text-gray-500 font-mono font-bold mr-1">→</span>
                    <span className="text-gray-500">{a.why_included}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {plan.cashReserve > 0 && (
          <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <div className="flex-shrink-0 w-20">
              <div className="text-gray-400 font-mono font-bold text-sm">CASH</div>
              <div className="text-gray-600 text-xs font-mono">Reserve</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-gray-400 text-sm">Liquiditeitsreserve</span>
                <span className="text-gray-300 font-mono font-bold text-sm">
                  {fmt((plan.cashReserve / 100) * budget)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500 rounded-full"
                    style={{ width: `${plan.cashReserve}%` }}
                  />
                </div>
                <span className="text-gray-500 font-mono text-xs font-bold w-10 text-right">
                  {plan.cashReserve.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-700 text-xs leading-relaxed border-t border-[#1a1a1a] pt-4">
        Disclaimer: Dit investeringsplan is gegenereerd door AI-agents en is uitsluitend informatief. Het vormt geen financieel advies. Beleggen brengt risico&apos;s met zich mee; u kunt (een deel van) uw inleg verliezen. Raadpleeg een gecertificeerd financieel adviseur voor persoonlijk advies.
      </p>
    </div>
  );
}
