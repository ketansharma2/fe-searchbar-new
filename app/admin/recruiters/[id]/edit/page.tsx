"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { RecruiterForm } from "@/components/recruiters/RecruiterForm";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useRecruiter } from "@/hooks/useRecruiters";
import { getErrorMessage } from "@/services/api";

export default function EditRecruiterPage() {
  const { id } = useParams<{ id: string }>();
  const { data: recruiter, isLoading, isError, error } = useRecruiter(id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Recruiters", href: "/admin/recruiters" },
          { label: recruiter?.name ?? "…", href: `/admin/recruiters/${id}` },
          { label: "Edit" },
        ]}
        title={recruiter ? `Edit ${recruiter.name}` : "Edit Recruiter"}
      />
      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !recruiter ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-destructive">
            {isError ? getErrorMessage(error, "Recruiter not found") : "Recruiter not found"}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/recruiters">Back to recruiters</Link>
          </Button>
        </div>
      ) : (
        <RecruiterForm mode="edit" recruiter={recruiter} />
      )}
    </div>
  );
}
