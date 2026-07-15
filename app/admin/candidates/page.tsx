"use client";

import Link from "next/link";
import { UserPlus, Upload } from "lucide-react";
import { CandidateSearchPanel } from "@/components/candidates/CandidateSearchPanel";
import { Button } from "@/components/ui/button";

export default function AdminCandidatesPage() {
  return (
    <CandidateSearchPanel
      basePath="/admin/candidates"
      breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Candidates" }]}
      headerActions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/candidates/bulk-upload">
              <Upload className="h-4 w-4" /> Bulk Upload
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/candidates/new">
              <UserPlus className="h-4 w-4" /> Add Candidate
            </Link>
          </Button>
        </>
      }
    />
  );
}
