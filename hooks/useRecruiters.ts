"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recruiterApi, type ListRecruitersParams } from "@/services/recruiter.service";
import type { CreateRecruiterPayload, DateRangeParams, UpdateRecruiterPayload } from "@/types";

const RECRUITERS_KEY = "recruiters";

export function useRecruiters(params: ListRecruitersParams) {
  return useQuery({
    queryKey: [RECRUITERS_KEY, params],
    queryFn: () => recruiterApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useRecruiter(id: string | undefined) {
  return useQuery({
    queryKey: [RECRUITERS_KEY, id],
    queryFn: () => recruiterApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateRecruiter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecruiterPayload) => recruiterApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [RECRUITERS_KEY] }),
  });
}

export function useUpdateRecruiter(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRecruiterPayload) => recruiterApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [RECRUITERS_KEY] }),
  });
}

export function useSetRecruiterStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      recruiterApi.setStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [RECRUITERS_KEY] }),
  });
}

export function useDeleteRecruiter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruiterApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [RECRUITERS_KEY] }),
  });
}

/** "Recruiters added in range" dashboard KPI — only meaningful (and only fetched) once both dates are set. */
export function useRecruiterRangeSummary(range: DateRangeParams) {
  const enabled = Boolean(range.from && range.to);
  return useQuery({
    queryKey: [RECRUITERS_KEY, "summary", range],
    queryFn: () => recruiterApi.summary({ from: range.from as string, to: range.to as string }),
    enabled,
  });
}
