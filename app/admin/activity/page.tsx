"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, RefreshCw, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { FilterPanel } from "@/components/common/FilterPanel";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useListQueryState } from "@/hooks/useListQueryState";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useRecruiters } from "@/hooks/useRecruiters";
import { activityLogApi } from "@/services/activityLog.service";
import {
  activityMessage,
  activityTypeLabel,
  activityTypeTone,
  ACTIVITY_TYPE_OPTIONS,
} from "@/lib/activityMessages";
import { getErrorMessage } from "@/services/api";
import { formatDateTime } from "@/lib/format";
import { toApiDateRange } from "@/lib/dateRange";
import { exportToCsv } from "@/lib/csv";
import type { ActivityLog, ActorTypeFilter } from "@/types";

const LIMIT = 10;

export default function ActivityLogsPage() {
  const [query, setQuery] = useListQueryState({
    type: "all",
    actorType: "all" as ActorTypeFilter,
    userId: "all",
    from: "",
    to: "",
    page: 1,
  });
  const [exporting, setExporting] = useState(false);

  const { data: recruitersResult } = useRecruiters({ status: "all", page: 1, limit: 100 });

  const apiRange = toApiDateRange(query.from, query.to);
  const params = {
    type: query.type !== "all" ? (query.type as ActivityLog["type"]) : undefined,
    actorType: query.actorType,
    userId: query.userId !== "all" ? query.userId : undefined,
    from: apiRange?.from,
    to: apiRange?.to,
    page: query.page,
    limit: LIMIT,
  };

  const { data: result, isLoading, isError, error, refetch } = useActivityLogs(params);
  const rows = result?.data ?? [];

  async function doExport() {
    setExporting(true);
    try {
      const data = await activityLogApi.list({ ...params, page: 1, limit: 100 });
      exportToCsv(
        "activity_logs.csv",
        data.data.map((log) => ({
          timestamp: log.createdAt,
          actor: log.actor.name,
          email: log.actor.email,
          role: log.actor.role,
          type: activityTypeLabel(log.type),
          details: activityMessage(log),
        })),
        [
          { key: "timestamp", header: "Timestamp" },
          { key: "actor", header: "Actor" },
          { key: "email", header: "Email" },
          { key: "role", header: "Role" },
          { key: "type", header: "Activity" },
          { key: "details", header: "Details" },
        ]
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not export logs"));
    } finally {
      setExporting(false);
    }
  }

  const columns: Column<ActivityLog>[] = [
    {
      key: "createdAt",
      header: "Timestamp",
      render: (l) => <span className="text-muted-foreground">{formatDateTime(l.createdAt)}</span>,
    },
    {
      key: "actor",
      header: "Actor",
      render: (l) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{l.actor.name}</span>
            <StatusBadge
              label={l.actor.role === "ADMIN" ? "Admin" : "Recruiter"}
              tone={l.actor.role === "ADMIN" ? "default" : "muted"}
            />
          </div>
          <p className="text-xs text-muted-foreground">{l.actor.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Activity",
      render: (l) => <StatusBadge label={activityTypeLabel(l.type)} tone={activityTypeTone(l.type)} />,
    },
    {
      key: "details",
      header: "Details",
      render: (l) => <span>{activityMessage(l)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Activity Logs" }]}
        title="Activity Logs"
        description="Audit trail of recruiter searches, resume access, and administrative actions."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={doExport}
              disabled={exporting || rows.length === 0}
            >
              <Download className="h-4 w-4" /> {exporting ? "Exporting…" : "Export"}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterPanel
          filters={[
            {
              key: "actorType",
              label: "Actor",
              value: query.actorType,
              onChange: (v) => setQuery({ actorType: v as ActorTypeFilter, page: 1 }),
              options: [
                { value: "all", label: "All actors" },
                { value: "admin", label: "Admin" },
                { value: "recruiter", label: "Recruiter" },
              ],
            },
            {
              key: "type",
              label: "Activity",
              value: query.type,
              onChange: (v) => setQuery({ type: v, page: 1 }),
              options: [{ value: "all", label: "All activity" }, ...ACTIVITY_TYPE_OPTIONS],
            },
            {
              key: "userId",
              label: "Recruiter",
              value: query.userId,
              onChange: (v) => setQuery({ userId: v, page: 1 }),
              options: [
                { value: "all", label: "All recruiters" },
                ...(recruitersResult?.data.map((r) => ({ value: r.id, label: r.name })) ?? []),
              ],
            },
          ]}
        />
        <DateRangeFilter
          value={{ from: query.from, to: query.to }}
          onChange={(range) => setQuery({ ...range, page: 1 })}
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(l) => l.id}
        loading={isLoading}
        error={isError ? getErrorMessage(error, "Failed to load activity logs") : null}
        onRetry={() => refetch()}
        empty={
          <EmptyState icon={ScrollText} title="No activity found" description="Try adjusting your filters." />
        }
      />

      {result && rows.length > 0 && (
        <div className="mt-4">
          <Pagination meta={result.pagination} onPageChange={(page) => setQuery({ page })} />
        </div>
      )}
    </div>
  );
}
