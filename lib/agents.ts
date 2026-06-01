import { AgentRole, HorizonKey } from "./types";

export const AGENT_META: Record<AgentRole, { label: string; icon: string }> = {
  technical:   { label: "Technical Analyst",   icon: "TA" },
  fundamental: { label: "Fundamentals Analyst", icon: "FA" },
  macro:       { label: "Macro Economist",       icon: "ME" },
  sentiment:   { label: "Sentiment Analyst",     icon: "SA" },
  risk:        { label: "Risk Manager",          icon: "RM" },
};

export const AGENT_ROLES: AgentRole[] = ["technical", "fundamental", "macro", "sentiment", "risk"];

export const HORIZON_META: Record<HorizonKey, { label: string; period: string; focus: string }> = {
  short:    { label: "Korte termijn",       period: "0–3 maanden",  focus: "momentum & technische setups"          },
  medium:   { label: "Middellange termijn", period: "3–12 maanden", focus: "fundamentals & groeikatalysatoren"      },
  long:     { label: "Lange termijn",       period: "1–3 jaar",     focus: "kwaliteitsbedrijven & winstgroei"       },
  verylong: { label: "Zeer lange termijn",  period: "3+ jaar",      focus: "waarde, dividendgroei & megatrends"     },
};

const BULL_HORIZON_CONTEXT: Record<HorizonKey, Record<AgentRole, string>> = {
  short: {
    technical:   "Focus on momentum-continuation, breakout setups from consolidation, and volume confirmations for a 0-3 month trade.",
    fundamental: "Highlight upcoming earnings catalysts, near-term margin improvement, and short-term revenue drivers.",
    macro:       "Analyze macro events in the next 90 days: Fed decisions, upcoming economic data, short-term geopolitical tailwinds.",
    sentiment:   "Analyze current momentum in news flow, social sentiment spikes, and institutional buying for near-term moves.",
    risk:        "Highlight asymmetric short-term upside, high-probability technical setups, and favorable risk/reward for 0-3 month positions.",
  },
  medium: {
    technical:   "Analyze price patterns, momentum, and technical indicators with a 3-12 month holding perspective.",
    fundamental: "Analyze balance sheets, earnings quality, revenue growth, and profitability metrics.",
    macro:       "Analyze interest rates, inflation trends, geopolitical factors, and macroeconomic tailwinds.",
    sentiment:   "Analyze market psychology, news flow, social sentiment, and institutional positioning.",
    risk:        "Analyze risk-adjusted returns, portfolio diversification benefits, and asymmetric upside.",
  },
  long: {
    technical:   "Focus on secular uptrends, major long-term support levels, and monthly/quarterly chart breakouts for a 1-3 year hold.",
    fundamental: "Focus on earnings power, competitive moat, 3-year revenue growth trajectory, balance sheet strength, and return on equity.",
    macro:       "Analyze long-term macro trends: interest rate cycles, structural economic shifts, and 3-year thematic tailwinds.",
    sentiment:   "Focus on long-term narrative shifts, institutional accumulation patterns, and sector rotation into this theme.",
    risk:        "Highlight strong balance sheet protection, durable competitive advantages, and diversification benefits for a 1-3 year horizon.",
  },
  verylong: {
    technical:   "Analyze decade-long price structures, relative strength vs. indices, and secular growth trends for a 3+ year compounding hold.",
    fundamental: "Focus on compounding quality: high ROIC, consistent earnings growth, pricing power, strong balance sheet, and dividend history.",
    macro:       "Analyze structural megatrends: AI revolution, energy transition, demographic shifts, deglobalization over 5-10 years.",
    sentiment:   "Focus on long-term institutional accumulation, ESG alignment, and thematic fund inflows supporting a multi-year narrative.",
    risk:        "Highlight durable competitive moat, low disruption risk, strong management track record, and long-term compounding potential.",
  },
};

