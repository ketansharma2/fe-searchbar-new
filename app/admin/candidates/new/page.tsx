"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ManualAddForm } from "@/components/candidates/ManualAddForm";

export default function NewCandidatePage() {
  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Candidates", href: "/admin/candidates" },
          { label: "Add Candidate" },
        ]}
        title="Add Candidate"
        description="Add a single candidate with full details and a resume PDF."
      />
      <ManualAddForm />
    </div>
  );
}
