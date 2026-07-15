"use client";

import Link from "next/link";
import { Users, UserRoundSearch, CalendarPlus, ScrollText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader, StatGrid, type Stat } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { useRecruiters, useRecruiterRangeSummary } from "@/hooks/useRecruiters";
import { useGlobalUsage } from "@/hooks/useUsage";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useListQueryState } from "@/hooks/useListQueryState";
import { activityMessage, activityTypeLabel, activityTypeTone } from "@/lib/activityMessages";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDeltaPct, formatRelativeTime } from "@/lib/format";
import { toApiDateRange } from "@/lib/dateRange";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useListQueryState({ from: "", to: "" });
  const apiRange = toApiDateRange(dateRange.from, dateRange.to);
  const hasRange = Boolean(apiRange);

  const { data: summary } = useAnalyticsSummary(apiRange);
  const { data: recruiters } = useRecruiters({ status: "all", page: 1, limit: 1 });
  const { data: recruiterRange } = useRecruiterRangeSummary(dateRange);
  const { data: globalUsage } = useGlobalUsage(apiRange);
  const { data: recentActivity, isLoading: activityLoading } = useActivityLogs({
    page: 1,
    limit: 5,
    from: apiRange?.from,
    to: apiRange?.to,
  });

  const stats: Stat[] = hasRange
    ? [
        {
          label: "Candidates Added",
          value: summary?.range ? summary.range.count.toLocaleString() : "—",
          icon: UserRoundSearch,
          delta: formatDeltaPct(summary?.range?.deltaPct),
        },
        {
          label: "Recruiters Added",
          value: recruiterRange ? recruiterRange.count.toLocaleString() : "—",
          icon: Users,
          delta: formatDeltaPct(recruiterRange?.deltaPct),
        },
        {
          label: "Downloads in Range",
          value: globalUsage?.range ? globalUsage.range.count.toLocaleString() : "—",
          icon: Download,
          delta: formatDeltaPct(globalUsage?.range?.deltaPct),
        },
      ]
    : [
        { label: "Total Candidates", value: summary ? summary.totalCandidates.toLocaleString() : "—", icon: UserRoundSearch },
        { label: "New Today", value: summary ? summary.addedToday.toLocaleString() : "—", icon: CalendarPlus },
        { label: "New Yesterday", value: summary ? summary.addedYesterday.toLocaleString() : "—", icon: CalendarPlus },
        { label: "Total Recruiters", value: recruiters ? recruiters.pagination.total.toLocaleString() : "—", icon: Users },
      ];

  return (
    <div>
      <SectionHeader
        title={`Welcome back, ${user?.email?.split("@")[0] ?? "Admin"}`}
        description="Here's what's happening across your recruitment organization."
        actions={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      />

      <StatGrid stats={stats} />

      <div className="mt-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/activity">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />
                ))}
              </div>
            ) : !recentActivity || recentActivity.data.length === 0 ? (
              <EmptyState icon={ScrollText} title="No recent activity found" />
            ) : (
              <div className="space-y-4">
                {recentActivity.data.map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{log.actor.name}</span> — {activityMessage(log)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</p>
                      </div>
                    </div>
                    <StatusBadge label={activityTypeLabel(log.type)} tone={activityTypeTone(log.type)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
