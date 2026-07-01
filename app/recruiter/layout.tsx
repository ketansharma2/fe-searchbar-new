"use client";

import {
  LayoutDashboard,
  UserRoundSearch,
  FileText,
  UserRound,
  Settings,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const recruiterNav: NavItem[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Candidates", href: "/recruiter/candidates", icon: UserRoundSearch },
  { label: "Applications", href: "/recruiter/applications", icon: FileText },
  { label: "Profile", href: "/recruiter/profile", icon: UserRound },
  { label: "Settings", href: "/recruiter/settings", icon: Settings },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="RECRUITER">
      <DashboardShell title="Recruiter Workspace" nav={recruiterNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
