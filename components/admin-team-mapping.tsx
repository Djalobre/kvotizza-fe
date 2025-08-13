"use client"

import React, { useEffect, useState } from "react";
import {
  Candidate, CandidateStatus, CandidateListResponse, Scope,
  listCandidates, approveCandidate, rejectCandidate
} from "@/app/api/admin-team-candidates";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusOptions: CandidateStatus[] = ["pending", "approved", "rejected", "auto_approved"];

export default function AdminTeamMapping() {
  // filters
  const [status, setStatus] = useState<CandidateStatus>("pending");
  const [sportId, setSportId] = useState("");
  const [competition, setCompetition] = useState("");
  const [bookie, setBookie] = useState("");

  // paging
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // sorting
  const [sort, setSort] = useState<string>("default");

  // data
  const [rows, setRows] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // inline edits
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [countryEdits, setCountryEdits] = useState<Record<number, string>>({});

  // selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // bulk process state
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res: CandidateListResponse = await listCandidates({
        status,
        sport_id: sportId || undefined,
        competition_name: competition || undefined,
        bookie: bookie || undefined,
        page,
        page_size: pageSize,
        sort: sort === "default" ? undefined : sort
      });
      setRows(res.items);
      setTotal(res.total);
      setEdits(prev => {
        const copy = { ...prev };
        res.items.forEach(r => {
          if (copy[r.id] == null) copy[r.id] = r.proposed_canonical_team_name ?? "";
        });
        return copy;
      });
      setCountryEdits(prev => {
        const copy = { ...prev };
        res.items.forEach(r => {
          if (copy[r.id] == null) copy[r.id] = r.country_name ?? "";
        });
        return copy;
      });
      // keep only still-visible selected ids
      setSelected(sel => new Set([...sel].filter(id => res.items.some(r => r.id === id))));
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchData();
  };

  const resetFilters = () => {
    setStatus("pending");
    setSportId("");
    setCompetition("");
    setBookie("");
    setSort("default");
    setPage(1);
    setPageSize(50);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const toggleAll = () => {
    if (rows.length > 0 && rows.every(r => selected.has(r.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map(r => r.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const nx = new Set(prev);
      nx.has(id) ? nx.delete(id) : nx.add(id);
      return nx;
    });
  };

  const setEdit = (id: number, val: string) => setEdits(prev => ({ ...prev, [id]: val }));
  const setCountryEdit = (id: number, val: string) => setCountryEdits(prev => ({ ...prev, [id]: val }));

  async function onApprove(id: number, scope: Scope) {
    const canonical = (edits[id] ?? "").trim();
    const country = (countryEdits[id] ?? "").trim();
    if (!canonical) return alert("Canonical name required");
    try {
      await approveCandidate(id, canonical, country, scope);
    } catch (e: any) {
      throw e;
    }
  }

  async function onReject(id: number) {
    try {
      await rejectCandidate(id);
      await fetchData();
    } catch (e: any) {
      alert(`Reject failed: ${e.message || e}`);
    }
  }

  // NEW: bulk approves selected rows, one by one, using per-row edits
  async function onBulkApproveExact() {
    const ids = [...selected];
    if (!ids.length) return alert("Select at least one row");

    // validate inputs before hitting backend
    const missing = ids.filter(id => !(edits[id] ?? "").trim());
    if (missing.length) {
      return alert(`Missing canonical name for IDs: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "…" : ""}`);
    }

    setBulkLoading(true);
    const results: { id: number; ok: boolean; err?: string }[] = [];

    try {
      // sequential to avoid thundering herd (adjust to Promise.all if you prefer)
      for (const id of ids) {
        try {
          await onApprove(id, "exact");
          results.push({ id, ok: true });
        } catch (e: any) {
          results.push({ id, ok: false, err: e?.message || String(e) });
        }
      }
      const okCount = results.filter(r => r.ok).length;
      const fail = results.filter(r => !r.ok);
      if (fail.length) {
        console.warn("Some approvals failed:", fail);
        alert(`Bulk approve finished. Success: ${okCount}, Failed: ${fail.length}\nFirst error: ${fail[0].id} -> ${fail[0].err}`);
      } else {
        alert(`Bulk approve finished. Success: ${okCount}.`);
      }
      // clear selection after bulk action
      setSelected(new Set());
      await fetchData();
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Filters */}
      <Card className="sticky top-0 z-10">
        <CardHeader className="pb-2">
          <CardTitle>Team Mapping Candidates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-8 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as CandidateStatus)}>
              <SelectTrigger><SelectValue placeholder="status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Sport ID</label>
            <Input value={sportId} onChange={e => setSportId(e.target.value)} placeholder="e.g. 5" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Competition</label>
            <Input value={competition} onChange={e => setCompetition(e.target.value)} placeholder="SuperLiga" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Bookie</label>
            <Input value={bookie} onChange={e => setBookie(e.target.value)} placeholder="mozzartbet" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Sort</label>
            <Select value={sort} onValueChange={v => setSort(v)}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="proposed_canonical_team_name">Proposed ↑</SelectItem>
                <SelectItem value="-proposed_canonical_team_name">Proposed ↓</SelectItem>
                <SelectItem value="team_name">Team Name ↑</SelectItem>
                <SelectItem value="-team_name">Team Name ↓</SelectItem>
                <SelectItem value="suggestion_score">Score ↑</SelectItem>
                <SelectItem value="-suggestion_score">Score ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Page</label>
            <Input type="number" value={page} onChange={e => setPage(parseInt(e.target.value || "1", 10))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Page Size</label>
            <Input type="number" value={pageSize} onChange={e => setPageSize(parseInt(e.target.value || "50", 10))} />
          </div>
          <div className="flex gap-2 items-end">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      <Card>
        <CardContent className="py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `Showing ${rows.length} of ${total} (page ${page}/${pages})`}
            {error && <span className="ml-2 text-destructive">{error}</span>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={onBulkApproveExact} disabled={bulkLoading || selected.size === 0}>
              {bulkLoading ? "Approving…" : `Bulk Approve Selected ${selected.size ? `(${selected.size})` : ""}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={rows.length > 0 && rows.every(r => selected.has(r.id))}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Bookie</TableHead>
                <TableHead>Team (raw)</TableHead>
                <TableHead>Canonical Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Anchor</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleOne(r.id)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.bookie}</TableCell>
                  <TableCell title={r.team_name}>{r.team_name}</TableCell>
                  <TableCell>
                    <Input
                      value={edits[r.id] ?? ""}
                      onChange={e => setEdit(r.id, e.target.value)}
                      className="w-64"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={countryEdits[r.id] ?? ""}
                      onChange={e => setCountryEdit(r.id, e.target.value)}
                      placeholder="Country"
                      className="w-40"
                    />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {r.suggestion_score != null ? r.suggestion_score.toFixed(1) : "–"}
                  </TableCell>
                  <TableCell title={r.competition_name || ""}>
                    {r.competition_name ? r.competition_name : <span className="text-muted-foreground">n/a</span>}
                  </TableCell>
                  <TableCell>
                    {r.sport_name} <span className="text-muted-foreground">({r.sport_id})</span>
                  </TableCell>
                  <TableCell>
                    {r.is_anchor ? <Badge>Anchor</Badge> : <Badge variant="outline">No</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={async () => { try { await onApprove(r.id, "exact"); await fetchData(); } catch (e: any) { alert(`Approve failed: ${e.message || e}`); } }}>
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => onReject(r.id)}>Reject</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && !loading && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pager */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
          Prev
        </Button>
        <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
        <Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>
          Next
        </Button>
      </div>
    </div>
  );
}
