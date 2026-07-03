"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { GlassCard } from "@/components/ui/GlassCard";
import { getLocations } from "@/lib/api/weather";
import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";
import {
  mapViewportForLocation,
  resolveMapLocationFocus,
} from "@/lib/map/locationSelection";
import { readMapLocationParam } from "@/lib/map/routing";

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
  const searchParams = useSearchParams();
  const requestedLocationId = readMapLocationParam(searchParams);

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
    staleTime: WEATHER_STALE_TIME_MS,
  });

  const locations = locationsQuery.data?.locations ?? [];
  const { selectedLocation, unknownLocationId } = resolveMapLocationFocus({
    requestedLocationId,
    locations,
  });
  const viewport = selectedLocation
    ? mapViewportForLocation(selectedLocation)
    : null;

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
            : "Explore Bay Area conditions by location."}
        </p>
      </header>

      <GlassCard className="relative aspect-[4/5] overflow-hidden px-0 py-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(242,163,38,0.12),transparent_42%),linear-gradient(180deg,rgb(9_27_42)_0%,rgb(3_11_20)_100%)]"
        />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

        {locationsQuery.isLoading ? (
          <div className="relative flex h-full items-center justify-center px-6 text-center text-sm text-white/55">
            Loading Bay Area locations…
          </div>
        ) : selectedLocation && viewport ? (
          <>
            <div
              aria-hidden="true"
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-karl-gold bg-karl-gold/80 shadow-[0_0_0_6px_rgba(242,163,38,0.18)]"
              style={{
                left: `${viewport.markerLeftPercent}%`,
                top: `${viewport.markerTopPercent}%`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-karl-gold">
                {viewport.zoomLabel}
              </p>
              <p className="mt-1 text-sm text-white/70">{viewport.centerLabel}</p>
            </div>
          </>
        ) : (
          <div className="relative flex h-full items-center justify-center px-6 text-center text-sm text-white/55">
            Select a location to focus the map preview.
          </div>
        )}
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

      <p className="text-center text-xs text-white/35">
        MapLibre integration is planned for a later step.
      </p>
    </div>
  );
}
