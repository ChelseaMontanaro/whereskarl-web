"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MoonIcon, SunshineIcon } from "@/components/home/ConditionIcons";
import { FindClearSkiesCta } from "@/components/home/FindClearSkiesCta";
import {
  CardLabel,
  InsightCardChevron,
  InsightIconFrame,
} from "@/components/home/InsightCardParts";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopInsightIconSizeClass,
  mobileInsightCardSurfaceClass,
} from "@/components/home/desktopGlass";
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
      <GlassCard variant="insight" className={`flex items-start gap-3 px-4 py-4 ${mobileInsightCardSurfaceClass} border-karl-gold/15`}>
        <InsightIconFrame tone={isNightPresentation ? "mist" : "gold"}>
          {isNightPresentation ? (
            <MoonIcon className={`${desktopInsightIconSizeClass} text-[#8CB8D8]`} />
          ) : (
            <SunshineIcon className={desktopInsightIconSizeClass} />
          )}
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel className="text-white/45 lg:text-white/45">
            Brightest Spot
          </CardLabel>
          <p className="mt-2 max-sm:mt-3 text-lg max-sm:text-[1.3125rem] font-semibold text-white/50">
            Finding brighter spots…
          </p>
          <FindClearSkiesCta
            locationId={null}
            isLoading
            variant="secondary"
            className="mt-4 max-sm:mt-5"
          />
        </div>
      </GlassCard>
    );
  }

  if (isUnavailable || !recommendation) {
    return (
      <GlassCard variant="insight" className={`flex items-start gap-3 px-4 py-4 ${mobileInsightCardSurfaceClass} border-karl-gold/15`}>
        <InsightIconFrame tone={isNightPresentation ? "mist" : "gold"}>
          {isNightPresentation ? (
            <MoonIcon className={`${desktopInsightIconSizeClass} text-[#8CB8D8]`} />
          ) : (
            <SunshineIcon className={desktopInsightIconSizeClass} />
          )}
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel className="text-white/45 lg:text-white/45">
            Brightest Spot
          </CardLabel>
          <p className="mt-2 max-sm:mt-3 text-sm max-sm:text-[0.9375rem] text-white/60">
            Brightest spot details are unavailable right now.
          </p>
          <FindClearSkiesCta
            locationId={null}
            isLoading={false}
            variant="secondary"
            className="mt-4 max-sm:mt-5"
          />
        </div>
      </GlassCard>
    );
  }

  const subtitle =
    recommendation.recommendationReason?.trim() ||
    recommendation.reason ||
    recommendation.status;
  const spotIcon = isNightPresentation ? (
    <MoonIcon className={`${desktopInsightIconSizeClass} text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon className={desktopInsightIconSizeClass} />
  );

  return (
    <GlassCard variant="insight" className={`flex items-start gap-3 px-4 py-4 ${mobileInsightCardSurfaceClass} border-karl-gold/20`}>
      <InsightIconFrame tone={isNightPresentation ? "mist" : "gold"}>
        {spotIcon}
      </InsightIconFrame>
      <div className="min-w-0 flex-1">
        <CardLabel className="text-white/45 lg:text-white/45">
          {sunshineResultTitle(
            recommendation.sunshineScore,
            isNightPresentation,
            {
              fogScore: recommendation.fogScore,
              sunshineScore: recommendation.sunshineScore,
            },
          )}
        </CardLabel>
        <h2 className="mt-2 max-sm:mt-3 text-xl max-sm:text-[1.5rem] font-semibold leading-tight text-white">
          {recommendation.locationName}
        </h2>
        <p className="mt-1.5 max-sm:mt-2.5 text-sm max-sm:text-base font-semibold text-karl-gold">{subtitle}</p>
        <p className="mt-1.5 max-sm:mt-2.5 text-sm max-sm:text-[0.9375rem] text-white/60">
          {recommendation.distanceText} · {recommendation.temperature}°
        </p>
        <FindClearSkiesCta
          locationId={recommendation.locationID}
          isLoading={false}
          variant="secondary"
          className="mt-4 max-sm:mt-5"
        />
      </div>
      <span className="shrink-0 text-[1.75rem] max-sm:text-[2.25rem] font-light leading-none text-karl-gold">
        {recommendation.sunshineScore}
      </span>
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
    <MoonIcon className={`${desktopInsightIconSizeClass} text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon className={desktopInsightIconSizeClass} />
  );

  return (
    <Link
      href={href}
      aria-label={`View clearest spot on map: ${recommendation.locationName}`}
      className={desktopClickableCardLinkClass}
    >
      <GlassCard
        variant="desktop"
        className={`flex h-full items-center gap-4 px-5 py-5 ${desktopClickableCardHoverClass}`}
      >
        <InsightIconFrame tone={isNightPresentation ? "mist" : "gold"}>
          {spotIcon}
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>
            {sunshineResultTitle(
              recommendation.sunshineScore,
              isNightPresentation,
              {
                fogScore: recommendation.fogScore,
                sunshineScore: recommendation.sunshineScore,
              },
            )}
          </CardLabel>
          <h2 className="mt-1.5 text-lg font-semibold text-white lg:text-xl">
            {recommendation.locationName}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-white/68">{subtitle}</p>
          <p className="mt-1 text-sm text-white/62">
            {recommendation.distanceText} · {recommendation.temperature}°
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xl font-light leading-none text-karl-gold lg:text-[1.65rem]">
            {recommendation.sunshineScore}
          </span>
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
