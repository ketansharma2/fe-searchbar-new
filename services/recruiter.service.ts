import { api } from "./api";
import type {
  CreateRecruiterPayload,
  Paginated,
  Recruiter,
  RecruiterStatusFilter,
  UpdateRecruiterPayload,
} from "@/types";

export interface ListRecruitersParams {
  search?: string;
  status?: RecruiterStatusFilter;
  page?: number;
  limit?: number;
}

export const recruiterApi = {
  async list(params: ListRecruitersParams): Promise<Paginated<Recruiter>> {
    const { data } = await api.get<Paginated<Recruiter>>("/recruiters", { params });
    return data;
  },

  async getById(id: string): Promise<Recruiter> {
    const { data } = await api.get<{ recruiter: Recruiter }>(`/recruiters/${id}`);
    return data.recruiter;
  },

  async create(payload: CreateRecruiterPayload): Promise<Recruiter> {
    const { data } = await api.post<{ recruiter: Recruiter }>("/recruiters", payload);
    return data.recruiter;
  },

  async update(id: string, payload: UpdateRecruiterPayload): Promise<Recruiter> {
    const { data } = await api.patch<{ recruiter: Recruiter }>(`/recruiters/${id}`, payload);
    return data.recruiter;
  },

  async setStatus(id: string, active: boolean): Promise<Recruiter> {
    const { data } = await api.patch<{ recruiter: Recruiter }>(`/recruiters/${id}/status`, {
      active,
    });
    return data.recruiter;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/recruiters/${id}`);
  },
};
