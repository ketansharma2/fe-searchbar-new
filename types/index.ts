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
