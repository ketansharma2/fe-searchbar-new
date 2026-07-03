import { Skeleton } from "@/components/ui/skeleton";

/** Table loading skeleton — matches the DataTable layout. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={c === 0 ? "h-4 w-40" : c === cols - 1 ? "ml-auto h-4 w-16" : "h-4 w-24"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Detail page loading skeleton. */
export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
