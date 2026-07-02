"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RecruiterFormDialog } from "@/components/recruiters/RecruiterFormDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { recruiterApi } from "@/services/recruiter.service";
import { getErrorMessage } from "@/services/api";
import type { Paginated, Recruiter, RecruiterStatusFilter } from "@/types";

const LIMIT = 10;

export default function RecruiterManagementPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState<RecruiterStatusFilter>("all");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<Recruiter> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recruiter | null>(null);
  const [toDelete, setToDelete] = useState<Recruiter | null>(null);
  const [toToggle, setToToggle] = useState<Recruiter | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruiterApi.list({
        search: debouncedSearch || undefined,
        status,
        page,
        limit: LIMIT,
      });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load recruiters"));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(recruiter: Recruiter) {
    setEditing(recruiter);
    setFormOpen(true);
  }

  async function handleToggleStatus() {
    if (!toToggle) return;
    try {
      await recruiterApi.setStatus(toToggle.id, !toToggle.active);
      toast.success(toToggle.active ? "Recruiter deactivated" : "Recruiter activated");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await recruiterApi.remove(toDelete.id);
      toast.success("Recruiter deleted");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete recruiter"));
    }
  }

  const rows = result?.data ?? [];
  const isEmpty = !loading && !error && rows.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Recruiter Management"
          description="Create, manage, and set download limits for recruiter accounts."
        />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Recruiter
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as RecruiterStatusFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Spinner className="h-5 w-5 text-primary" /> Loading recruiters…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData}>
                Retry
              </Button>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No recruiters found</p>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch || status !== "all"
                    ? "Try adjusting your search or filter."
                    : "Add your first recruiter to get started."}
                </p>
              </div>
              {!debouncedSearch && status === "all" && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Add Recruiter
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage Today</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>
                      <Badge variant={r.active ? "success" : "muted"}>
                        {r.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="tabular-nums">
                        {r.usedToday} / {r.dailyDownloadLimit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => openEdit(r)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={r.active ? "Deactivate" : "Activate"}
                          onClick={() => setToToggle(r)}
                        >
                          {r.active ? (
                            <UserX className="h-4 w-4 text-amber-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => setToDelete(r)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {result && rows.length > 0 && (
        <div className="mt-4">
          <Pagination meta={result.pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Create / Edit */}
      <RecruiterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        recruiter={editing}
        onSaved={fetchData}
      />

      {/* Activate / Deactivate confirm */}
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
        onConfirm={handleToggleStatus}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete recruiter?"
        description={`This permanently deletes ${toDelete?.name} and all of their logs. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
