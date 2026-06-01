export interface Quote {
  ticker: string;
  name: string;
  price: number;
  change1d: number;   // % day change
  momentum30d: number; // % 30-day change
  marketCap: number;
  avgVolume: number;
  exchange: string;
  currency: string;
  // Fundamentals from quoteSummary (null if unavailable)
  trailingPE: number | null;
  forwardPE: number | null;
  trailingEps: number | null;
  revenueGrowth: number | null;  // in %
  grossMargins: number | null;   // in %
  debtToEquity: number | null;
  currentRatio: number | null;
  targetMeanPrice: number | null;
}

export type AgentRole = "technical" | "fundamental" | "macro" | "sentiment" | "risk";
export type AgentSide = "bull" | "bear";
export type HorizonKey = "short" | "medium" | "long" | "verylong";

export interface AgentMessage {
  side: AgentSide;
  role: AgentRole;
  icon: string;
  round: number;
  fullText: string;
}

export interface Allocation {
  ticker: string;
  name: string;
  exchange: string;
  pct: number;
  rationale: string;
  bull_case: string;
  bear_case: string;
  why_included: string;
}

export interface InvestmentPlan {
  riskProfile: "Conservatief" | "Gematigd" | "Agressief";
  horizon: string;
  summary: string;
  allocations: Allocation[];
  cashReserve: number;
}

export interface DebateMessage {
  side: AgentSide;
  role: AgentRole;
  round: number;
  text: string;
}

export type SSEEvent =
  | { type: "step"; payload: { step: number; msg: string } }
  | { type: "quotes"; payload: Quote[] }
  | { type: "candidates"; payload: Quote[] }
  | { type: "agent_start"; payload: { side: AgentSide; role: AgentRole; icon: string; round: number } }
  | { type: "agent_token"; payload: { token: string } }
  | { type: "agent_done"; payload: { side: AgentSide; role: AgentRole; round: number; fullText: string } }
  | { type: "verdict"; payload: InvestmentPlan }
  | { type: "error"; payload: { step: number; message: string } }
  | { type: "done" };
