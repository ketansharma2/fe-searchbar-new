export default function Loading() {
  return (
    <div>
      <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted/40" />
      <div className="mb-6 h-16 animate-pulse rounded-lg bg-muted/20" />
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl border bg-muted/20" />
        <div className="h-48 animate-pulse rounded-xl border bg-muted/20" />
      </div>
    </div>
  );
}
