"use client";

import { PageHeader, PlaceholderPanel } from "@/components/dashboard/widgets";

export default function RecruiterManagementPage() {
  return (
    <div>
      <PageHeader
        title="Recruiter Management"
        description="Invite, manage, and deactivate recruiter accounts."
      />
      <PlaceholderPanel note="Recruiter table, invitations, and role controls will render here." />
    </div>
  );
}
