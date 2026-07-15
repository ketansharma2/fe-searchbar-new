"use client";

import { LayoutDashboard, UserRoundSearch, UserRound } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const recruiterNav: NavItem[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Candidates", href: "/recruiter/candidates", icon: UserRoundSearch },
  { label: "Profile", href: "/recruiter/profile", icon: UserRound },
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
