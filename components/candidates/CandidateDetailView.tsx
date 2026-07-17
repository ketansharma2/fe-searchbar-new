"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  GraduationCap,
  MessageSquare,
  User,
  Briefcase,
  X,
  Maximize2,
  Minimize2,
  Eye,
} from "lucide-react";
import axios from "axios";
import type { Crumb } from "@/components/common/Breadcrumb";
import { DetailHeader } from "@/components/common/DetailHeader";
import { DetailCard, DetailSection } from "@/components/common/DetailCard";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useCandidate, useAddCandidateRemark } from "@/hooks/useCandidates";
import { candidateApi } from "@/services/candidate.service";
import { getErrorMessage } from "@/services/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";
/**
 * Candidate detail — shared by the admin and recruiter candidate detail
 * pages (same data, same view/download/remark actions for both roles per
 * the product's candidate rules; only breadcrumb/back-navigation differ).
 */
export function CandidateDetailView({
  id,
  breadcrumb,
  backHref,
}: {
  id: string;
  breadcrumb: Crumb[];
  backHref: string;
}) {
  const { data: candidate, isLoading, isError, error } = useCandidate(id);
  const addRemark = useAddCandidateRemark(id);

  const [remark, setRemark] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  async function previewResume() {
    setIsPreviewLoading(true); // Add this
    setPreviewUrl(null); // Add this

    try {
      const { url } = await candidateApi.previewResume(id);

      if (!url) {
        throw new Error("No resume URL received");
      }

      setPreviewUrl(url);
      setIsPreviewModalOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not open resume"));
      setIsPreviewModalOpen(false); // Close modal on error
    } finally {
      setIsPreviewLoading(false); // Add this
    }
  }

  async function downloadResume() {
    setDownloading(true);
    try {
      const { url, usage } = await candidateApi.downloadResume(id);
      window.open(url, "_blank", "noopener,noreferrer");
      if (!usage.unlimited && usage.remaining !== undefined) {
        toast.success(
          `Resume downloaded — ${usage.remaining} download(s) left today`,
        );
      } else {
        toast.success("Resume downloaded");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        toast.error("Daily download limit exceeded");
      } else {
        toast.error(getErrorMessage(err, "Could not download resume"));
      }
    } finally {
      setDownloading(false);
    }
  }

  function closePreviewModal() {
    setIsPreviewModalOpen(false);
    setPreviewUrl(null);
    setIsFullscreen(false);
  }

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  async function submitRemark() {
    if (!remark.trim()) {
      toast.error("Remark cannot be empty");
      return;
    }
    try {
      await addRemark.mutateAsync(remark.trim());
      setRemark("");
      toast.success("Remark added");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add remark"));
    }
  }

  if (isLoading) {
    return (
      <div>
        <DetailHeader
          breadcrumb={[...breadcrumb, { label: "…" }]}
          title="Candidate"
          backHref={backHref}
        />
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">
          {isError
            ? getErrorMessage(error, "Candidate not found")
            : "Candidate not found"}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={backHref}>Back to search</Link>
        </Button>
      </div>
    );
  }

  const c = candidate;

  return (
    <div>
      <DetailHeader
        breadcrumb={[...breadcrumb, { label: c.name }]}
        title={c.name}
        description={c.designation}
        backHref={backHref}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* <TabsTrigger value="resume">Resume</TabsTrigger> */}
          <TabsTrigger value="remarks">
            Remarks{c.remarks.length > 0 ? ` (${c.remarks.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DetailCard
            title="Basic Information"
            icon={User}
            action={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previewResume}
                  className="h-8 gap-1"
                  disabled={isPreviewLoading}
                >
                  {isPreviewLoading ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  View Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadResume}
                  className="h-8 gap-1"
                  disabled={downloading}
                >
                  {downloading ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            }
          >
            <DetailSection
              fields={[
                { label: "Name", value: c.name },
                { label: "Email", value: c.email },
                { label: "Mobile", value: c.mobile },
                { label: "Gender", value: c.gender },
                { label: "Location", value: c.location },
                { label: "Qualification", value: c.qualification },
              ]}
            />
          </DetailCard>

          <DetailCard title="Professional Information" icon={Briefcase}>
            <DetailSection
              fields={[
                { label: "Designation", value: c.designation },
                { label: "Experience", value: c.experience },
                {
                  label: "Relevant Exp",
                  value:
                    c.relevantExp !== undefined
                      ? `${c.relevantExp} yrs`
                      : undefined,
                },
                { label: "Recent Company", value: c.recentCompany },
                { label: "Current CTC", value: c.currCTC },
                { label: "Expected CTC", value: c.expCTC },
                { label: "Portal", value: c.portal },
              ]}
            />
          </DetailCard>

          {(c.topSkills.length > 0 || c.skillsAll.length > 0) && (
            <DetailCard title="Skills">
              <div className="space-y-3">
                {c.topSkills.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      Top skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.topSkills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {c.skillsAll.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      All skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.skillsAll.map((s) => (
                        <Badge key={s} variant="muted">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DetailCard>
          )}

          {c.education.length > 0 && (
            <DetailCard title="Education" icon={GraduationCap}>
              <div className="space-y-2">
                {c.education.map((e, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"
                  >
                    <span className="font-medium">{e.degree || "—"}</span>
                    <span className="text-muted-foreground">{e.institute}</span>
                    <span className="text-muted-foreground">
                      {[e.passingYear, e.score].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </DetailCard>
          )}

          {c.feedback && (
            <DetailCard title="Feedback">
              <p className="text-sm">{c.feedback}</p>
            </DetailCard>
          )}
        </TabsContent>

        <TabsContent value="resume">
          <DetailCard title="Resume" icon={FileText}>
            {c.resumeUrl ? (
              <div className="space-y-4">
                <DetailSection
                  fields={[
                    { label: "Portal", value: c.portal },
                    {
                      label: "Portal Date",
                      value: c.portalDate
                        ? formatDate(c.portalDate)
                        : undefined,
                    },
                  ]}
                />
                <div className="flex flex-wrap gap-2">
                  {/* Preview = free (no quota). */}
                  <Button
                    variant="outline"
                    onClick={previewResume}
                    disabled={isPreviewLoading}
                  >
                    {isPreviewLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    View Resume
                  </Button>
                  {/* Download = metered against the daily limit. */}
                  <Button onClick={downloadResume} disabled={downloading}>
                    {downloading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resume on file for this candidate.
              </p>
            )}
          </DetailCard>
        </TabsContent>

        <TabsContent value="remarks">
          <DetailCard title="Remarks" icon={MessageSquare}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a remark about this candidate…"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={submitRemark}
                    disabled={addRemark.isPending}
                    size="sm"
                  >
                    {addRemark.isPending && <Spinner className="h-4 w-4" />}
                    Add Remark
                  </Button>
                </div>
              </div>

              {c.remarks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No remarks yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...c.remarks].reverse().map((r, i) => (
                    <div key={r._id ?? i} className="rounded-lg border p-3">
                      <p className="text-sm">{r.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.authorName || r.authorEmail || "Unknown"} ·{" "}
                        {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DetailCard>
        </TabsContent>
      </Tabs>
      {/* Resume Preview Modal - Now using the component */}
      <ResumePreviewModal
        open={isPreviewModalOpen}
        onOpenChange={closePreviewModal}
        previewUrl={previewUrl}
        candidateName={c.name}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isLoading={isPreviewLoading}
      />
    </div>
  );
}
