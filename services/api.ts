import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, setAccessToken } from "./token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Shared axios instance.
 * `withCredentials` ensures the HttpOnly refresh cookie is sent to the API.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// A bare client with NO interceptors — used for /auth/refresh to avoid
// recursive 401 handling.
const refreshClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach the in-memory access token ────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: transparent refresh + retry on 401 ──────────────

// Called when a refresh definitively fails, so the app can log the user out.
let onRefreshFailed: (() => void) | null = null;
export function setOnRefreshFailed(fn: (() => void) | null) {
  onRefreshFailed = fn;
}

// Single-flight: concurrent 401s share one refresh request.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ accessToken: string }>("/auth/refresh")
      .then((res) => {
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Don't try to refresh the refresh/login calls themselves.
    const url = original?.url ?? "";
    const isAuthRoute = url.includes("/auth/refresh") || url.includes("/auth/login");

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        setAccessToken(null);
        onRefreshFailed?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Normalize an axios error into a human-readable message. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  return fallback;
}
