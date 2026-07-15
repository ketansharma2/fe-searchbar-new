"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw, Download, Eye, Pencil, UserCheck, UserX, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterPanel } from "@/components/common/FilterPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useListQueryState } from "@/hooks/useListQueryState";
import { useRecruiters, useSetRecruiterStatus, useDeleteRecruiter } from "@/hooks/useRecruiters";
import { getErrorMessage } from "@/services/api";
import { exportToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import type { Recruiter, RecruiterStatusFilter } from "@/types";

const LIMIT = 10;

export default function RecruitersListPage() {
  const router = useRouter();

  const [query, setQuery] = useListQueryState({
    search: "",
    status: "all" as RecruiterStatusFilter,
    page: 1,
  });
  const [searchInput, setSearchInput] = useState(query.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== query.search) setQuery({ search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<Recruiter | null>(null);
  const [toToggle, setToToggle] = useState<Recruiter | null>(null);

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useRecruiters({
    search: query.search || undefined,
    status: query.status,
    page: query.page,
    limit: LIMIT,
  });
  const setStatus = useSetRecruiterStatus();
  const remove = useDeleteRecruiter();

  const rows = result?.data ?? [];

  async function handleToggle() {
    if (!toToggle) return;
    try {
      await setStatus.mutateAsync({ id: toToggle.id, active: !toToggle.active });
      toast.success(toToggle.active ? "Recruiter deactivated" : "Recruiter activated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Recruiter deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete recruiter"));
    }
  }

  function doExport() {
    const source = selected.length > 0 ? rows.filter((r) => selected.includes(r.id)) : rows;
    exportToCsv(
      "recruiters.csv",
      source.map((r) => ({
        name: r.name,
        email: r.email,
        status: r.active ? "Active" : "Inactive",
        usedToday: r.usedToday,
        dailyDownloadLimit: r.dailyDownloadLimit,
        createdAt: new Date(r.createdAt).toISOString(),
      })),
      [
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "status", header: "Status" },
        { key: "usedToday", header: "Used Today" },
        { key: "dailyDownloadLimit", header: "Daily Limit" },
        { key: "createdAt", header: "Created" },
      ]
    );
  }

  const columns: Column<Recruiter>[] = [
    {
      key: "name",
      header: "Recruiter",
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (r) => <span className="text-muted-foreground">{r.email}</span>,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge active={r.active} /> },
    {
      key: "usage",
      header: "Usage Today",
      render: (r) => (
        <span className="tabular-nums">
          {r.usedToday} / {r.dailyDownloadLimit}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Recruiters" }]}
        title="Recruiters"
        description="Create, manage, and set download limits for recruiter accounts."
        actions={
          <Button onClick={() => router.push("/admin/recruiters/new")}>
            <Plus className="h-4 w-4" /> Add Recruiter
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name or email…"
            className="sm:max-w-xs sm:flex-1"
          />
          <FilterPanel
            filters={[
              {
                key: "status",
                label: "Status",
                value: query.status,
                onChange: (v) => setQuery({ status: v as RecruiterStatusFilter, page: 1 }),
                options: [
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={doExport} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            {selected.length > 0 ? `Export (${selected.length})` : "Export"}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        loading={isLoading}
        error={isError ? getErrorMessage(error, "Failed to load recruiters") : null}
        onRetry={() => refetch()}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        onRowClick={(r) => router.push(`/admin/recruiters/${r.id}`)}
        empty={
          <EmptyState
            icon={Users}
            title="No recruiters found"
            description={
              query.search || query.status !== "all"
                ? "Try adjusting your search or filter."
                : "Add your first recruiter to get started."
            }
            action={
              !query.search && query.status === "all" ? (
                <Button size="sm" onClick={() => router.push("/admin/recruiters/new")}>
                  <Plus className="h-4 w-4" /> Add Recruiter
                </Button>
              ) : undefined
            }
          />
        }
        rowActions={(r) => (
          <ActionMenu
            items={[
              {
                label: "View",
                icon: Eye,
                onClick: () => router.push(`/admin/recruiters/${r.id}`),
              },
              {
                label: "Edit",
                icon: Pencil,
                onClick: () => router.push(`/admin/recruiters/${r.id}/edit`),
              },
              {
                label: r.active ? "Deactivate" : "Activate",
                icon: r.active ? UserX : UserCheck,
                onClick: () => setToToggle(r),
              },
              {
                label: "Delete",
                icon: Trash2,
                destructive: true,
                separatorBefore: true,
                onClick: () => setToDelete(r),
              },
            ]}
          />
        )}
      />

      {result && rows.length > 0 && (
        <div className="mt-4">
          <Pagination meta={result.pagination} onPageChange={(page) => setQuery({ page })} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toToggle)}
        onOpenChange={(o) => !o && setToToggle(null)}
        title={toToggle?.active ? "Deactivate recruiter?" : "Activate recruiter?"}
        description={
          toToggle?.active
            ? `${toToggle?.name} will be signed out and blocked from logging in.`
            : `${toToggle?.name} will be able to log in again.`
        }
        confirmLabel={toToggle?.active ? "Deactivate" : "Activate"}
        destructive={toToggle?.active}
        onConfirm={handleToggle}
      />

      <DeleteDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        resource="recruiter"
        recordName={toDelete?.name ?? ""}
        warning="Their logs are removed and their candidates are unassigned."
        requireTypedConfirmation
        onConfirm={handleDelete}
      />
    </div>
  );
}
