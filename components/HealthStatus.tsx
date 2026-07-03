"use client";

import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/lib/api/health";
import { ApiError } from "@/lib/api/client";

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function HealthStatus() {
  const { data, error, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div
        className="rounded-2xl border border-white/10 bg-karl-navy-glass/80 px-5 py-4"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm font-medium text-karl-gold">API status</p>
        <p className="mt-1 text-sm text-white/70">Checking backend health…</p>
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof ApiError
        ? `Backend unreachable (${error.status ?? "network error"})`
        : error instanceof Error
          ? error.message
          : "Backend unreachable";

    return (
      <div
        className="rounded-2xl border border-red-400/30 bg-karl-navy-glass/80 px-5 py-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-red-400"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-red-200">Backend offline</p>
        </div>
        <p className="mt-2 text-sm text-white/70">{message}</p>
        <p className="mt-2 text-xs text-white/50">
          Start the Where&apos;s Karl API locally on port 3000, or set{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">
            NEXT_PUBLIC_API_URL
          </code>
          .
        </p>
      </div>
    );
  }

  if (isSuccess && data) {
    return (
      <div
        className="rounded-2xl border border-karl-gold/30 bg-karl-navy-glass/80 px-5 py-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-emerald-200">Backend online</p>
        </div>
        <p className="mt-2 text-sm text-white/80">
          Service <span className="text-karl-gold">{data.service}</span> responded{" "}
          <span className="text-white/60">{formatTimestamp(data.timestamp)}</span>
        </p>
      </div>
    );
  }

  return null;
}
