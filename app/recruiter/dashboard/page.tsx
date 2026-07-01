"use client";

import { UserRoundSearch, FileText, CalendarCheck, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, StatGrid, type Stat } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats: Stat[] = [
  { label: "My Candidates", value: "86", icon: UserRoundSearch, delta: "+9 this week" },
  { label: "Open Applications", value: "31", icon: FileText, delta: "+4" },
  { label: "Interviews Today", value: "5", icon: CalendarCheck },
  { label: "Shortlisted", value: "18", icon: Star, delta: "+2" },
];

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title={`Hi, ${user?.email?.split("@")[0] ?? "Recruiter"}`}
        description="Your candidates and applications at a glance."
      />
      <StatGrid stats={stats} />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Aarav Sharma", role: "Frontend Engineer", time: "10:30 AM" },
              { name: "Priya Nair", role: "Product Designer", time: "12:00 PM" },
              { name: "Rohan Gupta", role: "Backend Engineer", time: "3:15 PM" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </div>
                <span className="text-sm text-muted-foreground">{c.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Stages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Applied", value: 42, color: "bg-blue-500" },
              { label: "Screening", value: 28, color: "bg-indigo-500" },
              { label: "Interview", value: 16, color: "bg-violet-500" },
              { label: "Offer", value: 6, color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">{s.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${s.color}`}
                    style={{ width: `${(s.value / 42) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
