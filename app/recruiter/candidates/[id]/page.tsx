"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Download,
  GraduationCap,
  MessageSquare,
  User,
  Briefcase,
} from "lucide-react";
import axios from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { DetailCard, DetailSection } from "@/components/common/DetailCard";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { candidateApi } from "@/services/candidate.service";
import { getErrorMessage } from "@/services/api";
import type { Candidate } from "@/types";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await candidateApi.getById(id);
        if (active) setCandidate(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Candidate not found"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function previewResume() {
    try {
      const { url } = await candidateApi.previewResume(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not open resume"));
    }
  }

  async function downloadResume() {
    setDownloading(true);
    try {
      const { url, usage } = await candidateApi.downloadResume(id);
      window.open(url, "_blank", "noopener,noreferrer");
      if (!usage.unlimited && usage.remaining !== undefined) {
        toast.success(`Resume downloaded — ${usage.remaining} download(s) left today`);
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

  async function submitRemark() {
    if (!remark.trim()) {
      toast.error("Remark cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await candidateApi.addRemark(id, remark.trim());
      setCandidate(updated);
      setRemark("");
      toast.success("Remark added");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add remark"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          breadcrumb={[
            { label: "Dashboard", href: "/recruiter/dashboard" },
            { label: "Candidates", href: "/recruiter/candidates" },
            { label: "…" },
          ]}
          title="Candidate"
        />
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">{error ?? "Candidate not found"}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/recruiter/candidates">Back to search</Link>
        </Button>
      </div>
    );
  }

  const c = candidate;

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/recruiter/dashboard" },
          { label: "Candidates", href: "/recruiter/candidates" },
          { label: c.name },
        ]}
        title={c.name}
        description={c.designation}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/recruiter/candidates")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {c.resumeUrl && (
              <>
                {/* Preview = free (no quota). */}
                <Button variant="outline" onClick={previewResume}>
                  <FileText className="h-4 w-4" /> View Resume
                </Button>
                {/* Download = metered against the daily limit. */}
                <Button onClick={downloadResume} disabled={downloading}>
                  {downloading ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  Download
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="space-y-4">
        <DetailCard title="Basic Information" icon={User}>
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
              { label: "Relevant Exp", value: c.relevantExp !== undefined ? `${c.relevantExp} yrs` : undefined },
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
                  <p className="mb-1.5 text-xs text-muted-foreground">Top skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.topSkills.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {c.skillsAll.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">All skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skillsAll.map((s) => (
                      <Badge key={s} variant="muted">{s}</Badge>
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
                <div key={i} className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm">
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

        <DetailCard title="Remarks" icon={MessageSquare}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a remark about this candidate…"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={submitRemark} disabled={submitting} size="sm">
                  {submitting && <Spinner className="h-4 w-4" />}
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
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