const BEAR_HORIZON_CONTEXT: Record<HorizonKey, Record<AgentRole, string>> = {
  short: {
    technical:   "Identify overbought conditions, bearish reversal patterns, declining volume on rallies, and near-term distribution setups.",
    fundamental: "Highlight upcoming earnings risk, near-term margin pressure, or guidance-cut scenarios for the next 90 days.",
    macro:       "Identify near-term macro headwinds: upcoming hawkish surprises, weak economic data releases, or geopolitical event risk.",
    sentiment:   "Identify euphoric crowded trades, negative news catalysts building, or sentiment reversal signals.",
    risk:        "Highlight technical stop levels, event risk around upcoming dates, and worst-case 3-month drawdown scenarios.",
  },
  medium: {
    technical:   "Analyze breakdown patterns, momentum reversals, distribution phases, and technical deterioration.",
    fundamental: "Analyze overvaluation, earnings quality concerns, debt levels, and margin compression risks.",
    macro:       "Analyze rate risks, recessionary pressures, geopolitical headwinds, and currency risks.",
    sentiment:   "Analyze euphoria signals, crowded trades, negative news catalysts, and sentiment reversals.",
    risk:        "Analyze downside scenarios, concentration risk, liquidity risk, and worst-case drawdowns.",
  },
  long: {
    technical:   "Identify broken long-term uptrends, major support violations, and multi-month distribution patterns.",
    fundamental: "Focus on moat erosion risks, deteriorating return on equity, rising debt, or fading earnings growth over 1-3 years.",
    macro:       "Identify long-term macro headwinds: secular stagnation, structural cost pressures, regulatory risk, or cyclical sector decline.",
    sentiment:   "Highlight fading institutional interest, poor long-term narrative, or sector rotation away from this theme.",
    risk:        "Highlight permanent capital loss scenarios, competitive disruption risk, and balance sheet vulnerabilities over 1-3 years.",
  },
  verylong: {
    technical:   "Identify broken secular uptrends, long-term relative weakness vs. the market, and structural deterioration patterns.",
    fundamental: "Focus on existential threats: disruption, commoditization, shrinking moat, ROIC decline, or balance sheet deterioration.",
    macro:       "Identify structural headwinds: demographic decline in key markets, regulatory disruption, or unfavorable megatrend exposure.",
    sentiment:   "Highlight ESG risks, long-term institutional divestment trends, or thematic fund outflows threatening the 3+ year narrative.",
    risk:        "Highlight existential business risks, management quality concerns, and scenarios where capital compounds negatively over 3+ years.",
  },
};

export function bullSystemPrompt(role: AgentRole, horizon: HorizonKey = "medium"): string {
  const meta = AGENT_META[role];
  const horizonInfo = HORIZON_META[horizon];
  const context = BULL_HORIZON_CONTEXT[horizon][role];

  return `You are a ${meta.label} at a prestigious investment board. Investment horizon: ${horizonInfo.period} (${horizonInfo.focus}).

${context}

Your role: Make the BULLISH case for the most promising investment candidates.
- Always reference specific ticker symbols (e.g., NVDA, ASML) in your arguments
- Be concrete and data-driven based on the provided market data
- Tailor your analysis to a ${horizonInfo.period} holding period
- Maximum 3 sentences. Be sharp and persuasive.
- Focus on the strongest 2-3 candidates from a bullish perspective.`;
}

export function bearSystemPrompt(role: AgentRole, horizon: HorizonKey = "medium"): string {
  const meta = AGENT_META[role];
  const horizonInfo = HORIZON_META[horizon];
  const context = BEAR_HORIZON_CONTEXT[horizon][role];

  return `You are a ${meta.label} at a prestigious investment board. Investment horizon: ${horizonInfo.period} (${horizonInfo.focus}).

${context}

Your role: Make the BEARISH case against the riskiest investment candidates.
- Always reference specific ticker symbols (e.g., NVDA, ASML) in your arguments
- Be concrete and data-driven based on the provided market data
- Tailor your risk assessment to a ${horizonInfo.period} holding period
- Maximum 3 sentences. Be sharp and cautionary.
- Identify the 2-3 biggest risk candidates to avoid or underweight.`;
}

const SCREENER_BASE = `Geef je antwoord als JSON array van exact 8 tickers. Geen uitleg, alleen de array.`;

