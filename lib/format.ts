/** `12 Jan 2026` */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** `12 Jan 2026, 4:30 PM` */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * `2 hours ago`, `Yesterday`, `3 days ago` — falls back to formatDate beyond a week.
 */
export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

/**
 * Indian Rupee formatting (lakh/crore grouping), e.g. `₹12,00,000`.
 * NOTE: assumes stored CTC values are absolute rupees — confirm against the
 * actual data convention (some recruitment tools store CTC in LPA) before
 * relying on this for candidate CTC fields.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** `+12% vs previous period`, `-8% vs previous period` — `undefined` when there's no baseline to compare against. */
export function formatDeltaPct(deltaPct: number | null | undefined): string | undefined {
  if (deltaPct === null || deltaPct === undefined) return undefined;
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${deltaPct}% vs previous period`;
}
