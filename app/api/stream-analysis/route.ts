// EDUCATIONAL/ENTERTAINMENT USE ONLY. Not financial advice. See DISCLAIMER.md.
import Anthropic from "@anthropic-ai/sdk";
import { GLOBAL_UNIVERSE } from "@/lib/universe";
import { fetchTrendingTickers, fetchFMPGainers, fetchQuotesBatched } from "@/lib/fetchMarketData";
import { screenerPromptForHorizon } from "@/lib/agents";
import { runDebate } from "@/lib/debate";
import { runVerdict } from "@/lib/judge";
import { Quote, HorizonKey } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SCREENER_MODEL = process.env.CLAUDE_SCREENER_MODEL ?? "claude-haiku-4-5-20251001";
const JUDGE_MODEL = process.env.CLAUDE_JUDGE_MODEL ?? "claude-sonnet-4-6";

function sseEncode(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { budget } = body;
  const horizon: HorizonKey = ["short", "medium", "long", "verylong"].includes(body.horizon)
    ? body.horizon
    : "medium";

  if (!budget || typeof budget !== "number" || budget <= 0) {
    return new Response(JSON.stringify({ error: "Invalid budget" }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        controller.enqueue(new TextEncoder().encode(sseEncode(data)));
      };

      try {
        // ── Step 1: Scan markets ──────────────────────────────────────────────
        emit({ type: "step", payload: { step: 1, msg: "Wereldwijde markten scannen..." } });

        const [trending, gainers] = await Promise.all([fetchTrendingTickers(), fetchFMPGainers()]);
        const allTickers = [...new Set([...trending, ...gainers, ...GLOBAL_UNIVERSE])].slice(0, 80);

        emit({ type: "step", payload: { step: 2, msg: `Koersdata ophalen voor ${allTickers.length} tickers...` } });

        // ── Step 2: Fetch quotes ──────────────────────────────────────────────
        const quotes = await fetchQuotesBatched(allTickers);

        if (quotes.length < 5) {
          emit({ type: "error", payload: { step: 2, message: `Onvoldoende marktdata opgehaald (${quotes.length} tickers). Probeer opnieuw.` } });
          controller.close();
          return;
        }

        emit({ type: "quotes", payload: quotes });

        // ── Step 3: Screener ──────────────────────────────────────────────────
        emit({ type: "step", payload: { step: 3, msg: "AI-screener selecteert kandidaten..." } });

        const fmtN = (v: number | null, decimals = 1) => v != null ? v.toFixed(decimals) : "n/a";

        const quoteSummary = quotes
          .map(q => [
            `${q.ticker} | ${q.name} | ${q.currency} ${q.price.toFixed(2)}`,
            `1d: ${q.change1d}% | 30d: ${q.momentum30d}%`,
            `Exchange: ${q.exchange}`,
            `PE: ${fmtN(q.trailingPE)} | FwdPE: ${fmtN(q.forwardPE)} | EPS: ${fmtN(q.trailingEps, 2)}`,
            `RevGrowth: ${fmtN(q.revenueGrowth)}% | GrossMargin: ${fmtN(q.grossMargins)}%`,
            `D/E: ${fmtN(q.debtToEquity)} | CurrRatio: ${fmtN(q.currentRatio)} | TargetPrice: ${fmtN(q.targetMeanPrice, 2)}`,
          ].join(" | "))
          .join("\n");

        let candidateTickers: string[] = [];
        const screenerMsg = await anthropic.messages.create({
          model: SCREENER_MODEL,
          max_tokens: 256,
          system: screenerPromptForHorizon(horizon),
          messages: [{ role: "user", content: `Selecteer 8 kandidaten uit deze marktdata:\n\n${quoteSummary}` }],
        });

        const screenerText = screenerMsg.content[0].type === "text" ? screenerMsg.content[0].text : "[]";
        try {
          const parsed = JSON.parse(screenerText.trim());
          if (Array.isArray(parsed)) candidateTickers = parsed.slice(0, 8);
        } catch {
          candidateTickers = quotes
            .sort((a, b) => Math.abs(b.momentum30d) - Math.abs(a.momentum30d))
            .slice(0, 8)
            .map(q => q.ticker);
        }

        const candidates = candidateTickers
          .map(t => quotes.find(q => q.ticker === t))
          .filter((q): q is Quote => q !== undefined);

        if (candidates.length < 3) {
          emit({ type: "error", payload: { step: 3, message: "Screener kon geen voldoende kandidaten selecteren." } });
          controller.close();
          return;
        }

        emit({ type: "candidates", payload: candidates });

        // ── Steps 4-6: Debate (3 rounds) ─────────────────────────────────────
        emit({ type: "step", payload: { step: 4, msg: "Debat gestart — 3 rondes, 10 agents..." } });

        const candidateSummary = candidates
          .map(q => [
            `${q.ticker} (${q.name}): ${q.currency} ${q.price.toFixed(2)}`,
            `30d: ${q.momentum30d}%`,
            `Exchange: ${q.exchange}`,
            `PE: ${fmtN(q.trailingPE)} | FwdPE: ${fmtN(q.forwardPE)} | EPS: ${fmtN(q.trailingEps, 2)}`,
            `RevGrowth: ${fmtN(q.revenueGrowth)}% | GrossMargin: ${fmtN(q.grossMargins)}%`,
            `D/E: ${fmtN(q.debtToEquity)} | CurrRatio: ${fmtN(q.currentRatio)} | TargetPrice: ${fmtN(q.targetMeanPrice, 2)}`,
          ].join(" | "))
          .join("\n");

        const debateMessages = await runDebate(candidateSummary, horizon, anthropic, SCREENER_MODEL, emit);

        // ── Step 7: Board verdict ─────────────────────────────────────────────
        emit({ type: "step", payload: { step: 6, msg: "Board delibereert finale investeringsbeslissing..." } });

        const { plan, parseError } = await runVerdict(
          candidateSummary, debateMessages, budget, horizon, anthropic, JUDGE_MODEL,
        );

        if (!plan) {
          emit({
            type: "error",
            payload: { step: 7, message: `Kon het investeringsplan niet verwerken (${parseError}). Probeer opnieuw.` },
          });
          controller.close();
          return;
        }

        // Normalize percentages if they don't sum to exactly 100
        const totalPct = plan.allocations.reduce((s, a) => s + a.pct, 0) + plan.cashReserve;
        if (Math.abs(totalPct - 100) > 0.1) {
          const factor = 100 / totalPct;
          plan.allocations = plan.allocations.map(a => ({ ...a, pct: parseFloat((a.pct * factor).toFixed(1)) }));
          plan.cashReserve = parseFloat((plan.cashReserve * factor).toFixed(1));
        }

        emit({ type: "verdict", payload: plan });
        emit({ type: "done" });

      } catch (err) {
        const message = err instanceof Error ? err.message : "Onbekende fout";
        emit({ type: "error", payload: { step: 0, message: `Kritieke fout: ${message}` } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
