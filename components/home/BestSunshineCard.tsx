"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MoonIcon, SunshineIcon } from "@/components/home/ConditionIcons";
import { FindClearSkiesCta } from "@/components/home/FindClearSkiesCta";
import {
  CardLabel,
  InsightCardChevron,
  InsightIconFrame,
  SunshineScoreBadge,
} from "@/components/home/InsightCardParts";
import { clearestSpotDesktopLabel } from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  isNighttime,
  sunshineResultTitle,
} from "@/lib/home/weatherDisplay";
import { buildMapHref } from "@/lib/map/routing";
import type { BestSunshineResponse } from "@/lib/schemas/weather";

type BestSunshineCardProps = {
  recommendation: BestSunshineResponse | null;
  isLoading: boolean;
  isUnavailable?: boolean;
  layout?: "both" | "mobile" | "desktop";
};

function MobileBestSunshineCard({
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
        <CardLabel className="text-white/45 lg:text-white/45">
          Brightest Spot
        </CardLabel>
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
        <CardLabel className="text-white/45 lg:text-white/45">
          Brightest Spot
        </CardLabel>
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
          <CardLabel className="text-white/45 lg:text-white/45">
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
        <SunshineScoreBadge score={recommendation.sunshineScore} />
      </div>
    </GlassCard>
  );
}

function DesktopBestSunshineCard({
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
      <GlassCard variant="desktop" className="px-5 py-4">
        <CardLabel>Clearest Spot</CardLabel>
        <p className="mt-3 text-lg font-semibold text-white/50">
          Finding brighter spots…
        </p>
      </GlassCard>
    );
  }

  if (isUnavailable || !recommendation) {
    return (
      <GlassCard variant="desktop" className="px-5 py-4">
        <CardLabel>Clearest Spot</CardLabel>
        <p className="mt-3 text-sm text-white/60">
          Clearest spot details are unavailable right now.
        </p>
      </GlassCard>
    );
  }

  const subtitle =
    recommendation.recommendationReason?.trim() ||
    recommendation.reason ||
    recommendation.status;
  const href = buildMapHref(recommendation.locationID);
  const spotIcon = isNightPresentation ? (
    <MoonIcon className="h-8 w-8 lg:h-9 lg:w-9" />
  ) : (
    <SunshineIcon className="h-8 w-8 lg:h-9 lg:w-9" />
  );

  return (
    <Link
      href={href}
      aria-label={`View clearest spot on map: ${recommendation.locationName}`}
      className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karl-gold"
    >
      <GlassCard
        variant="desktop"
        className="flex h-full items-center gap-4 px-5 py-4 transition-colors group-hover:border-white/16"
      >
        <InsightIconFrame tone="gold">
          {spotIcon}
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>{clearestSpotDesktopLabel(isNightPresentation)}</CardLabel>
          <h2 className="mt-1.5 text-xl font-semibold text-white">
            {recommendation.locationName}
          </h2>
          <p className="mt-1 text-sm font-medium text-karl-gold/92">{subtitle}</p>
          <p className="mt-1 text-sm text-white/62">
            {recommendation.distanceText} · {recommendation.temperature}°
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SunshineScoreBadge score={recommendation.sunshineScore} />
          <InsightCardChevron />
        </div>
      </GlassCard>
    </Link>
  );
}

export function BestSunshineCard({
  layout = "both",
  ...props
}: BestSunshineCardProps) {
  if (layout === "mobile") {
    return <MobileBestSunshineCard {...props} />;
  }

  if (layout === "desktop") {
    return <DesktopBestSunshineCard {...props} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileBestSunshineCard {...props} />
      </div>
      <div className="hidden lg:block">
        <DesktopBestSunshineCard {...props} />
      </div>
    </>
  );
}
