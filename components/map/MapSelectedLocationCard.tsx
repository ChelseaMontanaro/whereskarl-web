"use client";

import { useCallback, useEffect, useState } from "react";

import { MapLocationConditionIcon } from "@/components/map/MapLocationConditionIcon";
import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import { resolveFogScore } from "@/lib/map/conditions";
import {
  isFavoriteLocation,
  toggleFavoriteLocation,
} from "@/lib/storage/favorites";
import type { LocationWeather } from "@/lib/schemas/weather";

type MapSelectedLocationCardProps = {
  location: LocationWeather;
  onClose: () => void;
};

function formatFogPercent(location: LocationWeather): string | null {
  const fogScore = resolveFogScore(location);
  if (fogScore === null) {
    return null;
  }

  return `${fogScore}% fog`;
}

function formatWind(location: LocationWeather): string | null {
  if (
    typeof location.windSpeed !== "number" ||
    !Number.isFinite(location.windSpeed)
  ) {
    return null;
  }

  const direction = location.windDirection?.trim();
  return direction
    ? `${location.windSpeed} mph ${direction}`
    : `${location.windSpeed} mph`;
}

function formatTemperature(location: LocationWeather): string | null {
  if (
    typeof location.temperature !== "number" ||
    !Number.isFinite(location.temperature)
  ) {
    return null;
  }

  return `${location.temperature}°`;
}

export function MapSelectedLocationCard({
  location,
  onClose,
}: MapSelectedLocationCardProps) {
  const conditionSentence =
    location.status?.trim() ||
    location.karlReason?.trim() ||
    "Conditions unavailable";
  const fogPercent = formatFogPercent(location);
  const wind = formatWind(location);
  const temperature = formatTemperature(location);
  const metadataItems = [fogPercent, wind, temperature].filter(
    (item): item is string => Boolean(item),
  );

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
      className={`${desktopGlassCardClass} relative min-w-[22rem] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.28)]`}
      aria-label={`Selected location: ${location.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close selected location"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-black/35 text-base leading-none text-white/70 transition-colors hover:border-white/22 hover:text-white motion-reduce:transition-none"
      >
        ×
      </button>

      <div className="flex items-start gap-4 pr-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3.5">
            <MapLocationConditionIcon location={location} />

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold leading-tight text-white">
                {location.name}
              </h2>
              <p className="mt-1.5 text-sm leading-snug text-white/72">
                {conditionSentence}
              </p>
            </div>
          </div>

          {metadataItems.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-[0.72rem] font-medium tracking-[0.02em] text-white/52">
              {metadataItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2.5 border-l border-white/10 pl-4">
          <div className="min-w-[4.75rem] rounded-xl border border-karl-gold/28 bg-karl-gold/[0.06] px-3 py-2 text-center">
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-white/42">
              Clear Skies Score
            </p>
            <p className="mt-1 text-2xl font-light leading-none text-karl-gold">
              {location.sunshineScore}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Remove ${location.name} from favorites`
                : `Add ${location.name} to favorites`
            }
            className={`w-full rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold transition-colors motion-reduce:transition-none ${
              isFavorite
                ? "border-karl-gold/40 bg-karl-gold/12 text-karl-gold"
                : "border-white/12 bg-white/[0.04] text-white/70 hover:border-karl-gold/30 hover:text-karl-gold"
            }`}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
