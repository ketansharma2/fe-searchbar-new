"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Download,
  RefreshCw,
  FileText,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/common/TagInput";
import { candidateApi } from "@/services/candidate.service";
import { getErrorMessage } from "@/services/api";
import { exportToCsv } from "@/lib/csv";
import type { CandidateCard, CandidateSearchParams, Paginated } from "@/types";

const LIMIT = 20;

export default function CandidateListPage() {
  const router = useRouter();

  // criteria inputs
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [designation, setDesignation] = useState("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [applied, setApplied] = useState<CandidateSearchParams | null>(null);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<CandidateCard> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildParams = useCallback((): CandidateSearchParams => {
    const p: CandidateSearchParams = {};
    if (q.trim()) p.q = q.trim();
    if (location.trim()) p.location = location.trim();
    if (designation.trim()) p.designation = designation.trim();
    if (minExp !== "") p.minExp = Number(minExp);
    if (maxExp !== "") p.maxExp = Number(maxExp);
    if (skills.length) p.skills = skills;
    if (keywords.length) p.keywords = keywords;
    return p;
  }, [q, location, designation, minExp, maxExp, skills, keywords]);

  function runSearch() {
    const params = buildParams();
    if (Object.keys(params).length === 0) {
      toast.error("Enter at least one search criterion");
      return;
    }
    setPage(1);
    setApplied(params);
  }

  useEffect(() => {
    if (!applied) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await candidateApi.search({ ...applied, page, limit: LIMIT });
        if (active) setResult(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Search failed"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applied, page]);

  const rows = result?.data ?? [];

  function doExport() {
    exportToCsv(
      "candidates.csv",
      rows.map((c) => ({
        name: c.name,
        designation: c.designation ?? "",
        location: c.location ?? "",
        experience: c.relevantExp ?? "",
        company: c.recentCompany ?? "",
      })),
      [
        { key: "name", header: "Name" },
        { key: "designation", header: "Designation" },
        { key: "location", header: "Location" },
        { key: "experience", header: "Experience (yrs)" },
        { key: "company", header: "Recent Company" },
      ]
    );
  }

  const columns: Column<CandidateCard>[] = [
    { key: "name", header: "Candidate", render: (c) => <span className="font-medium">{c.name}</span> },
    {
      key: "designation",
      header: "Designation",
      render: (c) => <span className="text-muted-foreground">{c.designation ?? "—"}</span>,
    },
    { key: "location", header: "Location", render: (c) => c.location ?? "—" },
    {
      key: "relevantExp",
      header: "Experience",
      render: (c) => (c.relevantExp !== undefined ? `${c.relevantExp} yrs` : "—"),
    },
    { key: "recentCompany", header: "Company", render: (c) => c.recentCompany ?? "—" },
    {
      key: "resume",
      header: "Resume",
      render: (c) =>
        c.hasResume ? (
          <Badge variant="muted" className="gap-1">
            <FileText className="h-3 w-3" /> Yes
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Dashboard", href: "/recruiter/dashboard" }, { label: "Candidates" }]}
        title="Search Candidates"
        description="Find matching candidates by skills, location, experience, and more."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => applied && setApplied({ ...applied })} disabled={!applied || loading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={doExport} disabled={rows.length === 0}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {/* Search + filters */}
      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Name, company, skill, designation…"
              className="flex-1"
            />
            <div className="sm:w-56">
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((s) => !s)}
              className={showFilters ? "border-primary text-primary" : ""}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
            <Button onClick={runSearch}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Frontend Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Min experience</Label>
                  <Input type="number" min={0} value={minExp} onChange={(e) => setMinExp(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max experience</Label>
                  <Input type="number" min={0} value={maxExp} onChange={(e) => setMaxExp(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills (all must match)</Label>
                <TagInput value={skills} onChange={setSkills} placeholder="Add a skill…" />
              </div>
              <div className="space-y-2">
                <Label>Resume keywords</Label>
                <TagInput value={keywords} onChange={setKeywords} placeholder="Add a keyword…" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {!applied ? (
        <div className="rounded-xl border bg-card">
          <EmptyState icon={Search} title="Search for candidates" description="Enter a query or filter above to see matching candidates." />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(c) => c.id}
            loading={loading}
            error={error}
            onRetry={() => setApplied({ ...applied })}
            onRowClick={(c) => router.push(`/recruiter/candidates/${c.id}`)}
            empty={
              <EmptyState icon={Users} title="No candidates found" description="Try broadening your criteria." />
            }
          />
          {result && rows.length > 0 && (
            <div className="mt-4">
              <Pagination meta={result.pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
