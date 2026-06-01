# Stock Advisory Board

> [!WARNING]
> **DISCLAIMER — EDUCATIONAL AND ENTERTAINMENT PURPOSES ONLY**
>
> This tool does **not** constitute financial advice. The output of the debate system — including all agent arguments and the final investment plan — should **never** be the sole basis for any investment decision. Past results shown in this repository were observed during a bull market period (approximately April–June 2026) and **do not guarantee future performance**. The author accepts no liability for any financial losses resulting from acting on this system's output. See [DISCLAIMER.md](./DISCLAIMER.md) for the full disclaimer in English and Dutch.

---

A multi-agent debate system that simulates an investment board. Ten AI agents — five bulls and five bears, each with a distinct domain specialty — debate a live-screened stock universe over three structured rounds. An impartial judge model then synthesises the debate transcript and produces a concrete investment plan for your chosen budget and time horizon.

## How the debate architecture works

```
Live market data (~80 tickers)
        │
        ▼
┌─────────────────┐
│  AI Screener    │  → selects 8 candidates (enforces geographic + sector diversity)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  3-Round Debate  (10 agents streaming)  │
│                                         │
│  Round 1 — Opening arguments            │
│  Round 2 — Rebuttals                    │
│  Round 3 — Final positions + certainty  │
│                                         │
│  Bull side           Bear side          │
│  ├─ Technical        ├─ Technical       │
│  ├─ Fundamentals     ├─ Fundamentals    │
│  ├─ Macro            ├─ Macro           │
│  ├─ Sentiment        ├─ Sentiment       │
│  └─ Risk Manager     └─ Risk Manager   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Board Judge    │  → reads full transcript, weighs arguments, outputs investment plan
└─────────────────┘
```

1. **Market scan** — Live data is fetched from Yahoo Finance and Financial Modeling Prep for ~80 global tickers (trending stocks, top gainers, and a curated baseline universe).
2. **AI screener** — A fast model (Claude Haiku) narrows the universe to 8 candidates based on the selected time horizon, enforcing rules: ≥3 geographic regions, ≤3 per sector, no meme stocks, no micro-caps.
3. **Three-round debate** — 10 agents argue over the 8 candidates. Each agent's response is streamed live to your browser.
4. **Board verdict** — A more capable model (Claude Sonnet) acts as the impartial chair. It weighs bull and bear arguments equally and outputs a structured JSON investment plan with 4–7 positions, allocation percentages, and a cash reserve.

### Agent domains

| Role | Bull focus | Bear focus |
|------|-----------|-----------|
| Technical Analyst | Breakouts, momentum, trend confirmation | Overbought signals, distribution patterns |
| Fundamentals Analyst | Earnings growth, balance sheet strength | Overvaluation, margin compression |
| Macro Economist | Tailwinds, rate cycle, geopolitics | Macro headwinds, recession risk |
| Sentiment Analyst | Institutional accumulation, narrative momentum | Euphoria, crowded trades |
| Risk Manager | Asymmetric upside, strong risk/reward | Downside scenarios, concentration risk |

### Investment horizons

| Horizon | Period | Focus |
|---------|--------|-------|
| Short term | 0–3 months | Momentum & technical setups |
| Medium term | 3–12 months | Fundamentals & growth catalysts |
| Long term | 1–3 years | Quality companies & earnings growth |
| Very long term | 3+ years | Compounders, megatrends, dividend growth |

## Tech stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router) with TypeScript
- **UI**: React + [Tailwind CSS](https://tailwindcss.com)
- **AI**: [Anthropic Claude](https://www.anthropic.com) via `@anthropic-ai/sdk`
  - Screener + debate agents: `claude-haiku-4-5` (fast, cost-efficient)
  - Board judge / verdict: `claude-sonnet-4-6` (higher reasoning quality)
- **Market data**: Yahoo Finance (chart + fundamentals) · Financial Modeling Prep (gainers)
- **Streaming**: Server-Sent Events (SSE) — debate output streams token by token to the browser

## Installation

**Prerequisites**: Node.js 18+ and an [Anthropic API key](https://console.anthropic.com).

```bash
# 1. Clone the repository
git clone <repo-url>
cd stock_advisory_board

# 2. Create your local environment file
cp .env.example .env.local

# 3. Open .env.local and add your Anthropic API key
#    ANTHROPIC_API_KEY=sk-ant-...

# 4. Install dependencies
npm install

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key |
| `FMP_API_KEY` | No | `demo` | Financial Modeling Prep key (demo key has rate limits) |
| `CLAUDE_SCREENER_MODEL` | No | `claude-haiku-4-5-20251001` | Model for screener and debate agents |
| `CLAUDE_JUDGE_MODEL` | No | `claude-sonnet-4-6` | Model for the board judge / verdict |

## Usage

1. **Enter your budget** (in EUR) and select a **time horizon**.
2. Click **Start** — the system runs through 7 steps visible in the progress bar:
   - Steps 1–2: market scan and quote fetching
   - Step 3: AI screener selects 8 candidates
   - Steps 4–6: three debate rounds stream live to your screen
   - Step 7: board judge produces the final investment plan
3. **Output** includes:
   - A candidate grid with live market data for the 8 shortlisted stocks
   - The full debate feed streamed token by token
   - A final allocation card: tickers, allocation %, investment amounts in EUR, bull case, bear case, rationale, and a recommended cash reserve

A full run typically takes 2–4 minutes.

## Project structure

```
stock_advisory_board/
├── app/
│   ├── api/stream-analysis/
│   │   └── route.ts          # SSE orchestrator — market scan, screener, debate, verdict
│   ├── page.tsx              # Main UI page
│   └── layout.tsx
├── components/               # React UI components
│   ├── BudgetInput.tsx       # Budget + horizon input
│   ├── ProgressStepper.tsx   # 7-step progress indicator
│   ├── CandidateGrid.tsx     # Screened stock display
│   ├── DebateFeed.tsx        # Live streaming debate
│   ├── AgentBubble.tsx       # Individual agent message
│   ├── AllocationCard.tsx    # Final investment plan
│   └── ScoreBar.tsx          # Allocation percentage bar
└── lib/
    ├── agents.ts             # Agent roles, system prompts (bull/bear × 4 horizons)
    ├── debate.ts             # 3-round debate loop (10 agents × 3 rounds)
    ├── judge.ts              # Board verdict — JSON extraction, validation, Sonnet call
    ├── fetchMarketData.ts    # Yahoo Finance + FMP data fetching
    ├── types.ts              # TypeScript type definitions
    └── universe.ts           # Curated global stock universe (~80 tickers)
```

## Results

This system was informally tested with two real portfolios over approximately two months, from roughly April to June 2026.

**Important context on these results:**

- The test period coincided with a sustained broad market uptrend. Any positive performance observed during this period reflects favorable macro conditions and **cannot be attributed to the system's predictive capability**.
- No systematic backtesting was performed. Two portfolios over two months is anecdotal evidence, not validation.
- The system's intended value is in **surfacing structured multi-perspective analysis** and forcing explicit bull/bear tension before a decision — not in predicting returns.

Before drawing any conclusions from these results, read [DISCLAIMER.md](./DISCLAIMER.md).

---

*This project is provided for educational and demonstration purposes. See [DISCLAIMER.md](./DISCLAIMER.md) before use.*
