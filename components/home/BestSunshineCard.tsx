"use client";

import { useEffect, useState, type ReactNode } from "react";

import { FindClearSkiesCta } from "@/components/home/FindClearSkiesCta";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  isNighttime,
  sunshineResultTitle,
} from "@/lib/home/weatherDisplay";
import type { BestSunshineResponse } from "@/lib/schemas/weather";

type BestSunshineCardProps = {
  recommendation: BestSunshineResponse | null;
  isLoading: boolean;
  isUnavailable?: boolean;
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
  isUnavailable = false,
}: BestSunshineCardProps) {
  const [isNightPresentation, setIsNightPresentation] = useState(false);

  useEffect(() => {
    setIsNightPresentation(isNighttime(new Date().getHours()));
  }, []);

  if (isLoading) {
    return (
      <GlassCard className="border-karl-gold/15 px-4 py-4">
        <CardLabel>Brightest Spot</CardLabel>
        <p className="mt-3 text-lg font-semibold text-white/50">
          Finding brighter spots…
        </p>
        <FindClearSkiesCta
          locationId={null}
          isLoading
          variant="secondary"
          className="mt-4"
        />
      </GlassCard>
    );
  }

  if (isUnavailable || !recommendation) {
    return (
      <GlassCard className="border-karl-gold/15 px-4 py-4">
        <CardLabel>Brightest Spot</CardLabel>
        <p className="mt-3 text-sm text-white/60">
          Brightest spot details are unavailable right now.
        </p>
        <FindClearSkiesCta
          locationId={null}
          isLoading={false}
          variant="secondary"
          className="mt-4"
        />
      </GlassCard>
    );
  }

  const subtitle =
    recommendation.recommendationReason?.trim() ||
    recommendation.reason ||
    recommendation.status;

  return (
    <GlassCard className="border-karl-gold/20 bg-karl-navy-glass/85 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardLabel>
            {sunshineResultTitle(
              recommendation.sunshineScore,
              isNightPresentation,
            )}
          </CardLabel>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {recommendation.locationName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-karl-gold">{subtitle}</p>
          <p className="mt-1.5 text-sm text-white/60">
            {recommendation.distanceText} · {recommendation.temperature}°
          </p>
          <FindClearSkiesCta
            locationId={recommendation.locationID}
            isLoading={false}
            variant="secondary"
            className="mt-4"
          />
        </div>
        <div className="shrink-0 rounded-full border border-karl-gold/30 bg-karl-gold/10 px-3 py-2 text-center">
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
