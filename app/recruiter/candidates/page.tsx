"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function RecruiterCandidatesPage() {
  return (
    <div>
      <PageHeader
        title="Candidates"
        description="Candidates assigned to you across all your open roles."
      />
      <PlaceholderPanel note="Your candidate list with search and filters will render here." />
    </div>
  );
}
