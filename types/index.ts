export type Role = "ADMIN" | "RECRUITER";

export interface User {
  id: string;
  email: string;
  role: Role;
}

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
