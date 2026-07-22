import Image from "next/image";
import { cn } from "@/lib/utils";

/** Maven Jobs icon + logo image. */
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Existing Home Icon - Don't Remove */}
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

      {/* Logo Image - Replaces MavenJobs Text */}
      <Image
        src="/images/logo.png"
        alt="Maven Jobs"
        width={150}
        height={40}
        priority
        className="h-9 w-auto object-contain"
      />
    </div>
  );
}