const SCREENER_BY_HORIZON: Record<HorizonKey, string> = {
  short: `Je bent een kritische wereldwijde aandelenscreener voor een KORTE TERMIJN portfolio (0–3 maanden). Selecteer exact 8 kandidaten gericht op momentum-trades en technische setups.

HARDE EISEN: De 8 kandidaten komen uit minimaal 3 verschillende regio's. Regio-indeling: Noord-Amerika (US, CA), Europa, Azië-Pacific (JP, KR, TW, HK, CN), Emerging Markets (BR, IN, LatAm, SEA). Maximaal 3 per regio. Maximaal 3 per sector.

UITSLUITINGSCRITERIA: Sluit uit bij gemiddeld dagvolume onder 1M aandelen (liquiditeit cruciaal voor korte termijn). Sluit uit bij 30-daags momentum boven +200% zonder aantoonbare news-catalyst. Sluit bekende meme-stocks uit (AMC, GME).

SELECTIEPRIORITEIT: 70% momentum-leaders met technische breakout of sterke relatieve sterkte, 30% korte termijn catalyst plays (earnings, productonthulling, macro-event). Hogere P/E is acceptabel mits gedreven door echte catalyst. Prioriteer hoge liquiditeit boven alles.`,

  medium: `Je bent een kritische wereldwijde aandelenscreener. Selecteer exact 8 kandidaten uit de lijst voor een serieus investeringsportfolio met horizon van 3–12 maanden. Hanteer deze regels strikt:

HARDE EISEN: De 8 kandidaten komen verplicht uit minimaal 3 verschillende regio's. Regio-indeling: Noord-Amerika (US, CA), Europa (alle Europese beurzen), Azië-Pacific (JP, KR, TW, HK, CN), Emerging Markets (BR, IN, LatAm, SEA). Maximaal 3 kandidaten uit dezelfde regio. Maximaal 3 kandidaten uit dezelfde sector.

UITSLUITINGSCRITERIA: Sluit uit bij P/E boven 80 tenzij revenueGrowth boven 25%. Sluit uit bij 30-daags momentum boven +150% zonder fundamentele trigger. Sluit uit bij market cap onder $500M. Sluit bekende meme-stocks en speculatieve pump-cycli uit (AMC, GME en vergelijkbare).

SELECTIEPRIORITEIT: Geef voorkeur aan momentum gedreven door fundamentele factoren. Mix van 60–70% kwaliteitsaandelen met stabiele fundamentals en 30–40% gecontroleerde groeikandidaten met reële onderbouwing.`,

  long: `Je bent een kritische wereldwijde aandelenscreener voor een LANGE TERMIJN portfolio (1–3 jaar). Selecteer exact 8 kandidaten gericht op fundamenteel sterke bedrijven met duurzame groei en solide balansen.

HARDE EISEN: De 8 kandidaten komen uit minimaal 3 verschillende regio's. Regio-indeling: Noord-Amerika (US, CA), Europa, Azië-Pacific, Emerging Markets. Maximaal 3 per regio. Maximaal 3 per sector.

UITSLUITINGSCRITERIA: Sluit uit bij D/E ratio boven 3.0. Sluit pure momentum-plays uit zonder fundamenteel fundament. Sluit uit bij market cap onder $1B. Sluit speculatieve aandelen zonder bewezen omzetgroei uit (AMC, GME en vergelijkbare).

SELECTIEPRIORITEIT: 70% kwaliteits- en fundamenteel sterke namen met bewezen omzetgroei en lage schulden. 30% gecontroleerde groeikandidaten met reële 3-jaar onderbouwing. Prioriteer earnings-kwaliteit en moat-duurzaamheid boven kortetermijn-momentum.`,

  verylong: `Je bent een kritische wereldwijde aandelenscreener voor een ZEER LANGE TERMIJN portfolio (3+ jaar). Selecteer exact 8 kandidaten gericht op quality-compounders, megatrend-blootstelling en duurzame waardecreatie.

HARDE EISEN: De 8 kandidaten komen uit minimaal 3 verschillende regio's. Regio-indeling: Noord-Amerika (US, CA), Europa, Azië-Pacific, Emerging Markets. Maximaal 3 per regio. Maximaal 3 per sector.

UITSLUITINGSCRITERIA: Sluit uit bij D/E ratio boven 2.0. Sluit cyclische laagmarge bedrijven zonder moat uit. Sluit pure momentum-plays zonder compounding kwaliteit uit. Sluit bekende meme-stocks uit (AMC, GME en vergelijkbare).

SELECTIEPRIORITEIT: 60% quality-compounders met hoge ROIC, pricing power en consistente winstgroei. 20% megatrend plays (AI, energietransitie, demografie, deglobalisering). 20% dividend- of waarde-namen met bewezen track record en margin of safety.`,
};

