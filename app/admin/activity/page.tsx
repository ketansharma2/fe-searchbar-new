"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function ActivityLogsPage() {
  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Audit trail of logins, role changes, and administrative actions."
      />
      <PlaceholderPanel note="Chronological audit log entries will render here." />
    </div>
  );
}
