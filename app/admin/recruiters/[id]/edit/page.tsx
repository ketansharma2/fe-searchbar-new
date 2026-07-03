"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { RecruiterForm } from "@/components/recruiters/RecruiterForm";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { recruiterApi } from "@/services/recruiter.service";
import { getErrorMessage } from "@/services/api";
import type { Recruiter } from "@/types";

export default function EditRecruiterPage() {
  const { id } = useParams<{ id: string }>();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await recruiterApi.getById(id);
        if (active) setRecruiter(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Recruiter not found"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

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
      {loading ? (
        <DetailSkeleton />
      ) : error || !recruiter ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-destructive">{error ?? "Recruiter not found"}</p>
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