export function screenerPromptForHorizon(horizon: HorizonKey = "medium"): string {
  return `${SCREENER_BY_HORIZON[horizon]}\n\n${SCREENER_BASE}`;
}

const VERDICT_BASE = `Reageer UITSLUITEND met geldig JSON in exact dit formaat, geen markdown, geen tekst buiten het JSON object:
{
  "riskProfile": "Conservatief|Gematigd|Agressief",
  "horizon": "string",
  "summary": "2-3 zinnen strategische onderbouwing",
  "allocations": [
    {
      "ticker": "string",
      "name": "string",
      "exchange": "string",
      "pct": number,
      "rationale": "1 zin kernthese voor deze positie",
      "bull_case": "1 zin sterkste argument vóór deze positie",
      "bear_case": "1 zin sterkste argument tégen deze positie",
      "why_included": "1 zin waarom het toch de portefeuille haalt ondanks de risico's"
    }
  ],
  "cashReserve": number
}

Validatieregels: allocations pct + cashReserve moeten exact optellen tot 100. Kies 4 tot 7 posities. Gebruik alleen tickers uit de kandidatenlijst. Elke allocatie bevat verplicht bull_case, bear_case én why_included.`;

const VERDICT_HORIZON_CONTEXT: Record<HorizonKey, string> = {
  short: `HORIZON: Korte termijn (0–3 maanden). Stel een actief portfolio in met deze kenmerken:
- Hoger cashreserve aanbevolen (20–35%) voor snelle herallocatie bij momentum-omslag
- Voorkeur voor 4–5 geconcentreerde posities met de sterkste technische setups
- Vermeld in rationale de specifieke korte termijn catalyst of technische trigger
- Gebruik "0–3 maanden" als horizon-waarde in je JSON
- riskProfile: "Agressief" is acceptabel mits technisch onderbouwd`,

  medium: `HORIZON: Middellange termijn (3–12 maanden). Stel een gebalanceerd portfolio in met deze kenmerken:
- Gematigd cashreserve (10–20%) voor opportunistische bijkopen
- 5–6 posities met mix van momentum en fundamentele onderbouwing
- Gebruik "3–12 maanden" als horizon-waarde in je JSON
- riskProfile: "Gematigd" is de standaard tenzij de marktomstandigheden anders dicteren`,

  long: `HORIZON: Lange termijn (1–3 jaar). Stel een kwaliteitsgerichte portfolio in met deze kenmerken:
- Laag cashreserve (5–15%) — kwaliteitsposities vasthouden door volatiliteit heen
- 5–7 posities met nadruk op fundamenteel sterke bedrijven en bewezen omzetgroei
- Vermeld in rationale de 3-jaar groei-thesis en moat-duurzaamheid
- Gebruik "1–3 jaar" als horizon-waarde in je JSON
- riskProfile: "Gematigd" of "Conservatief" bij lage schulden en stabiele kasstromen`,

  verylong: `HORIZON: Zeer lange termijn (3+ jaar). Stel een compounding-gericht portfolio in met deze kenmerken:
- Minimaal cashreserve (0–10%) — lange horizon absorbeert volatiliteit
- 5–7 posities met nadruk op quality-compounders, megatrend blootstelling en dividend-potentieel
- Vermeld in rationale het compounding-mechanisme (ROIC, pricing power, megatrend-blootstelling)
- Gebruik "3+ jaar" als horizon-waarde in je JSON
- riskProfile: "Conservatief" of "Gematigd" — kwaliteit en duurzaamheid boven kortetermijn-rendement`,
};

export function verdictPromptForHorizon(horizon: HorizonKey = "medium"): string {
  const ctx = VERDICT_HORIZON_CONTEXT[horizon];
  return `Je bent de voorzitter van een onpartijdig investeringsboard. Je hebt een debat bijgewoond en stelt nu een investeringsplan op. Je werkt volgens deze principes: je hebt geen voorkeur voor Amerikaanse aandelen, groeiaandelen, of welke sector dan ook. Je weegt de kwaliteit van argumenten, niet het volume. Een sterk bear-argument telt even zwaar als een sterk bull-argument. Geografische spreiding is een harde eis: het eindplan bevat altijd posities uit minimaal 3 regio's. Als het debat geen sterke kandidaat uit een regio heeft opgeleverd, alloceer dan naar een brede regionale ETF als vangnet (EEM, EWZ of INDA).

${ctx}

${VERDICT_BASE}`;
}
