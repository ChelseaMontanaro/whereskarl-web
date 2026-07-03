"use client";

import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/lib/api/health";
import { ApiError } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/GlassCard";

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type HealthStatusProps = {
  compact?: boolean;
};

export function HealthStatus({ compact = false }: HealthStatusProps) {
  const { data, error, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: 1,
  });

  if (compact) {
    if (isLoading) {
      return (
        <p className="text-xs text-white/50" aria-live="polite" aria-busy="true">
          Backend health: checking…
        </p>
      );
    }

    if (isError) {
      const message =
        error instanceof ApiError
          ? `offline (${error.status ?? "network"})`
          : "offline";

      return (
        <p className="text-xs text-red-200/90" role="status" aria-live="polite">
          Backend health: {message}
        </p>
      );
    }

    if (isSuccess && data) {
      return (
        <p className="text-xs text-white/55" role="status" aria-live="polite">
          Backend health: online · {data.service} · {formatTimestamp(data.timestamp)}
        </p>
      );
    }

    return null;
  }

  if (isLoading) {
    return (
      <GlassCard className="px-5 py-4">
        <div aria-live="polite" aria-busy="true">
          <p className="text-sm font-medium text-karl-gold">API status</p>
          <p className="mt-1 text-sm text-white/70">Checking backend health…</p>
        </div>
      </GlassCard>
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
      <GlassCard className="border-red-400/30 px-5 py-4">
        <div role="status" aria-live="polite">
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
      </GlassCard>
    );
  }

  if (isSuccess && data) {
    return (
      <GlassCard className="border-karl-gold/30 px-5 py-4">
        <div role="status" aria-live="polite">
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
      </GlassCard>
    );
  }

  return null;
}
