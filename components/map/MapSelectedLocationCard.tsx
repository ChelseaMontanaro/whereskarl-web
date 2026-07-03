"use client";

import { useCallback, useState } from "react";

import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import { getLocationConditionLabel } from "@/lib/map/conditions";
import { getProductRegionNameForLocation } from "@/lib/map/regions";
import {
  isFavoriteLocation,
  toggleFavoriteLocation,
} from "@/lib/storage/favorites";
import type { LocationWeather } from "@/lib/schemas/weather";

type MapSelectedLocationCardProps = {
  location: LocationWeather;
};

export function MapSelectedLocationCard({
  location,
}: MapSelectedLocationCardProps) {
  const regionName = getProductRegionNameForLocation(location.id);
  const conditionLabel = getLocationConditionLabel(location);
  const [isFavorite, setIsFavorite] = useState(() =>
    isFavoriteLocation(location.id),
  );

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(toggleFavoriteLocation(location.id));
  }, [location.id]);

  return (
    <article
      className={`${desktopGlassCardClass} w-full max-w-2xl px-5 py-4`}
      aria-label={`Selected location: ${location.name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {regionName ? (
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-karl-gold/85">
              {regionName}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold text-white">
            {location.name}
          </h2>
          <p className="mt-1 text-sm text-white/70">{location.status}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/45">
            {conditionLabel}
          </p>
          <p className="mt-2 text-sm text-white/55">
            {location.temperature}° · {location.distanceText}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Remove ${location.name} from favorites`
                : `Add ${location.name} to favorites`
            }
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors motion-reduce:transition-none ${
              isFavorite
                ? "border-karl-gold/40 bg-karl-gold/12 text-karl-gold"
                : "border-white/12 bg-white/[0.04] text-white/70 hover:border-karl-gold/30 hover:text-karl-gold"
            }`}
          >
            {isFavorite ? "Favorited" : "Favorite"}
          </button>

          <div className="rounded-full border border-karl-gold/25 px-3 py-2 text-center">
            <p className="text-xl font-light leading-none text-karl-gold">
              {location.sunshineScore}
            </p>
            <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-white/40">
              Clear Skies
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
