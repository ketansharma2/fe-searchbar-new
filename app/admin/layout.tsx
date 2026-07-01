"use client";

import {
  LayoutDashboard,
  Users,
  UserRoundSearch,
  BarChart3,
  ScrollText,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Recruiter Management", href: "/admin/recruiters", icon: Users },
  { label: "Candidate Management", href: "/admin/candidates", icon: UserRoundSearch },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Activity Logs", href: "/admin/activity", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="ADMIN">
      <DashboardShell title="Admin Console" nav={adminNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
