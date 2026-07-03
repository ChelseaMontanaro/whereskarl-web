import type { ReactNode } from "react";

import Link from "next/link";

import { GlassCard } from "@/components/ui/GlassCard";
import {
  isNighttime,
  sunshineResultTitle,
} from "@/lib/home/weatherDisplay";
import type { BestSunshineResponse } from "@/lib/schemas/weather";

type BestSunshineCardProps = {
  recommendation: BestSunshineResponse | null;
  isLoading: boolean;
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
      {children}
    </p>
  );
}

export function BestSunshineCard({
  recommendation,
  isLoading,
}: BestSunshineCardProps) {
  const hour = new Date().getHours();
  const night = isNighttime(hour);

  if (isLoading || !recommendation) {
    return (
      <GlassCard className="px-4 py-4">
        <CardLabel>Best Sunshine</CardLabel>
        <p className="mt-3 text-lg font-semibold text-white/50">
          Finding brighter spots…
        </p>
      </GlassCard>
    );
  }

  const subtitle =
    recommendation.recommendationReason?.trim() ||
    recommendation.reason ||
    recommendation.status;

  return (
    <GlassCard className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardLabel>
            {sunshineResultTitle(recommendation.sunshineScore, night)}
          </CardLabel>
          <h2 className="mt-3 text-xl font-semibold text-white">
            {recommendation.locationName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-karl-gold">{subtitle}</p>
          <p className="mt-2 text-sm text-white/60">
            {recommendation.distanceText} · {recommendation.temperature}°
          </p>
          <Link
            href={`/map?location=${encodeURIComponent(recommendation.locationID)}`}
            className="mt-3 inline-flex text-sm font-semibold text-karl-gold underline decoration-karl-gold/30 underline-offset-4"
          >
            View on Map +
          </Link>
        </div>
        <div className="rounded-full border border-karl-gold/25 bg-karl-gold/10 px-3 py-2 text-center">
          <p className="text-2xl font-light text-karl-gold">
            {recommendation.sunshineScore}
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-white/45">
            Sunshine
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
