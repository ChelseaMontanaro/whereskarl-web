"use client";

import { useCallback, useEffect, useState } from "react";

import { MapLocationConditionIcon } from "@/components/map/MapLocationConditionIcon";
import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  resolveFogScore,
  resolveLocationFogIntensity,
} from "@/lib/map/conditions";
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

function getConditionSentence(location: LocationWeather): string {
  const reason = location.karlReason?.trim();
  const status = location.status?.trim();
  const intensity = resolveLocationFogIntensity(location);

  if (reason && intensity === "clear") {
    return reason;
  }

  return status || reason || "Conditions unavailable";
}

export function MapSelectedLocationCard({
  location,
  onClose,
}: MapSelectedLocationCardProps) {
  const conditionSentence = getConditionSentence(location);
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
      className={`${desktopGlassCardClass} relative min-w-[24rem] px-6 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.32)]`}
      aria-label={`Selected location: ${location.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close selected location"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-base leading-none text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75 motion-reduce:transition-none"
      >
        ×
      </button>

      <div className="flex items-start gap-5 pr-4">
        <MapLocationConditionIcon location={location} variant="prominent" />

        <div className="min-w-0 flex-1">
          <h2 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-white">
            {location.name}
          </h2>
          <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-white/76">
            {conditionSentence}
          </p>

          {metadataItems.length > 0 ? (
            <p className="mt-4 text-[0.7rem] font-medium text-white/48">
              {metadataItems.join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="flex w-[5.75rem] shrink-0 flex-col items-stretch gap-3 border-l border-white/10 pl-5">
          <div className="text-center">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/40">
              Clear Skies Score
            </p>
            <p className="mt-1.5 text-[2rem] font-light leading-none text-karl-gold">
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
            className={`rounded-full border px-3 py-2 text-[0.7rem] font-semibold transition-colors motion-reduce:transition-none ${
              isFavorite
                ? "border-karl-gold/45 bg-karl-gold/14 text-karl-gold shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
                : "border-white/14 bg-white/[0.05] text-white/72 hover:border-karl-gold/35 hover:bg-karl-gold/[0.08] hover:text-karl-gold"
            }`}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
