"use client";

import { Users, UserRoundSearch, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, StatGrid, type Stat } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats: Stat[] = [
  { label: "Total Recruiters", value: "24", icon: Users, delta: "+3 this month" },
  { label: "Active Candidates", value: "1,284", icon: UserRoundSearch, delta: "+128" },
  { label: "Open Applications", value: "342", icon: FileText, delta: "+21" },
  { label: "Placement Rate", value: "68%", icon: TrendingUp, delta: "+4.2%" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  console.log('[AdminDashboard] Page rendered, user:', user);
  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.email?.split("@")[0] ?? "Admin"}`}
        description="Here's what's happening across your recruitment organization."
      />
      <StatGrid stats={stats} />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Hiring Pipeline (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-2">
              {[40, 65, 52, 78, 60, 90, 72, 84, 58, 96, 70, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "New recruiter onboarded",
              "42 candidates imported",
              "Analytics report generated",
              "Role permissions updated",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">{t}</p>
                  <p className="text-xs text-muted-foreground">{i + 1}h ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
