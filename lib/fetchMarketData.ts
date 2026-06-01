import { Quote } from "./types";

const YAHOO_BASE = "https://query1.finance.yahoo.com";
const FMP_BASE = "https://financialmodelingprep.com/api/v3";
const FMP_KEY = process.env.FMP_API_KEY ?? "demo";

export async function fetchTrendingTickers(): Promise<string[]> {
  try {
    const res = await fetch(`${YAHOO_BASE}/v1/finance/trending/US?count=20`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const quotes = json?.finance?.result?.[0]?.quotes ?? [];
    return quotes.map((q: { symbol: string }) => q.symbol).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchFMPGainers(): Promise<string[]> {
  try {
    const res = await fetch(`${FMP_BASE}/stock_market/gainers?apikey=${FMP_KEY}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];
    return json.slice(0, 20).map((s: { symbol: string }) => s.symbol).filter(Boolean);
  } catch {
    return [];
  }
}

interface Fundamentals {
  trailingPE: number | null;
  forwardPE: number | null;
  trailingEps: number | null;
  revenueGrowth: number | null;
  grossMargins: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  targetMeanPrice: number | null;
}

async function fetchFundamentals(ticker: string): Promise<Fundamentals> {
  const nullResult: Fundamentals = {
    trailingPE: null, forwardPE: null, trailingEps: null,
    revenueGrowth: null, grossMargins: null, debtToEquity: null,
    currentRatio: null, targetMeanPrice: null,
  };
  try {
    const url = `${YAHOO_BASE}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=summaryDetail,defaultKeyStatistics,financialData`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return nullResult;
    const json = await res.json();
    const result = json?.quoteSummary?.result?.[0];
    if (!result) return nullResult;

    const sd = result.summaryDetail ?? {};
    const ks = result.defaultKeyStatistics ?? {};
    const fd = result.financialData ?? {};

    const raw = (obj: Record<string, { raw?: number } | undefined>, key: string): number | null =>
      obj[key]?.raw ?? null;

    const pct = (obj: Record<string, { raw?: number } | undefined>, key: string): number | null => {
      const v = obj[key]?.raw;
      return v != null ? parseFloat((v * 100).toFixed(2)) : null;
    };

    return {
      trailingPE:     raw(sd, "trailingPE"),
      forwardPE:      raw(sd, "forwardPE") ?? raw(ks, "forwardPE"),
      trailingEps:    raw(ks, "trailingEps"),
      revenueGrowth:  pct(fd, "revenueGrowth"),
      grossMargins:   pct(fd, "grossMargins"),
      debtToEquity:   raw(fd, "debtToEquity"),
      currentRatio:   raw(fd, "currentRatio"),
      targetMeanPrice: raw(fd, "targetMeanPrice"),
    };
  } catch {
    return nullResult;
  }
}

export async function fetchQuote(ticker: string): Promise<Quote | null> {
  try {
    const chartUrl = `${YAHOO_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=3mo`;

    // Fetch chart data and fundamentals in parallel
    const [chartRes, fundamentals] = await Promise.all([
      fetch(chartUrl, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 0 } }),
      fetchFundamentals(ticker),
    ]);

    if (!chartRes.ok) return null;
    const json = await chartRes.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const quoteData = result.indicators?.quote?.[0] ?? {};
    const closes: number[] = quoteData.close ?? [];
    const volumes: number[] = quoteData.volume ?? [];
    const validCloses = closes.filter((c: number | null) => c != null && c > 0);
    if (validCloses.length < 2) return null;

    const currentPrice = meta.regularMarketPrice ?? validCloses[validCloses.length - 1];
    const prevClose = meta.chartPreviousClose ?? validCloses[validCloses.length - 2];
    const change1d = prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

    const price30dAgo = validCloses.length >= 21 ? validCloses[validCloses.length - 21] : validCloses[0];
    const momentum30d = price30dAgo > 0 ? ((currentPrice - price30dAgo) / price30dAgo) * 100 : 0;

    const validVolumes = volumes.filter((v: number | null) => v != null && v > 0);
    const avgVolume = validVolumes.length > 0
      ? Math.round(validVolumes.reduce((a, b) => a + b, 0) / validVolumes.length)
      : 0;

    return {
      ticker,
      name: meta.longName ?? meta.shortName ?? ticker,
      price: currentPrice,
      change1d: parseFloat(change1d.toFixed(2)),
      momentum30d: parseFloat(momentum30d.toFixed(2)),
      marketCap: meta.marketCap ?? 0,
      avgVolume,
      exchange: meta.exchangeName ?? meta.fullExchangeName ?? "Unknown",
      currency: meta.currency ?? "USD",
      ...fundamentals,
    };
  } catch {
    return null;
  }
}

// Known reputable exchanges — rejects pink sheets, OTC bulletin boards, etc.
const REPUTABLE_EXCHANGES = new Set([
  "NMS","NGM","NCM","NYQ","ASE","PCX",   // US
  "NasdaqGS","NasdaqGM","NasdaqCM","NYSE","AMEX",
  "AMS","PAR","FRA","XETRA","LSE","STO","CPH","HEL","OSL","LIS", // Europe
  "TYO","HKG","SES","KSC","TAI","SHH","SHZ", // Asia
  "SAO","BMV",                               // LatAm
  "ETF","ETF US",
]);

function isQualified(q: Quote): boolean {
  // Yahoo Finance chart API does not expose marketCap — filter on volume instead
  if (q.avgVolume < 500_000) return false;
  if (q.momentum30d > 150) return false;
  // Reject tickers on sketchy/unknown exchanges
  if (!REPUTABLE_EXCHANGES.has(q.exchange) && q.exchange !== "Unknown") {
    // Allow unknown only if ticker is a known large-cap (price sanity check)
    if (q.price < 1) return false;
  }
  return true;
}

export async function fetchQuotesBatched(tickers: string[]): Promise<Quote[]> {
  const results: Quote[] = [];
  const batchSize = 10;

  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchQuote));
    for (const q of batchResults) {
      if (q !== null && isQualified(q)) results.push(q);
    }
  }

  return results;
}
