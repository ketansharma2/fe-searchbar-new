"use client";

import Link from "next/link";
import { Download, Search, Repeat2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { useMyUsage } from "@/hooks/useUsage";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useListQueryState } from "@/hooks/useListQueryState";
import { activityMessage, buildSearchReplayHref } from "@/lib/activityMessages";
import { formatDeltaPct, formatRelativeTime } from "@/lib/format";
import { toApiDateRange } from "@/lib/dateRange";
import type { DateRangeParams } from "@/types";

/** Real daily download quota, from GET /api/usage/me — always "today", regardless of the selected range. */
function QuotaCard({ range }: { range?: DateRangeParams }) {
  const { data: usage, isLoading } = useMyUsage(range);

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
          <Link href="/recruiter/candidates">
            <Search className="h-4 w-4" /> Search candidates
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="space-y-4">
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
            {usage?.range && (
              <div className="flex items-center justify-between border-t pt-3">
                <p className="text-sm text-muted-foreground">Downloads in selected range</p>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">{usage.range.count}</p>
                  {formatDeltaPct(usage.range.deltaPct) && (
                    <p className="text-xs text-muted-foreground">{formatDeltaPct(usage.range.deltaPct)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Last 5 searches, replayable — reuses the Activity Logs API (self-scoped for recruiters). */
function RecentSearchesCard({ range }: { range?: DateRangeParams }) {
  const { data, isLoading } = useActivityLogs({
    type: "search_candidates",
    limit: 5,
    from: range?.from,
    to: range?.to,
  });
  const rows = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Search} title="No recent searches found" />
        ) : (
          <div className="space-y-3">
            {rows.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{activityMessage(log)}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={buildSearchReplayHref(log.details)}>
                    <Repeat2 className="h-4 w-4" /> Replay
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useListQueryState({ from: "", to: "" });
  const apiRange = toApiDateRange(dateRange.from, dateRange.to);

  return (
    <div>
      <SectionHeader
        title={`Hi, ${user?.email?.split("@")[0] ?? "Recruiter"}`}
        description="Your search quota and recent activity at a glance."
        actions={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      />

      <div className="space-y-6">
        <QuotaCard range={apiRange} />
        <RecentSearchesCard range={apiRange} />
      </div>
    </div>
  );
}
