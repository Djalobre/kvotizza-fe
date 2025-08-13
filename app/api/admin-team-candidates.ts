// app/api/admin-team-candidates.ts
import { API_CONFIG } from '../../lib/api-config';

const BASE =
  // CRA / custom
  API_CONFIG.baseUrl ??
  // fallback (proxy to backend)
  "http://localhost:3000/api";

const ADMIN_BASE = `${BASE}/admin/team-candidates`;

export type CandidateStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto_approved";

export type Scope = "exact" | "competition" | "sport";

export type Candidate = {
  id: number;
  bookie: string;
  team_name: string;
  competition_name?: string | null;
  country_name?: string | null;
  sport_id: string;
  sport_name: string;
  proposed_canonical_team_name?: string | null;
  is_anchor: boolean;
  status: CandidateStatus;
  suggestion_score?: number | null;
  created_at: string;
  decided_at?: string | null;
};

export type CandidateListResponse = {
  items: Candidate[];
  total: number;
  page: number;
  page_size: number;
};

type ListParams = {
  status?: CandidateStatus;
  sport_id?: string;
  competition_name?: string;
  bookie?: string;
  q?: string;                // NEW: free-text search (team/proposed)
  sort?: string;             // NEW: e.g. "-created_at,suggestion_score"
  page?: number;
  page_size?: number;
  signal?: AbortSignal;      // optional cancel
};

function buildQS(params: ListParams) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.sport_id) qs.set("sport_id", params.sport_id);
  if (params.competition_name) qs.set("competition_name", params.competition_name);
  if (params.bookie) qs.set("bookie", params.bookie);
  if (params.q && params.q.trim()) qs.set("q", params.q.trim());
  if (params.sort && params.sort.trim()) qs.set("sort", params.sort.trim());
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 50));
  return qs.toString();
}

export async function listCandidates(params: ListParams = {}): Promise<CandidateListResponse> {
  const query = buildQS(params);
  const res = await fetch(`${ADMIN_BASE}/?${query}`, { signal: params.signal });
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

export async function approveCandidate(
  id: number,
  canonical_team_name: string,
  country_name?: string,
  apply_scope: Scope = "competition",

) {
  const res = await fetch(`${ADMIN_BASE}/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      canonical_team_name,
      apply_scope,
      country_name, // <-- ADD
    }),
  });
  if (!res.ok) throw new Error(`Approve failed: ${res.status}`);
  return res.json();
}

export async function bulkApprove(
  ids: number[],
  canonical_team_name: string,
  country_name?: string,
  apply_scope: Scope = "competition",
) {
  const res = await fetch(`${ADMIN_BASE}/bulk-approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ids,
      canonical_team_name,
      apply_scope,
      country_name, // <-- ADD
    }),
  });
  if (!res.ok) throw new Error(`Bulk approve failed: ${res.status}`);
  return res.json();
}

export async function rejectCandidate(id: number, reason?: string) {
  const res = await fetch(`${ADMIN_BASE}/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(`Reject failed: ${res.status}`);
  return res.json();
}

/** Optional helper: convert TanStack sorting → backend `sort` string */
export function toSortParam(sortState: { id: string; desc: boolean }[] | undefined) {
  if (!sortState?.length) return undefined;
  return sortState.map(s => (s.desc ? `-${s.id}` : s.id)).join(",");
}
