import { Badge } from "@/components/ui/badge";

type Tone = "success" | "muted" | "destructive" | "default";

/** Maps a status string to a consistent badge tone across the app. */
export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  label,
  tone,
}: {
  /** Convenience for boolean active/inactive statuses. */
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  /** Or a free-form label + tone. */
  label?: string;
  tone?: Tone;
}) {
  if (label) {
    return <Badge variant={tone ?? "default"}>{label}</Badge>;
  }
  return (
    <Badge variant={active ? "success" : "muted"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
