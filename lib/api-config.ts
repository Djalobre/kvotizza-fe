// api-config.ts

// detektuj okruženje
const IS_SERVER = typeof window === "undefined";

// bezbedno spajanje delova URL-a (bez duplih /)
function ujoin(...parts: string[]) {
  return parts
    .map((p, i) => (i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+|\/+$/g, "")))
    .filter(Boolean)
    .join("/");
}

// biramo origin: server -> INTERNAL_API_URL, browser -> NEXT_PUBLIC_API_URL
const ORIGIN = IS_SERVER
  ? process.env.INTERNAL_API_URL || "http://127.0.0.1:8000"
  : process.env.NEXT_PUBLIC_API_URL || "https://api.kvotizza.online";

// base API = <origin>/api
const API_BASE = ujoin(ORIGIN, "api");

// === Public config (isti shape kao pre) ===
export const API_CONFIG = {
  baseUrl: API_BASE, // npr. http://127.0.0.1:8000/api ili https://api.kvotizza.online/api
  endpoints: {
    matches: ujoin(API_BASE, "matches"),
    matchDetails: (matchId: number) => ujoin(API_BASE, "matches", String(matchId)),
  },
  timeout: 10_000,
  retries: 3,
};

// standardni headeri
export const getApiHeaders = () => ({
  "Content-Type": "application/json",
});

// fetch sa retry i timeout-om
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // opciono: no-store da izbegnemo keš u SSR
  const config: RequestInit = {
    cache: "no-store",
    ...options,
    headers: {
      ...getApiHeaders(),
      ...(options.headers || {}),
    },
    // Node 18+/modern browsers: AbortSignal.timeout
    signal: (options as any)?.signal ?? (AbortSignal as any).timeout?.(API_CONFIG.timeout),
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
    try {
      const res = await fetch(url, config);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`);
      }
      return res;
    } catch (err) {
      lastError = err as Error;
      if (attempt === API_CONFIG.retries) break;
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
    }
  }

  throw lastError || new Error("API request failed after all retries");
};
