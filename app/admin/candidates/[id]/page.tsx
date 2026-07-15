"use client";

import { useParams } from "next/navigation";
import { CandidateDetailView } from "@/components/candidates/CandidateDetailView";

export default function AdminCandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <CandidateDetailView
      id={id}
      backHref="/admin/candidates"
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Candidates", href: "/admin/candidates" },
      ]}
    />
  );
}
