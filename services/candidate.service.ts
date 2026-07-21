import { api } from "./api";
import type {
  BulkUploadSummary,
  Candidate,
  CandidateCard,
  CandidateSearchParams,
  Paginated,
  ResumeUsage,
} from "@/types";

export const candidateApi = {
  /** Resume preview — returns the URL without consuming quota. */
  async previewResume(id: string): Promise<{ url: string }> {
    const { data } = await api.get<{ url: string }>(`/candidates/${id}/resume/preview`);
    return data;
  },

  /** Resume download — metered; returns URL + updated usage (or 403 at limit). */
  async downloadResume(id: string): Promise<{ url: string; usage: ResumeUsage }> {
    const { data } = await api.get<{ url: string; usage: ResumeUsage }>(
      `/candidates/${id}/resume/download`
    );
    return data;
  },

  
  /** Hybrid search + filters (recruiter + admin). */
  async search(params: CandidateSearchParams): Promise<Paginated<CandidateCard>> {
    const { data } = await api.get<Paginated<CandidateCard>>("/candidates", { params });
    return data;
  },

  /** Add a remark/feedback to a candidate. */
  async addRemark(id: string, text: string): Promise<Candidate> {
    const { data } = await api.post<{ candidate: Candidate }>(`/candidates/${id}/remarks`, {
      text,
    });
    return data.candidate;
  },

  /** Manual add — multipart with the required PDF under `resume`. */
  async createManual(formData: FormData): Promise<Candidate> {
    const { data } = await api.post<{ candidate: Candidate }>("/candidates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.candidate;
  },

  /** Get unique locations for suggestions */
async getUniqueLocations(): Promise<string[]> {
  const { data } = await api.get<{ locations: string[] }>("/candidates/locations");
  return data.locations;
},

/** Get unique skills for suggestions */
async getUniqueSkills(): Promise<string[]> {
  const { data } = await api.get<{ skills: string[] }>("/candidates/skills");
  return data.skills;
},

  /** Bulk upload — multipart .xlsx/.csv under `file`. */
  async bulkUpload(file: File): Promise<BulkUploadSummary> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ summary: BulkUploadSummary }>(
      "/candidates/bulk",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.summary;
  },

  async getById(id: string): Promise<Candidate> {
    const { data } = await api.get<{ candidate: Candidate }>(`/candidates/${id}`);
    return data.candidate;
  },
};
