import axios, { type AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Shared axios instance.
 *
 * All authentication is handled by the backend via HttpOnly cookies — the
 * browser attaches the access/refresh tokens automatically on every request
 * via `withCredentials`. The frontend never reads, stores, or refreshes
 * tokens itself; the backend rotates them transparently as needed.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** Normalize an axios error into a human-readable message. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  return fallback;
}
