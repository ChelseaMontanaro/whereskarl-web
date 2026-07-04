import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";

type NextHourOutlookCardProps = {
  summary: string | null;
  confidenceLabel: string | null;
  isLoading: boolean;
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
      {children}
    </p>
  );
}

export function NextHourOutlookCard({
  summary,
  confidenceLabel,
  isLoading,
}: NextHourOutlookCardProps) {
  if (isLoading) {
    return (
      <GlassCard variant="desktop" className="px-4 py-4">
        <CardLabel>Next Hour</CardLabel>
        <p className="mt-3 text-sm text-white/55">Checking the next-hour outlook…</p>
      </GlassCard>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <GlassCard className="px-4 py-4">
      <CardLabel>Next Hour</CardLabel>
      <p className="mt-3 text-sm leading-relaxed text-white/75">{summary}</p>
      {confidenceLabel ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
          {confidenceLabel} confidence
        </p>
      ) : null}
    </GlassCard>
  );
}
