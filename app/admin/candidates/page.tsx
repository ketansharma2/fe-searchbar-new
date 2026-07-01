"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function AdminCandidatesPage() {
  return (
    <div>
      <PageHeader
        title="Candidate Management"
        description="Organization-wide view of all candidates in the pipeline."
      />
      <PlaceholderPanel note="Global candidate directory and filters will render here." />
    </div>
  );
}
