export type Role = "ADMIN" | "RECRUITER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  role: Role;
  real_password:string;
  active: boolean;
  dailyDownloadLimit: number;
  usedToday: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface Education {
  degree?: string;
  institute?: string;
  passingYear?: string;
  score?: string;
}

export interface Remark {
  _id?: string;
  text: string;
  authorName?: string;
  authorEmail?: string;
  createdAt: string;
}

export interface CandidateCard {
  id: string;
  unique_id: string;
  name: string;
  designation?: string;
  experience?: string;
  relevantExp?: number;
  recentCompany?: string;
  location?: string;
  topSkills: string[];
  hasResume: boolean;
}

export interface CandidateSearchParams {
  q?: string;
  location?: string;
  designation?: string;
  minExp?: number;
  maxExp?: number;
  skills?: string[];
  keywords?: string[];
  page?: number;
  limit?: number;
}

export interface Candidate {
  id: string;
  unique_id: string;
  name: string;
  email?: string;
  mobile?: string;
  gender?: string;
  location?: string;
  qualification?: string;
  resumeUrl?: string;
  pdfFile?: string;
  resumeKeywords: string[];
  portal?: string;
  portalDate?: string;
  experience?: string;
  relevantExp?: number;
  designation?: string;
  recentCompany?: string;
  education: Education[];
  applyDate?: string;
  callingDate?: string;
  currCTC?: number;
  expCTC?: number;
  topSkills: string[];
  skillsAll: string[];
  companyNamesAll: string[];
  feedback?: string;
  jdBrief?: string;
  remarks: Remark[];
  createdAt: string;
}

export interface ResumeUsage {
  unlimited: boolean;
  usedToday?: number;
  dailyDownloadLimit?: number;
  remaining?: number;
}

/** A count within a [from, to] window, vs. the equal-length prior window — powers every KPI trend delta. */
export interface RangeSummary {
  from: string;
  to: string;
  count: number;
  previousCount: number;
  deltaPct: number | null;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface MyUsage {
  unlimited: boolean;
  usedToday: number;
  dailyDownloadLimit?: number;
  remaining?: number;
  /** Present only when a [from, to] range was requested. */
  range?: RangeSummary;
}

export interface GlobalUsage {
  totalDownloadsToday: number;
  activeRecruiters: number;
  /** Present only when a [from, to] range was requested. */
  range?: RangeSummary;
}

export interface BulkRowError {
  row: number;
  email?: string;
  reason: string;
}

export interface BulkUploadSummary {
  fileName: string;
  total: number;
  success: number;
  failed: number;
  errors: BulkRowError[];
}

export type RecruiterStatusFilter = "all" | "active" | "inactive";

export interface CreateRecruiterPayload {
  name: string;
  email: string;
  password: string;
  dailyDownloadLimit: number;
  active: boolean;
}

export type UpdateRecruiterPayload = Partial<{
  name: string;
  email: string;
  password: string;
  dailyDownloadLimit: number;
  active: boolean;
}>;

export interface LoginPayload {
  email: string;
  password: string;
  role?: Role;
}

/** Shape returned by /auth/login and /auth/refresh */
export interface AuthResponse {
  success: boolean;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ActivityType =
  | "login"
  | "logout"
  | "search_candidates"
  | "view_candidate"
  | "resume_view"
  | "resume_download"
  | "update_remark"
  | "add_candidate"
  | "bulk_upload"
  | "create_recruiter"
  | "update_recruiter"
  | "delete_recruiter"
  | "activate_recruiter"
  | "deactivate_recruiter";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  details: Record<string, unknown>;
  ip?: string;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role };
}

export type ActorTypeFilter = "all" | "admin" | "recruiter";

export interface ActivityLogListParams {
  userId?: string;
  actorType?: ActorTypeFilter;
  type?: ActivityType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsSummary {
  totalCandidates: number;
  addedToday: number;
  addedYesterday: number;
  addedThisWeek: number;
  /** Present only when a [from, to] range was requested. */
  range?: RangeSummary;
}

export type AnalyticsDimension =
  | "location"
  | "skills"
  | "designation"
  | "company"
  | "portal"
  | "experience";

export interface AnalyticsBreakdownRow {
  label: string;
  count: number;
}
