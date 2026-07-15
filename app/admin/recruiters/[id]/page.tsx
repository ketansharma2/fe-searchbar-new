"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Gauge } from "lucide-react";
import { DetailHeader } from "@/components/common/DetailHeader";
import { DangerZone } from "@/components/common/DangerZone";
import { DetailCard, DetailSection } from "@/components/common/DetailCard";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useRecruiter, useSetRecruiterStatus, useDeleteRecruiter } from "@/hooks/useRecruiters";
import { getErrorMessage } from "@/services/api";
import { formatDateTime } from "@/lib/format";

export default function RecruiterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: recruiter, isLoading, isError, error } = useRecruiter(id);
  const setStatus = useSetRecruiterStatus();
  const remove = useDeleteRecruiter();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);

  async function handleToggle() {
    if (!recruiter) return;
    try {
      const updated = await setStatus.mutateAsync({ id: recruiter.id, active: !recruiter.active });
      toast.success(updated.active ? "Recruiter activated" : "Recruiter deactivated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  }

  async function handleDelete() {
    if (!recruiter) return;
    try {
      await remove.mutateAsync(recruiter.id);
      toast.success("Recruiter deleted");
      router.push("/admin/recruiters");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete recruiter"));
    }
  }

  if (isLoading) {
    return (
      <div>
        <DetailHeader
          breadcrumb={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Recruiters", href: "/admin/recruiters" },
            { label: "…" },
          ]}
          title="Recruiter"
          backHref="/admin/recruiters"
        />
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !recruiter) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">
          {isError ? getErrorMessage(error, "Recruiter not found") : "Recruiter not found"}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/recruiters">Back to recruiters</Link>
        </Button>
      </div>
    );
  }

  const r = recruiter;

  return (
    <div>
      <DetailHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Recruiters", href: "/admin/recruiters" },
          { label: r.name },
        ]}
        title={r.name}
        description={r.email}
        backHref="/admin/recruiters"
        status={<StatusBadge active={r.active} />}
        primaryAction={{
          label: "Edit",
          icon: Pencil,
          onClick: () => router.push(`/admin/recruiters/${r.id}/edit`),
        }}
      />

      <div className="space-y-4">
        <DetailCard title="Account Information">
          <DetailSection
            fields={[
              { label: "Name", value: r.name },
              { label: "Email", value: r.email },
              { label: "Role", value: r.role },
              { label: "Status", value: <StatusBadge active={r.active} /> },
              { label: "Created", value: formatDateTime(r.createdAt) },
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

        <DangerZone
          actions={[
            {
              label: r.active ? "Deactivate recruiter" : "Activate recruiter",
              description: r.active
                ? "Signs them out and blocks login immediately. Can be reversed at any time."
                : "Restores their ability to log in.",
              buttonLabel: r.active ? "Deactivate" : "Activate",
              destructive: r.active,
              onClick: () => setConfirmToggle(true),
            },
            {
              label: "Delete recruiter",
              description:
                "Permanently deletes this account. Their logs are removed and their candidates are unassigned.",
              buttonLabel: "Delete",
              onClick: () => setConfirmDelete(true),
            },
          ]}
        />
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
        requireTypedConfirmation
        onConfirm={handleDelete}
      />
    </div>
  );
}
