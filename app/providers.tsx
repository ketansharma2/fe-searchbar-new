"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Some existing forms (e.g. RecruiterForm) save via a direct axios call
            // rather than a useMutation, so nothing invalidates the cache on their
            // success — always refetch on mount (stale-while-revalidate) so a page
            // navigated to right after such a save never shows pre-save data.
            staleTime: 0,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
