"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            console.error("[Where's Karl API]", query.queryKey, error);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: WEATHER_STALE_TIME_MS,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            retry: (failureCount, error) => {
              if (
                error instanceof Error &&
                error.message.includes("NEXT_PUBLIC_API_URL is not configured")
              ) {
                return false;
              }

              return failureCount < 1;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
