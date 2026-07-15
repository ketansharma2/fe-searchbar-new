"use client";

import { ArrowUpDown, ChevronDown, ChevronUp, Columns3 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableSkeleton } from "./LoadingSkeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right";
  /** Enables the click-to-sort header button. Sort state/handling is controlled by the parent. */
  sortable?: boolean;
  /** Set false to keep an essential column out of the "Columns" visibility menu. Default true. */
  hideable?: boolean;
}

export interface SortState {
  key: string;
  dir: "asc" | "desc";
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
  /** Current sort — parent decides whether sorting is applied client-side or via a server request. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Column key -> visible. Omitted keys default to visible. Passing this enables the "Columns" menu. */
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
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
  sort,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
}: DataTableProps<T>) {
  const visibleColumns = columnVisibility
    ? columns.filter((c) => columnVisibility[c.key] !== false)
    : columns;
  const colCount = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

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
  function toggleSort(key: string) {
    if (!onSortChange) return;
    onSortChange(sort?.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }
  function toggleColumnVisibility(key: string) {
    if (!onColumnVisibilityChange) return;
    const current = columnVisibility?.[key] !== false;
    onColumnVisibilityChange({ ...columnVisibility, [key]: !current });
  }

  return (
    <div className="rounded-xl border bg-card">
      {onColumnVisibilityChange && (
        <div className="flex items-center justify-end border-b p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Columns3 className="h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={columnVisibility?.[c.key] !== false}
                    onCheckedChange={() => toggleColumnVisibility(c.key)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {c.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
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
                {visibleColumns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn(c.align === "right" && "text-right", c.headerClassName)}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {c.header}
                        {sort?.key === c.key ? (
                          sort.dir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
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
                    {visibleColumns.map((c) => (
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
