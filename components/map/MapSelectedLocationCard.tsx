"use client";

import { useCallback, useEffect, useState } from "react";

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
  onClose: () => void;
};

export function MapSelectedLocationCard({
  location,
  onClose,
}: MapSelectedLocationCardProps) {
  const regionName = getProductRegionNameForLocation(location.id);
  const conditionLabel = getLocationConditionLabel(location);
  const [isFavorite, setIsFavorite] = useState(() =>
    isFavoriteLocation(location.id),
  );

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(toggleFavoriteLocation(location.id));
  }, [location.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <article
      className={`${desktopGlassCardClass} relative w-full max-w-[580px] px-4 py-3.5`}
      aria-label={`Selected location: ${location.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close selected location"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-black/30 text-base leading-none text-white/70 transition-colors hover:border-white/22 hover:text-white motion-reduce:transition-none"
      >
        ×
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="min-w-0 flex-1">
          {regionName ? (
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-karl-gold/85">
              {regionName}
            </p>
          ) : null}
          <h2 className="mt-0.5 text-lg font-semibold text-white">
            {location.name}
          </h2>
          <p className="mt-1 text-sm text-white/70">{location.status}</p>
          <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.1em] text-white/45">
            {conditionLabel}
          </p>
          <p className="mt-1.5 text-sm text-white/55">
            {location.temperature}° · {location.distanceText}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Remove ${location.name} from favorites`
                : `Add ${location.name} to favorites`
            }
            className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition-colors motion-reduce:transition-none ${
              isFavorite
                ? "border-karl-gold/40 bg-karl-gold/12 text-karl-gold"
                : "border-white/12 bg-white/[0.04] text-white/70 hover:border-karl-gold/30 hover:text-karl-gold"
            }`}
          >
            {isFavorite ? "Favorited" : "Favorite"}
          </button>

          <div className="rounded-full border border-karl-gold/25 px-2.5 py-1.5 text-center">
            <p className="text-lg font-light leading-none text-karl-gold">
              {location.sunshineScore}
            </p>
            <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white/40">
              Clear Skies
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
