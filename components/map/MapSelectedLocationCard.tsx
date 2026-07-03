"use client";

import { useCallback, useEffect, useState } from "react";

import {
  FogCoverageIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  getLocationConditionLabel,
} from "@/lib/map/conditions";
import { getMarkerFogIntensity } from "@/lib/map/markers";
import {
  isFavoriteLocation,
  toggleFavoriteLocation,
} from "@/lib/storage/favorites";
import type { LocationWeather } from "@/lib/schemas/weather";

type MapSelectedLocationCardProps = {
  location: LocationWeather;
  onClose: () => void;
};

function LocationConditionIcon({ location }: { location: LocationWeather }) {
  const intensity = getMarkerFogIntensity(location);

  if (intensity === "clear") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-karl-gold/22 bg-karl-gold/8 text-karl-gold">
        <SunshineIcon className="h-5 w-5" />
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.05]">
      <FogCoverageIcon className="h-5 w-5" />
    </span>
  );
}

export function MapSelectedLocationCard({
  location,
  onClose,
}: MapSelectedLocationCardProps) {
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
      className={`${desktopGlassCardClass} relative w-[min(100%,22rem)] px-3.5 py-3`}
      aria-label={`Selected location: ${location.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close selected location"
        className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/12 bg-black/30 text-sm leading-none text-white/70 transition-colors hover:border-white/22 hover:text-white motion-reduce:transition-none"
      >
        ×
      </button>

      <div className="flex items-start gap-2.5 pr-7">
        <LocationConditionIcon location={location} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold leading-tight text-white">
            {location.name}
          </h2>
          <p className="mt-0.5 truncate text-sm text-white/72">{location.status}</p>
          <p className="mt-1 text-[0.68rem] leading-snug text-white/48">
            {conditionLabel} · {location.temperature}° · {location.windSpeed} mph{" "}
            {location.windDirection}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="rounded-xl border border-karl-gold/25 px-2 py-1 text-center">
            <p className="text-base font-light leading-none text-karl-gold">
              {location.sunshineScore}
            </p>
            <p className="mt-0.5 text-[0.5rem] uppercase tracking-[0.08em] text-white/40">
              Clear
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
            className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold transition-colors motion-reduce:transition-none ${
              isFavorite
                ? "border-karl-gold/40 bg-karl-gold/12 text-karl-gold"
                : "border-white/12 bg-white/[0.04] text-white/65 hover:border-karl-gold/30 hover:text-karl-gold"
            }`}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
