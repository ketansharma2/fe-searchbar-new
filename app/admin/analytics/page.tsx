"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Recruitment funnel metrics, time-to-hire, and source performance."
      />
      <PlaceholderPanel note="Charts and exportable reports will render here." />
    </div>
  );
}
