import { TableSkeleton } from "@/components/common/LoadingSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-4 h-16 animate-pulse rounded-lg bg-muted/40" />
      <div className="mb-4 h-32 animate-pulse rounded-xl border bg-muted/20" />
      <div className="rounded-xl border bg-card">
        <TableSkeleton cols={6} />
      </div>
    </div>
  );
}
