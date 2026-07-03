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

  return `${fogScore}%`;
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
      className={`${desktopGlassCardClass} relative max-w-[28rem] px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.28)]`}
      aria-label={`Selected location: ${location.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close selected location"
        className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-sm leading-none text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75 motion-reduce:transition-none"
      >
        ×
      </button>

      <div className="flex items-center gap-3 pr-5">
        <MapLocationConditionIcon location={location} />

        <div className="min-w-0 flex-1">
          <h2 className="text-[1.05rem] font-semibold leading-tight tracking-tight text-white">
            {location.name}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-snug text-white/72">
            {conditionSentence}
          </p>

          {metadataItems.length > 0 ? (
            <p className="mt-1.5 text-[0.65rem] font-medium text-white/48">
              {metadataItems.join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 border-l border-white/10 pl-3">
          <div className="text-center">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-white/40">
              Clear Skies Score
            </p>
            <p className="mt-0.5 text-[1.35rem] font-light leading-none text-karl-gold">
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
            className={`rounded-full border px-2.5 py-1.5 text-[0.65rem] font-semibold transition-colors motion-reduce:transition-none ${
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
