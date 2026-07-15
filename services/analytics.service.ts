import { api } from "./api";
import type { AnalyticsBreakdownRow, AnalyticsDimension, AnalyticsSummary, DateRangeParams } from "@/types";

export const analyticsApi = {
  async summary(range?: DateRangeParams): Promise<AnalyticsSummary> {
    const { data } = await api.get<{ success: boolean; summary: AnalyticsSummary }>(
      "/analytics/summary",
      { params: range }
    );
    return data.summary;
  },

  async breakdown(
    dimension: AnalyticsDimension,
    location?: string,
    range?: DateRangeParams
  ): Promise<AnalyticsBreakdownRow[]> {
    const { data } = await api.get<{
      success: boolean;
      dimension: AnalyticsDimension;
      breakdown: AnalyticsBreakdownRow[];
    }>("/analytics/breakdown", { params: { dimension, location, ...range } });
    return data.breakdown;
  },
};
