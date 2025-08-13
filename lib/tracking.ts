import { API_CONFIG } from '../lib/api-config';

// lib/tracking.ts
// export function logEventBeacon(
//     type: string,
//     payload: Record<string, any> = {}
//   ) {
//     const url = `${API_CONFIG.baseUrl}/events`;
//     const body = JSON.stringify({ type, ...payload });
  
//     if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
//       try {
//         const blob = new Blob([body], { type: "application/json" });
//         navigator.sendBeacon(url, blob);
//         return;
//       } catch { /* fall through */ }
//     }
//     // Fallback
//     fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body,
//       keepalive: true,
//     }).catch(() => {});
//   }
  
// lib/tracking.ts

type OutExtras = Partial<{
    // generic context
    source: string;            // "summary" | "analysis-grid" | "daily" ...
    // single selection context
    event_id: number;
    market: string;
    selection: string;
    odds: number;
    // summary row context
    stake: number;
    total_odds: number;
    potential_win: number;
    available: number;
    total: number;
    all_available: boolean;
  }>;
  
  /**
   * Build outlet URL that logs on the server (single event) then 302-redirects.
   * Only use primitive fields to keep the URL short.
   */
  export function outUrl(bookie: string, extras: OutExtras = {}) {
    const u = new URL(`${API_CONFIG.baseUrl}/out/${bookie.toLowerCase()}`);
  
    // Whitelist/normalize keys -> query params
    if (extras.source)        u.searchParams.set("src", extras.source);
  
    if (extras.event_id != null) u.searchParams.set("event", String(extras.event_id));
    if (extras.market)        u.searchParams.set("market", extras.market);
    if (extras.selection)     u.searchParams.set("selection", extras.selection);
    if (typeof extras.odds === "number") u.searchParams.set("odds", String(extras.odds));
  
    if (typeof extras.stake === "number")       u.searchParams.set("stake", String(extras.stake));
    if (typeof extras.total_odds === "number")  u.searchParams.set("total_odds", String(extras.total_odds));
    if (typeof extras.potential_win === "number") u.searchParams.set("potential_win", String(extras.potential_win));
    if (typeof extras.available === "number")   u.searchParams.set("available", String(extras.available));
    if (typeof extras.total === "number")       u.searchParams.set("total", String(extras.total));
    if (typeof extras.all_available === "boolean") u.searchParams.set("all_available", extras.all_available ? "1" : "0");
  
    return u.toString();
  }

  export async function logEvent(
    type: "bookie_click" | "filter_change" | "daily_pick_click" | string,
    payload: Partial<{
      bookie: string; event_id: number; market: string; selection: string; source: string; extra: any;
    }>,
  ) {
    try {
      await fetch(`${API_CONFIG.baseUrl}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload }),
        keepalive: true,
      });
    } catch {}
  }
  
  