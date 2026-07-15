"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QueryValue = string | number | boolean | string[];
type QueryDefaults = Record<string, QueryValue>;

/**
 * Syncs list-page state (search/filters/sort/page) to the URL query string,
 * so a hard refresh or the browser back/forward button restores it exactly.
 * Only non-default values are written to the URL, keeping it clean.
 *
 * `defaults` shape drives parsing: string[] values parse as comma-separated,
 * number values parse as numbers, boolean values parse as "true"/"false".
 *
 * Calls `useSearchParams()`, so any page/segment using this hook must have a
 * `loading.tsx` sibling (Next.js requires a Suspense boundary around a
 * static page that reads search params on the client).
 */
export function useListQueryState<T extends QueryDefaults>(
  defaults: T
): [T, (patch: Partial<T>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const raw = searchParams.get(String(key));
    if (raw === null) continue;
    const fallback = defaults[key];
    if (Array.isArray(fallback)) {
      state[key] = (raw ? raw.split(",") : []) as T[typeof key];
    } else if (typeof fallback === "number") {
      const parsed = Number(raw);
      state[key] = (Number.isNaN(parsed) ? fallback : parsed) as T[typeof key];
    } else if (typeof fallback === "boolean") {
      state[key] = (raw === "true") as T[typeof key];
    } else {
      state[key] = raw as T[typeof key];
    }
  }

  function setState(patch: Partial<T>) {
    const next = { ...state, ...patch };
    const params = new URLSearchParams();
    for (const key of Object.keys(defaults)) {
      const value = next[key as keyof T];
      const fallback = defaults[key as keyof T];
      const isDefault = Array.isArray(fallback)
        ? Array.isArray(value) && value.length === 0
        : value === fallback;
      if (isDefault || value === undefined || value === "") continue;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return [state, setState];
}
