"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateApi } from "@/services/candidate.service";
import type { CandidateSearchParams } from "@/types";

const CANDIDATES_KEY = "candidates";

export function useCandidateSearch(params: CandidateSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, params],
    queryFn: () => candidateApi.search(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function useCandidate(id: string | undefined) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, id],
    queryFn: () => candidateApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useAddCandidateRemark(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => candidateApi.addRemark(id, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY, id] }),
  });
}
