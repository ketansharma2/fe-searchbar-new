import { api } from "./api";
import type { DateRangeParams, GlobalUsage, MyUsage } from "@/types";

export const usageApi = {
  /** The current user's own download usage today (+ optional ?from&to range breakdown). */
  async me(range?: DateRangeParams): Promise<MyUsage> {
    const { data } = await api.get<{ usage: MyUsage }>("/usage/me", { params: range });
    return data.usage;
  },

  /** Org-wide usage snapshot (admin only) (+ optional ?from&to range breakdown). */
  async summary(range?: DateRangeParams): Promise<GlobalUsage> {
    const { data } = await api.get<{ usage: GlobalUsage }>("/usage/summary", { params: range });
    return data.usage;
  },
};
