"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function ApplicationsPage() {
  return (
    <div>
      <PageHeader
        title="Applications"
        description="Track applications through each stage of your pipeline."
      />
      <PlaceholderPanel note="Application kanban / table will render here." />
    </div>
  );
}
