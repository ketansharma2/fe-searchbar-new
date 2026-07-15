export default function Loading() {
  return (
    <div>
      <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted/40" />
      <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted/20" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/20" />
        ))}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-xl border bg-muted/20" />
    </div>
  );
}
