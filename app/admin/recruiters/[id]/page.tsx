"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, UserCheck, UserX, Gauge } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DetailCard, DetailSection } from "@/components/common/DetailCard";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { recruiterApi } from "@/services/recruiter.service";
import { getErrorMessage } from "@/services/api";
import type { Recruiter } from "@/types";

export default function RecruiterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRecruiter(await recruiterApi.getById(id));
    } catch (err) {
      setError(getErrorMessage(err, "Recruiter not found"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleToggle() {
    if (!recruiter) return;
    try {
      const updated = await recruiterApi.setStatus(recruiter.id, !recruiter.active);
      setRecruiter(updated);
      toast.success(updated.active ? "Recruiter activated" : "Recruiter deactivated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  }

  async function handleDelete() {
    if (!recruiter) return;
    try {
      await recruiterApi.remove(recruiter.id);
      toast.success("Recruiter deleted");
      router.push("/admin/recruiters");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete recruiter"));
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          breadcrumb={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Recruiters", href: "/admin/recruiters" },
            { label: "…" },
          ]}
          title="Recruiter"
        />
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !recruiter) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">{error ?? "Recruiter not found"}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/recruiters">Back to recruiters</Link>
        </Button>
      </div>
    );
  }

  const r = recruiter;

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Recruiters", href: "/admin/recruiters" },
          { label: r.name },
        ]}
        title={r.name}
        description={r.email}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/admin/recruiters")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => setConfirmToggle(true)}>
              {r.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {r.active ? "Deactivate" : "Activate"}
            </Button>
            <Button onClick={() => router.push(`/admin/recruiters/${r.id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge active={r.active} />
          <span className="text-sm text-muted-foreground">
            Joined {new Date(r.createdAt).toLocaleDateString()}
          </span>
        </div>

        <DetailCard title="Account Information">
          <DetailSection
            fields={[
              { label: "Name", value: r.name },
              { label: "Email", value: r.email },
              { label: "Role", value: r.role },
              { label: "Status", value: <StatusBadge active={r.active} /> },
              { label: "Created", value: new Date(r.createdAt).toLocaleString() },
            ]}
          />
        </DetailCard>

        <DetailCard title="Download Usage" icon={Gauge}>
          <DetailSection
            fields={[
              { label: "Daily limit", value: r.dailyDownloadLimit },
              { label: "Used today", value: r.usedToday },
              { label: "Remaining today", value: Math.max(0, r.dailyDownloadLimit - r.usedToday) },
            ]}
          />
        </DetailCard>
      </div>

      <ConfirmDialog
        open={confirmToggle}
        onOpenChange={setConfirmToggle}
        title={r.active ? "Deactivate recruiter?" : "Activate recruiter?"}
        description={
          r.active
            ? `${r.name} will be signed out and blocked from logging in.`
            : `${r.name} will be able to log in again.`
        }
        confirmLabel={r.active ? "Deactivate" : "Activate"}
        destructive={r.active}
        onConfirm={handleToggle}
      />

      <DeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        resource="recruiter"
        recordName={r.name}
        warning="Their logs are removed and their candidates are unassigned."
        onConfirm={handleDelete}
      />
    </div>
  );
}
