import axios from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Map a backend validation error ({ errors: { field: [msg] } }) onto
 * react-hook-form fields. Returns true if any field error was applied.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  if (!axios.isAxiosError(error)) return false;
  const errors = (error.response?.data as { errors?: Record<string, string[]> })?.errors;
  if (!errors || typeof errors !== "object") return false;

  let applied = false;
  for (const [field, messages] of Object.entries(errors)) {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    if (message) {
      setError(field as Path<T>, { type: "server", message });
      applied = true;
    }
  }
  return applied;
}
