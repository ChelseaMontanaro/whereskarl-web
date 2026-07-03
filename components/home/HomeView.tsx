"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BestRightNowSection } from "@/components/home/BestRightNowSection";
import { BestSunshineCard } from "@/components/home/BestSunshineCard";
import { CinematicHero } from "@/components/home/CinematicHero";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { IntelligenceNarrativeCard } from "@/components/home/IntelligenceNarrativeCard";
import { NextHourOutlookCard } from "@/components/home/NextHourOutlookCard";
import { useConditionsStatus } from "@/components/providers/ConditionsStatusProvider";
import { getKarlIntelligence } from "@/lib/api/intelligence";
import { getBestSunshine, getCurrent, getLocations } from "@/lib/api/weather";
import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";
import { resolveConditionsPresentation } from "@/lib/home/conditionsStatus";
import { resolveHeroPresentation } from "@/lib/home/heroPresentation";
import {
  bestRightNowItems,
  foggiestKarlLocation,
  formatUpdatedAt,
  heroHeadline,
  nextHourOutlookSummary,
} from "@/lib/home/weatherDisplay";
import {
  loadLastKnownWeather,
  saveLastKnownWeather,
} from "@/lib/storage/lastKnownWeather";

export function HomeView() {
  const { setPresentation } = useConditionsStatus();
  const [loadedFromLastKnown, setLoadedFromLastKnown] = useState(false);
  const [initialLastKnown] = useState(() => loadLastKnownWeather());

  const currentQuery = useQuery({
    queryKey: ["current"],
    queryFn: getCurrent,
    staleTime: WEATHER_STALE_TIME_MS,
    initialData: initialLastKnown?.current,
    meta: { restored: Boolean(initialLastKnown?.current) },
  });

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
    staleTime: WEATHER_STALE_TIME_MS,
    initialData: initialLastKnown?.locations,
  });

  const bestSunshineQuery = useQuery({
    queryKey: ["best-sunshine"],
    queryFn: () => getBestSunshine(),
    staleTime: WEATHER_STALE_TIME_MS,
    initialData: initialLastKnown?.bestSunshine,
  });

  const karlLocation = useMemo(
    () =>
      locationsQuery.data
        ? foggiestKarlLocation(locationsQuery.data.locations)
        : null,
    [locationsQuery.data],
  );

  const focusLocationId = karlLocation?.id ?? null;

  const intelligenceQuery = useQuery({
    queryKey: ["karl-intelligence", focusLocationId],
    queryFn: () =>
      getKarlIntelligence(
        focusLocationId ? { locationId: focusLocationId } : undefined,
      ),
    staleTime: WEATHER_STALE_TIME_MS,
    enabled: Boolean(locationsQuery.data),
    initialData: initialLastKnown?.intelligence,
  });

  const isLoadingWeather =
    currentQuery.isLoading ||
    locationsQuery.isLoading ||
    bestSunshineQuery.isLoading;

  const hasLoadedWeather = Boolean(
    currentQuery.data && locationsQuery.data && bestSunshineQuery.data,
  );

  const current = currentQuery.data ?? null;
  const bestSunshine = bestSunshineQuery.data ?? null;
  const intelligence = intelligenceQuery.data ?? null;

  const heroPresentation = resolveHeroPresentation(intelligence?.heroImagery);
  const bestRightNow = bestRightNowItems(intelligence, bestSunshine);
  const nextHourSummary = nextHourOutlookSummary(karlLocation?.prediction);
  const nextHourConfidence =
    karlLocation?.prediction?.predictionConfidenceLabel ?? null;

  const headline = heroHeadline({
    current,
    karlLocation,
    intelligenceFocusLocationId: intelligence?.heroImagery?.focusLocationId,
    hasLoadedWeather,
  });

  const subheadline =
    intelligence?.narrative.summary ??
    current?.summary ??
    "Track Karl across the Bay.";

  useEffect(() => {
    if (initialLastKnown && !currentQuery.isFetchedAfterMount) {
      setLoadedFromLastKnown(true);
    }
  }, [initialLastKnown, currentQuery.isFetchedAfterMount]);

  useEffect(() => {
    if (
      currentQuery.data &&
      locationsQuery.data &&
      bestSunshineQuery.data &&
      currentQuery.isFetchedAfterMount &&
      locationsQuery.isFetchedAfterMount &&
      bestSunshineQuery.isFetchedAfterMount
    ) {
      saveLastKnownWeather({
        current: currentQuery.data,
        locations: locationsQuery.data,
        bestSunshine: bestSunshineQuery.data,
        intelligence: intelligenceQuery.data ?? undefined,
        savedAt: new Date().toISOString(),
      });
      setLoadedFromLastKnown(false);
    }
  }, [
    bestSunshineQuery.data,
    bestSunshineQuery.isFetchedAfterMount,
    currentQuery.data,
    currentQuery.isFetchedAfterMount,
    intelligenceQuery.data,
    locationsQuery.data,
    locationsQuery.isFetchedAfterMount,
  ]);

  useEffect(() => {
    setPresentation(
      resolveConditionsPresentation({
        isLoading: isLoadingWeather,
        hasLoadedWeather,
        loadedFromLastKnown,
        currentSource: current?.source,
      }),
    );
  }, [
    current?.source,
    hasLoadedWeather,
    isLoadingWeather,
    loadedFromLastKnown,
    setPresentation,
  ]);

  return (
    <div className="pb-8">
      <CinematicHero
        presentation={heroPresentation}
        headline={headline}
        subheadline={subheadline}
        statusLabel={current?.status ?? "Checking conditions"}
        isLoading={!hasLoadedWeather}
      />

      <div className="relative z-10 mx-auto -mt-10 flex w-full max-w-[430px] flex-col gap-4 px-4">
        <DashboardGrid
          current={current}
          bestSunshine={bestSunshine}
          isLoading={!hasLoadedWeather}
        />

        <IntelligenceNarrativeCard
          intelligence={intelligence}
          isLoading={intelligenceQuery.isLoading && !intelligence}
        />

        <BestRightNowSection items={bestRightNow} />

        <NextHourOutlookCard
          summary={nextHourSummary}
          confidenceLabel={nextHourConfidence}
          isLoading={!hasLoadedWeather}
        />

        <BestSunshineCard
          recommendation={bestSunshine}
          isLoading={!hasLoadedWeather}
        />

        {current ? (
          <p className="text-center text-xs text-white/40">
            Updated {formatUpdatedAt(current.updatedAt)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
