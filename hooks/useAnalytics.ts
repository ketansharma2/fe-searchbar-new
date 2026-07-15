"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/analytics.service";
import type { AnalyticsDimension, DateRangeParams } from "@/types";

export function useAnalyticsSummary(range?: DateRangeParams) {
  return useQuery({
    queryKey: ["analytics", "summary", range],
    queryFn: () => analyticsApi.summary(range),
  });
}

export function useAnalyticsBreakdown(
  dimension: AnalyticsDimension,
  location?: string,
  range?: DateRangeParams
) {
  return useQuery({
    queryKey: ["analytics", "breakdown", dimension, location, range],
    queryFn: () => analyticsApi.breakdown(dimension, location, range),
  });
}
