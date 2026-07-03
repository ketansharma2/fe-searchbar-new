"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRoundSearch, FileText, CalendarCheck, Star, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, StatGrid, type Stat } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usageApi } from "@/services/usage.service";
import type { MyUsage } from "@/types";

const stats: Stat[] = [
  { label: "My Candidates", value: "86", icon: UserRoundSearch, delta: "+9 this week" },
  { label: "Open Applications", value: "31", icon: FileText, delta: "+4" },
  { label: "Interviews Today", value: "5", icon: CalendarCheck },
  { label: "Shortlisted", value: "18", icon: Star, delta: "+2" },
];

/** Real daily download quota, from GET /api/usage/me. */
function QuotaCard() {
  const [usage, setUsage] = useState<MyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    usageApi
      .me()
      .then((u) => active && setUsage(u))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const used = usage?.usedToday ?? 0;
  const limit = usage?.dailyDownloadLimit ?? 0;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" /> Resume Downloads Today
        </CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link href="/recruiter/candidates">Search candidates</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold tabular-nums">
                {used}
                <span className="text-lg font-medium text-muted-foreground">
                  {" "}
                  / {usage?.unlimited ? "∞" : limit}
                </span>
              </p>
              {!usage?.unlimited && (
                <p className="text-sm text-muted-foreground">
                  {usage?.remaining ?? 0} remaining
                </p>
              )}
            </div>
            {!usage?.unlimited && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={pct >= 100 ? "h-full bg-destructive" : "h-full bg-primary"}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title={`Hi, ${user?.email?.split("@")[0] ?? "Recruiter"}`}
        description="Your candidates and applications at a glance."
      />
      <div className="mb-6">
        <QuotaCard />
      </div>
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
