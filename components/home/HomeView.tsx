"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BestRightNowSection } from "@/components/home/BestRightNowSection";
import { BestSunshineCard } from "@/components/home/BestSunshineCard";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { HomeDesktopBackground } from "@/components/home/HomeDesktopBackground";
import { HomeHero } from "@/components/home/HomeHero";
import { IntelligenceNarrativeCard } from "@/components/home/IntelligenceNarrativeCard";
import { NextHourOutlookCard } from "@/components/home/NextHourOutlookCard";
import {
  defaultClearSkiesNavState,
  useClearSkiesNav,
} from "@/components/providers/ClearSkiesNavProvider";
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
  heroConfidenceText,
  heroHeadline,
  heroSubheadline,
  isNighttime,
  nextHourOutlookSummary,
} from "@/lib/home/weatherDisplay";
import {
  loadLastKnownWeather,
  saveLastKnownWeather,
} from "@/lib/storage/lastKnownWeather";

export function HomeView() {
  const { setPresentation } = useConditionsStatus();
  const { setClearSkiesNav } = useClearSkiesNav();
  const [loadedFromLastKnown, setLoadedFromLastKnown] = useState(false);
  const [initialLastKnown] = useState(() => loadLastKnownWeather());
  const [isNightPresentation, setIsNightPresentation] = useState(false);

  useEffect(() => {
    setIsNightPresentation(isNighttime(new Date().getHours()));
  }, []);

  const currentQuery = useQuery({
    queryKey: ["current"],
    queryFn: getCurrent,
    staleTime: WEATHER_STALE_TIME_MS,
    placeholderData: initialLastKnown?.current,
    refetchOnMount: "always",
    meta: { restored: Boolean(initialLastKnown?.current) },
  });

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
    staleTime: WEATHER_STALE_TIME_MS,
    placeholderData: initialLastKnown?.locations,
    refetchOnMount: "always",
  });

  const bestSunshineQuery = useQuery({
    queryKey: ["best-sunshine"],
    queryFn: () => getBestSunshine(),
    staleTime: WEATHER_STALE_TIME_MS,
    placeholderData: initialLastKnown?.bestSunshine,
    refetchOnMount: "always",
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
    refetchOnMount: "always",
  });

  const coreWeatherErrored =
    currentQuery.isError || locationsQuery.isError || bestSunshineQuery.isError;

  const isLoadingWeather =
    !coreWeatherErrored &&
    (currentQuery.isPending ||
      locationsQuery.isPending ||
      bestSunshineQuery.isPending);

  const hasLoadedCoreWeather = Boolean(
    currentQuery.data && locationsQuery.data,
  );

  const hasBestSunshine = Boolean(bestSunshineQuery.data);

  const hasLoadedWeather =
    hasLoadedCoreWeather && (hasBestSunshine || bestSunshineQuery.isError);

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
    hasLoadedWeather: hasLoadedCoreWeather,
  });

  const subheadline = heroSubheadline({
    current,
    karlLocation,
    hasLoadedWeather: hasLoadedCoreWeather,
  });

  const isFindingClearSkies =
    bestSunshineQuery.isLoading ||
    (bestSunshineQuery.isFetching && !bestSunshine);

  const clearSkiesLocationId = bestSunshine?.locationID ?? null;

  const confidenceText = heroConfidenceText({
    intelligence,
    karlLocation,
    current,
  });

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
    setClearSkiesNav({
      locationId: clearSkiesLocationId,
      isLoading: isFindingClearSkies,
    });

    return () => {
      setClearSkiesNav(defaultClearSkiesNavState);
    };
  }, [clearSkiesLocationId, isFindingClearSkies, setClearSkiesNav]);

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
    <div className="relative pb-8 lg:pb-12">
      <HomeDesktopBackground presentation={heroPresentation} />

      <HomeHero
        presentation={heroPresentation}
        headline={headline}
        subheadline={subheadline}
        confidenceText={confidenceText}
        isLoading={!hasLoadedCoreWeather}
        clearSkiesLocationId={clearSkiesLocationId}
        isFindingClearSkies={isFindingClearSkies}
      />

      <div className="relative z-10 mx-auto -mt-12 flex w-full max-w-[430px] flex-col px-4 lg:-mt-2 lg:max-w-6xl lg:px-8 lg:pt-4 xl:max-w-7xl">
        <DashboardGrid
          current={current}
          bestSunshine={bestSunshine}
          isLoading={!hasLoadedCoreWeather}
          isNightPresentation={isNightPresentation}
        />

        <div className="mt-3.5 flex flex-col gap-3.5 lg:hidden">
          <BestSunshineCard
            recommendation={bestSunshine}
            isLoading={
              bestSunshineQuery.isLoading || bestSunshineQuery.isFetching
            }
            isUnavailable={bestSunshineQuery.isError}
            layout="mobile"
          />

          <IntelligenceNarrativeCard
            intelligence={intelligence}
            isLoading={intelligenceQuery.isLoading && !intelligence}
            layout="mobile"
          />

          <BestRightNowSection items={bestRightNow} layout="mobile" />

          <NextHourOutlookCard
            summary={nextHourSummary}
            confidenceLabel={nextHourConfidence}
            isLoading={!hasLoadedCoreWeather}
          />
        </div>

        <div className="mt-5 hidden flex-col gap-5 lg:flex">
          <IntelligenceNarrativeCard
            intelligence={intelligence}
            isLoading={intelligenceQuery.isLoading && !intelligence}
            layout="desktop"
          />

          <div className="grid grid-cols-2 gap-4">
            <BestSunshineCard
              recommendation={bestSunshine}
              isLoading={
                bestSunshineQuery.isLoading || bestSunshineQuery.isFetching
              }
              isUnavailable={bestSunshineQuery.isError}
              layout="desktop"
            />

            <BestRightNowSection items={bestRightNow} layout="desktop" />
          </div>
        </div>

        {current ? (
          <p className="mt-4 text-center text-xs text-white/35 lg:mt-6">
            Updated {formatUpdatedAt(current.updatedAt)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
