"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { RecruiterForm } from "@/components/recruiters/RecruiterForm";

export default function NewRecruiterPage() {
  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Recruiters", href: "/admin/recruiters" },
          { label: "New" },
        ]}
        title="Add Recruiter"
        description="Create a recruiter account and set their daily download limit."
      />
      <RecruiterForm mode="create" />
    </div>
  );
}
