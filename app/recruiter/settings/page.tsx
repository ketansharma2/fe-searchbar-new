"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Notification preferences and workspace configuration."
      />
      <PlaceholderPanel note="Preference toggles and settings forms will render here." />
    </div>
  );
}
