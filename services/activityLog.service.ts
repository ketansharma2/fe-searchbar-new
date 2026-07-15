import { api } from "./api";
import type { ActivityLog, ActivityLogListParams, Paginated } from "@/types";

export const activityLogApi = {
  async list(params: ActivityLogListParams): Promise<Paginated<ActivityLog>> {
    const { data } = await api.get<Paginated<ActivityLog>>("/activity-logs", { params });
    return data;
  },
};
