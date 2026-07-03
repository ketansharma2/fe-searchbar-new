"use client";

import { useState } from "react";
import { UserPlus, Upload } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ManualAddForm } from "@/components/candidates/ManualAddForm";
import { BulkUploadPanel } from "@/components/candidates/BulkUploadPanel";
import { cn } from "@/lib/utils";

type Tab = "manual" | "bulk";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "manual", label: "Add Candidate", icon: UserPlus },
  { id: "bulk", label: "Bulk Upload", icon: Upload },
];

export default function CandidateManagementPage() {
  const [tab, setTab] = useState<Tab>("manual");

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Candidate Management" },
        ]}
        title="Candidate Management"
        description="Add candidates individually or import many at once from a spreadsheet."
      />

      <div className="mb-6 inline-flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "manual" ? <ManualAddForm /> : <BulkUploadPanel />}
    </div>
  );
}
