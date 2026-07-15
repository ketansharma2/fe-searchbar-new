"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { activityLogApi } from "@/services/activityLog.service";
import type { ActivityLogListParams } from "@/types";

export function useActivityLogs(params: ActivityLogListParams) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => activityLogApi.list(params),
    placeholderData: keepPreviousData,
  });
}
