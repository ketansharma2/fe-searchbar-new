"use client";

import { CandidateSearchPanel } from "@/components/candidates/CandidateSearchPanel";

export default function CandidateListPage() {
  return (
    <CandidateSearchPanel
      basePath="/recruiter/candidates"
      breadcrumb={[{ label: "Dashboard", href: "/recruiter/dashboard" }, { label: "Candidates" }]}
    />
  );
}
