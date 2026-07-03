"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "./LoadingSkeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Rendered when there is no data and not loading/error. */
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Lightweight per-row actions (e.g. a menu). */
  rowActions?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading,
  error,
  onRetry,
  empty,
  onRowClick,
  selectable,
  selectedIds = [],
  onSelectionChange,
  rowActions,
  stickyHeader = true,
}: DataTableProps<T>) {
  const colCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  const allSelected = data.length > 0 && data.every((r) => selectedIds.includes(getRowId(r)));
  const someSelected = data.some((r) => selectedIds.includes(getRowId(r)));

  function toggleAll() {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : data.map(getRowId));
  }
  function toggleOne(id: string) {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      {error ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-destructive">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      ) : loading ? (
        <TableSkeleton cols={colCount} />
      ) : data.length === 0 ? (
        empty
      ) : (
        <div className="max-h-[calc(100vh-20rem)] overflow-auto">
          <Table>
            <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-card")}>
              <TableRow>
                {selectable && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn(c.align === "right" && "text-right", c.headerClassName)}
                  >
                    {c.header}
                  </TableHead>
                ))}
                {rowActions && <TableHead className="w-12 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const id = getRowId(row);
                const selected = selectedIds.includes(id);
                return (
                  <TableRow
                    key={id}
                    data-state={selected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleOne(id)}
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn(c.align === "right" && "text-right", c.className)}
                      >
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
