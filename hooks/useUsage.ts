"use client";

import { useQuery } from "@tanstack/react-query";
import { usageApi } from "@/services/usage.service";
import type { DateRangeParams } from "@/types";

export function useMyUsage(range?: DateRangeParams) {
  return useQuery({
    queryKey: ["usage", "me", range],
    queryFn: () => usageApi.me(range),
  });
}

export function useGlobalUsage(range?: DateRangeParams) {
  return useQuery({
    queryKey: ["usage", "summary", range],
    queryFn: () => usageApi.summary(range),
  });
}
