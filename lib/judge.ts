import Anthropic from "@anthropic-ai/sdk";
import { InvestmentPlan, HorizonKey, DebateMessage } from "./types";
import { AGENT_META, verdictPromptForHorizon } from "./agents";

export function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd !== -1) return raw.slice(braceStart, braceEnd + 1);
  return raw.trim();
}

export function isValidPlan(p: unknown): p is InvestmentPlan {
  if (!p || typeof p !== "object") return false;
  const obj = p as Record<string, unknown>;
  if (!Array.isArray(obj.allocations)) return false;
  if (typeof obj.cashReserve !== "number") return false;
  const total =
    (obj.allocations as Array<{ pct?: unknown }>).reduce(
      (s, a) => s + (typeof a.pct === "number" ? a.pct : 0),
      0
    ) + obj.cashReserve;
  return total >= 95 && total <= 105;
}

export async function runVerdict(
  candidateSummary: string,
  debateMessages: DebateMessage[],
  budget: number,
  horizon: HorizonKey,
  anthropic: Anthropic,
  judgeModel: string,
): Promise<{ plan: InvestmentPlan | null; parseError: string | null }> {
  const debateSummary = debateMessages
    .map(m => `[Round ${m.round} | ${m.side.toUpperCase()} | ${AGENT_META[m.role].label}]:\n${m.text}`)
    .join("\n\n---\n\n");

  const verdictMsg = await anthropic.messages.create({
    model: judgeModel,
    max_tokens: 4096,
    system: verdictPromptForHorizon(horizon),
    messages: [{
      role: "user",
      content: `Budget: €${budget.toLocaleString("nl-NL")}\n\nCandidates:\n${candidateSummary}\n\nFull debate transcript:\n\n${debateSummary}\n\nProvide the investment plan JSON.`,
    }],
  });

  const verdictText = verdictMsg.content[0].type === "text" ? verdictMsg.content[0].text : "";

  let plan: InvestmentPlan | null = null;
  let parseError: string | null = null;

  try {
    const extracted = extractJSON(verdictText);
    const parsed = JSON.parse(extracted);
    if (isValidPlan(parsed)) {
      plan = parsed;
    } else {
      console.error(`[verdict] validation failed. Raw response:\n${verdictText}`);
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.allocations) &&
        typeof parsed.cashReserve === "number"
      ) {
        plan = parsed as InvestmentPlan;
        parseError = "pct_sum_off";
      } else {
        parseError = "invalid_structure";
      }
    }
  } catch (err) {
    console.error(`[verdict] JSON.parse failed: ${err instanceof Error ? err.message : err}\nRaw response:\n${verdictText}`);
    parseError = "json_parse_error";
  }

  return { plan, parseError };
}
