"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { BulkUploadPanel } from "@/components/candidates/BulkUploadPanel";

export default function BulkUploadCandidatesPage() {
  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Candidates", href: "/admin/candidates" },
          { label: "Bulk Upload" },
        ]}
        title="Bulk Upload"
        description="Import many candidates at once from an Excel or CSV file."
      />
      <BulkUploadPanel />
    </div>
  );
}
