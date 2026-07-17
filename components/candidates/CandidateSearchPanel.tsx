"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, SlidersHorizontal, Download, RefreshCw, FileText, Users } from "lucide-react";
import type { Crumb } from "@/components/common/Breadcrumb";
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
import { useListQueryState } from "@/hooks/useListQueryState";
import { useCandidateSearch } from "@/hooks/useCandidates";
import { getErrorMessage } from "@/services/api";
import { exportToCsv } from "@/lib/csv";
import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";
import { Eye } from "lucide-react";
import { candidateApi } from "@/services/candidate.service";
import type { CandidateCard, CandidateSearchParams } from "@/types";

const LIMIT = 20;

/**
 * Candidate search/list — shared by the admin and recruiter "Candidates"
 * pages (same API, same permissions per the product's candidate-search
 * rules; only the surrounding page header/breadcrumb/extra actions differ).
 */
export function CandidateSearchPanel({
  basePath,
  breadcrumb,
  headerActions,
}: {
  /** Row click / pagination navigate to `${basePath}/${candidateId}`. */
  basePath: string;
  breadcrumb: Crumb[];
  /** Extra buttons (e.g. "Add Candidate", "Bulk Upload") rendered before Refresh/Export. */
  headerActions?: React.ReactNode;
}) {
  const router = useRouter();

  const [urlState, setUrlState] = useListQueryState({
    q: "",
    location: "",
    designation: "",
    minExp: "",
    maxExp: "",
    skills: [] as string[],
    keywords: [] as string[],
    page: 1,
  });

  // Draft inputs — only committed to the URL (and the actual search) on "Search",
  // matching the existing "search must be an explicit action" business rule.
  const [q, setQ] = useState(urlState.q);
  const [location, setLocation] = useState(urlState.location);
  const [designation, setDesignation] = useState(urlState.designation);
  const [minExp, setMinExp] = useState(urlState.minExp);
  const [maxExp, setMaxExp] = useState(urlState.maxExp);
  const [skills, setSkills] = useState<string[]>(urlState.skills);
  const [keywords, setKeywords] = useState<string[]>(urlState.keywords);
  const [showFilters, setShowFilters] = useState(false);

  // Add after other useState declarations (around line 54)
const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [previewCandidateName, setPreviewCandidateName] = useState("");
const [isFullscreen, setIsFullscreen] = useState(false);
const [isPreviewLoading, setIsPreviewLoading] = useState(false);

const openPreviewModal = async (candidate: CandidateCard) => {
  if (candidate.hasResume && candidate.id) {
    setIsPreviewLoading(true);
    const { url } = await candidateApi.previewResume(candidate.id);

      if (!url) {
        throw new Error("No resume URL received");
      }
   
    setPreviewUrl(url);
    setPreviewCandidateName(candidate.name);
    setIsPreviewModalOpen(true);
    setTimeout(() => setIsPreviewLoading(false), 500);
  } else {
    toast.error("No resume available for this candidate");
  }
};

const closePreviewModal = () => {
  setIsPreviewModalOpen(false);
  setPreviewUrl(null);
  setPreviewCandidateName("");
};

const toggleFullscreen = () => {
  setIsFullscreen(!isFullscreen);
};

  const hasCriteria =
    Boolean(urlState.q) ||
    Boolean(urlState.location) ||
    Boolean(urlState.designation) ||
    urlState.minExp !== "" ||
    urlState.maxExp !== "" ||
    urlState.skills.length > 0 ||
    urlState.keywords.length > 0;

  function runSearch() {
    const hasAny =
      q.trim() ||
      location.trim() ||
      designation.trim() ||
      minExp !== "" ||
      maxExp !== "" ||
      skills.length ||
      keywords.length;
    if (!hasAny) {
      toast.error("Enter at least one search criterion");
      return;
    }
    setUrlState({
      q: q.trim(),
      location: location.trim(),
      designation: designation.trim(),
      minExp,
      maxExp,
      skills,
      keywords,
      page: 1,
    });
  }

  const searchParams: CandidateSearchParams = {
    q: urlState.q || undefined,
    location: urlState.location || undefined,
    designation: urlState.designation || undefined,
    minExp: urlState.minExp !== "" ? Number(urlState.minExp) : undefined,
    maxExp: urlState.maxExp !== "" ? Number(urlState.maxExp) : undefined,
    skills: urlState.skills.length ? urlState.skills : undefined,
    keywords: urlState.keywords.length ? urlState.keywords : undefined,
    page: urlState.page,
    limit: LIMIT,
  };

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useCandidateSearch(searchParams, { enabled: hasCriteria });

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
          <Badge variant="muted" className="gap-1"  onClick={(e) => {
          e.stopPropagation();
          openPreviewModal(c);
        }}>
            <FileText className="h-3 w-3" /> View
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={breadcrumb}
        title="Candidates"
        description="Find matching candidates by skills, location, experience, and more."
        actions={
          <>
            {headerActions}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={!hasCriteria || isLoading}
            >
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
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
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
      {!hasCriteria ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            icon={Search}
            title="Search for candidates"
            description="Enter a query or filter above to see matching candidates."
          />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(c) => c.id}
            loading={isLoading}
            error={isError ? getErrorMessage(error, "Search failed") : null}
            onRetry={() => refetch()}
            onRowClick={(c) => router.push(`${basePath}/${c.id}`)}
            empty={
              <EmptyState icon={Users} title="No candidates found" description="Try broadening your criteria." />
            }
          />
          {result && rows.length > 0 && (
            <div className="mt-4">
              <Pagination meta={result.pagination} onPageChange={(page) => setUrlState({ page })} />
            </div>
          )}
        </>
      )}
      <ResumePreviewModal
  open={isPreviewModalOpen}
  onOpenChange={closePreviewModal}
  previewUrl={previewUrl}
  candidateName={previewCandidateName}
  isFullscreen={isFullscreen}
  onToggleFullscreen={toggleFullscreen}
  isLoading={isPreviewLoading}
/>
    </div>
  );
}
