import { TableSkeleton } from "@/components/common/LoadingSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted/40" />
      <div className="rounded-xl border bg-card">
        <TableSkeleton cols={5} />
      </div>
    </div>
  );
}
