import { cn } from "@/lib/utils";

/** Maven Jobs wordmark + glyph. */
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const text = variant === "light" ? "text-white" : "text-foreground";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M4 20V7l8-4 8 4v13"
            stroke="currentColor"
            className={variant === "light" ? "text-white" : "text-primary"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 20v-6h6v6"
            stroke="currentColor"
            className={variant === "light" ? "text-white" : "text-primary"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={cn("text-lg font-bold tracking-tight", text)}>
        Maven<span className="font-light opacity-80">Jobs</span>
      </span>
    </div>
  );
}
