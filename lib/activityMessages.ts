import type { ActivityLog, ActivityType } from "@/types";

const TYPE_LABELS: Record<ActivityType, string> = {
  login: "Login",
  logout: "Logout",
  search_candidates: "Search",
  view_candidate: "View Candidate",
  resume_view: "Resume Preview",
  resume_download: "Resume Download",
  update_remark: "Remark",
  add_candidate: "Add Candidate",
  bulk_upload: "Bulk Upload",
  create_recruiter: "Create Recruiter",
  update_recruiter: "Update Recruiter",
  delete_recruiter: "Delete Recruiter",
  activate_recruiter: "Activate Recruiter",
  deactivate_recruiter: "Deactivate Recruiter",
};

const DESTRUCTIVE_TYPES: ActivityType[] = ["delete_recruiter", "deactivate_recruiter"];
const POSITIVE_TYPES: ActivityType[] = [
  "create_recruiter",
  "activate_recruiter",
  "add_candidate",
  "bulk_upload",
];

export const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = (
  Object.keys(TYPE_LABELS) as ActivityType[]
).map((value) => ({ value, label: TYPE_LABELS[value] }));

export function activityTypeLabel(type: ActivityType): string {
  return TYPE_LABELS[type] ?? type;
}

export function activityTypeTone(type: ActivityType): "success" | "muted" | "destructive" | "default" {
  if (DESTRUCTIVE_TYPES.includes(type)) return "destructive";
  if (POSITIVE_TYPES.includes(type)) return "success";
  return "muted";
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}
function num(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}
function strArray(v: unknown): string[] | undefined {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
}

/**
 * Rebuilds a `/recruiter/candidates?...` URL from a `search_candidates` log's
 * `details`, so "Recent Searches" on the recruiter dashboard can replay a
 * past search — the candidate list page reads these exact query params via
 * useListQueryState, so this both re-runs the search and prefills the form.
 */
export function buildSearchReplayHref(details: Record<string, unknown>): string {
  const params = new URLSearchParams();
  const q = str(details.q);
  const location = str(details.location);
  const designation = str(details.designation);
  const minExp = num(details.minExp);
  const maxExp = num(details.maxExp);
  const skills = strArray(details.skills);
  const keywords = strArray(details.keywords);

  if (q) params.set("q", q);
  if (location) params.set("location", location);
  if (designation) params.set("designation", designation);
  if (minExp !== undefined) params.set("minExp", String(minExp));
  if (maxExp !== undefined) params.set("maxExp", String(maxExp));
  if (skills?.length) params.set("skills", skills.join(","));
  if (keywords?.length) params.set("keywords", keywords.join(","));

  const qs = params.toString();
  return qs ? `/recruiter/candidates?${qs}` : "/recruiter/candidates";
}

/** Humanizes an activity log's `details` into a single readable line. */
export function activityMessage(log: ActivityLog): string {
  const d = log.details ?? {};
  switch (log.type) {
    case "login":
      return "Logged in";
    case "logout":
      return "Logged out";
    case "search_candidates": {
      const q = str(d.q);
      const count = num(d.resultCount);
      const parts = [q ? `"${q}"` : null, str(d.location), str(d.designation)].filter(Boolean);
      const criteria = parts.length ? parts.join(" · ") : "candidates";
      return count !== undefined ? `Searched ${criteria} — ${count} result(s)` : `Searched ${criteria}`;
    }
    case "view_candidate":
      return `Viewed candidate ${str(d.candidateName) ?? "—"}`;
    case "resume_view":
      return `Previewed resume for ${str(d.candidateName) ?? "—"}`;
    case "resume_download":
      return `Downloaded resume for ${str(d.candidateName) ?? "—"}`;
    case "update_remark":
      return `Added a remark on ${str(d.candidateName) ?? "—"}`;
    case "add_candidate": {
      const source = str(d.source);
      return `Added candidate ${str(d.candidateName) ?? "—"}${source ? ` (${source})` : ""}`;
    }
    case "bulk_upload":
      return `Bulk uploaded ${str(d.fileName) ?? "a file"} — ${num(d.success) ?? 0}/${num(d.total) ?? 0} succeeded`;
    case "create_recruiter":
      return `Created recruiter ${str(d.recruiterName) ?? "—"}`;
    case "update_recruiter":
      return `Updated recruiter ${str(d.recruiterName) ?? "—"}`;
    case "delete_recruiter":
      return `Deleted recruiter ${str(d.recruiterName) ?? "—"}`;
    case "activate_recruiter":
      return `Activated recruiter ${str(d.recruiterName) ?? "—"}`;
    case "deactivate_recruiter":
      return `Deactivated recruiter ${str(d.recruiterName) ?? "—"}`;
    default:
      return activityTypeLabel(log.type);
  }
}
