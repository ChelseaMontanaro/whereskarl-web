import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";

type IntelligenceNarrativeCardProps = {
  intelligence: KarlIntelligenceResponse | null;
  isLoading: boolean;
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
      {children}
    </p>
  );
}

export function IntelligenceNarrativeCard({
  intelligence,
  isLoading,
}: IntelligenceNarrativeCardProps) {
  if (isLoading) {
    return (
      <GlassCard className="px-4 py-4">
        <CardLabel>Karl&apos;s Read</CardLabel>
        <p className="mt-3 text-lg font-semibold text-white/50">
          Reading Karl intelligence…
        </p>
      </GlassCard>
    );
  }

  if (!intelligence) {
    return null;
  }

  const confidenceLabel =
    intelligence.narrative.confidenceLabel.toLowerCase() === "unavailable"
      ? null
      : intelligence.narrative.confidenceLabel;

  return (
    <GlassCard className="px-4 py-4">
      <CardLabel>Karl&apos;s Read</CardLabel>
      <h2 className="mt-3 text-lg font-semibold leading-snug text-white">
        {intelligence.narrative.headline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        {intelligence.narrative.summary}
      </p>
      {confidenceLabel ? (
        <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/40">
          {confidenceLabel} confidence
        </p>
      ) : null}
    </GlassCard>
  );
}
