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

export interface MyUsage {
  unlimited: boolean;
  usedToday: number;
  dailyDownloadLimit?: number;
  remaining?: number;
}

export interface GlobalUsage {
  totalDownloadsToday: number;
  activeRecruiters: number;
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
  accessToken: string;
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
