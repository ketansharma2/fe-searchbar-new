import { cn } from "@/lib/utils";

/** Animated placeholder block used in loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
