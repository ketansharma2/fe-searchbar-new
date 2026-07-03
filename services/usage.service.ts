import { api } from "./api";
import type { GlobalUsage, MyUsage } from "@/types";

export const usageApi = {
  /** The current user's own download usage today. */
  async me(): Promise<MyUsage> {
    const { data } = await api.get<{ usage: MyUsage }>("/usage/me");
    return data.usage;
  },

  /** Org-wide usage snapshot (admin only). */
  async summary(): Promise<GlobalUsage> {
    const { data } = await api.get<{ usage: GlobalUsage }>("/usage/summary");
    return data.usage;
  },
};
