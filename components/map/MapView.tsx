"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import { MapRegionChips } from "@/components/map/MapRegionChips";
import { GlassCard } from "@/components/ui/GlassCard";
import { getLocations } from "@/lib/api/weather";
import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";
import { isBayAreaProductRegionId } from "@/lib/map/config";
import { resolveMapLocationFocus } from "@/lib/map/locationSelection";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { buildMapHref, readMapLocationParam } from "@/lib/map/routing";

function MapLocationCard({
  location,
  isSelected,
}: {
  location: {
    id: string;
    name: string;
    status: string;
    sunshineScore: number;
    temperature: number;
    distanceText: string;
  };
  isSelected: boolean;
}) {
  return (
    <GlassCard
      className={`px-4 py-4 ${
        isSelected ? "border-karl-gold/35 bg-karl-navy-glass/90" : ""
      }`}
      data-selected={isSelected ? "true" : "false"}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
            {isSelected ? "Selected Location" : "Location"}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">{location.name}</h2>
          <p className="mt-1 text-sm text-white/65">{location.status}</p>
          <p className="mt-2 text-sm text-white/50">
            {location.distanceText} · {location.temperature}°
          </p>
        </div>
        <div className="rounded-full border border-karl-gold/25 px-2.5 py-1.5 text-center">
          <p className="text-lg font-light text-karl-gold">{location.sunshineScore}</p>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-white/40">
            Sunshine
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export function MapView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedLocationId = readMapLocationParam(searchParams);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
    staleTime: WEATHER_STALE_TIME_MS,
  });

  const locations = useMemo(
    () => locationsQuery.data?.locations ?? [],
    [locationsQuery.data?.locations],
  );
  const { selectedLocation, unknownLocationId } = resolveMapLocationFocus({
    requestedLocationId,
    locations,
  });

  const markerLocations = useMemo<MapMarkerLocation[]>(
    () =>
      locations.map((location) => ({
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        sunshineScore: location.sunshineScore,
      })),
    [locations],
  );

  const handleSelectLocation = useCallback(
    (locationId: string) => {
      setSelectedRegionId(null);
      router.replace(buildMapHref(locationId), { scroll: false });
    },
    [router],
  );

  const handleSelectRegion = useCallback(
    (regionId: string) => {
      if (!isBayAreaProductRegionId(regionId)) {
        return;
      }

      setSelectedRegionId((current) => (current === regionId ? null : regionId));
      router.replace("/map", { scroll: false });
    },
    [router],
  );

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 py-6 sm:py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
          Where&apos;s Karl?
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Map</h1>
        <p className="text-base text-white/70">
          {selectedLocation
            ? `Focused on ${selectedLocation.name}.`
            : "Explore conditions across San Francisco, North Bay, East Bay, and South Bay."}
        </p>
      </header>

      <MapRegionChips
        selectedRegionId={selectedLocation ? null : selectedRegionId}
        onSelectRegion={handleSelectRegion}
      />

      <GlassCard className="relative aspect-[4/5] overflow-hidden px-0 py-0">
        <BayAreaMap
          locations={markerLocations}
          selectedLocationId={selectedLocation?.id ?? null}
          selectedRegionId={selectedLocation ? null : selectedRegionId}
          onSelectLocation={handleSelectLocation}
          isLoading={locationsQuery.isLoading}
        />
      </GlassCard>

      {unknownLocationId ? (
        <GlassCard className="px-4 py-3">
          <p className="text-sm text-white/70">
            Couldn&apos;t find{" "}
            <span className="font-semibold text-white">
              {unknownLocationId.replaceAll("-", " ")}
            </span>
            . Showing the Bay Area map instead.
          </p>
        </GlassCard>
      ) : null}

      {selectedLocation ? (
        <MapLocationCard location={selectedLocation} isSelected />
      ) : null}

      {!locationsQuery.isLoading && locations.length > 0 ? (
        <section aria-label="Bay Area locations" className="space-y-2">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
            Bay Area Locations
          </p>
          <div className="space-y-2">
            {locations
              .filter((location) => location.id !== selectedLocation?.id)
              .map((location) => (
                <MapLocationCard
                  key={location.id}
                  location={location}
                  isSelected={false}
                />
              ))}
          </div>
        </section>
      ) : null}

      <p className="text-center text-[0.65rem] text-white/30">
        Map data © OpenStreetMap contributors · CARTO
      </p>
    </div>
  );
}
