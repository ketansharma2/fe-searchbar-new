import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin", className)} />;
}

/** Full-screen centered loading state used while auth is resolving. */
export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
