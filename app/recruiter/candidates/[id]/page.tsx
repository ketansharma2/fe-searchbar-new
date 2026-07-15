"use client";

import { useParams } from "next/navigation";
import { CandidateDetailView } from "@/components/candidates/CandidateDetailView";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <CandidateDetailView
      id={id}
      backHref="/recruiter/candidates"
      breadcrumb={[
        { label: "Dashboard", href: "/recruiter/dashboard" },
        { label: "Candidates", href: "/recruiter/candidates" },
      ]}
    />
  );
}
