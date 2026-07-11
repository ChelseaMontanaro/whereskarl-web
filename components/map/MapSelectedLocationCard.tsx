"use client";

import { useCallback, useEffect, useState } from "react";

import { MapLocationConditionIcon } from "@/components/map/MapLocationConditionIcon";
import { MapPhonePortraitConditionIcon } from "@/components/map/MapPhonePortraitConditionIcon";
import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  resolveLocationFogIntensity,
} from "@/lib/map/conditions";
import { locationWeatherMetadataItems } from "@/lib/map/locationMetadata";
import {
  isFavoriteLocation,
  toggleFavoriteLocation,
} from "@/lib/storage/favorites";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { LocationWeather } from "@/lib/schemas/weather";
import { isLocationDataDegraded } from "@/lib/weather/dataStatus";

type MapSelectedLocationCardProps = {
  location: LocationWeather;
  onClose?: () => void;
  phonePortrait?: boolean;
  showCloseButton?: boolean;
  embedded?: boolean;
};

function FavoriteHeartIcon({
  filled,
  className = "h-4 w-4",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  phonePortrait = false,
  showCloseButton = true,
  embedded = false,
}: MapSelectedLocationCardProps) {
  const conditionSentence = getConditionSentence(location);
  const isDegraded = isLocationDataDegraded(location.dataStatus);
  const metadataItems = locationWeatherMetadataItems(location);

  const [isFavorite, setIsFavorite] = useState(() =>
    isFavoriteLocation(location.id),
  );

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(toggleFavoriteLocation(location.id));
  }, [location.id]);

  useEffect(() => {
    if (!onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const panelClass = embedded
    ? "relative flex min-w-0 flex-1 items-center"
    : phonePortrait
      ? "relative flex min-h-[5.0625rem] w-full items-center rounded-2xl border border-[rgb(160_185_210/0.24)] bg-[rgb(6_15_27/0.92)] px-2.5 py-3 shadow-[0_10px_18px_rgb(0_0_0/0.45)]"
      : `${desktopGlassCardClass} relative max-w-[28rem] px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.28)]`;

  const Wrapper = embedded ? "div" : "article";

  return (
    <Wrapper
      className={panelClass}
      aria-label={embedded ? undefined : `Selected location: ${location.name}`}
    >
      {showCloseButton && onClose ? (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close selected location"
        className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-sm leading-none text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75 motion-reduce:transition-none"
      >
        ×
      </button>
      ) : null}

      <div
        className={`flex w-full items-center ${
          embedded || phonePortrait ? "gap-2.5 pr-4" : "gap-3 pr-5"
        }`}
      >
        {embedded || phonePortrait ? (
          <MapPhonePortraitConditionIcon
            intensity={resolveLocationFogIntensity(location)}
            className="h-5 w-5 shrink-0"
          />
        ) : (
          <MapLocationConditionIcon location={location} />
        )}

        <div
          className={`min-w-0 flex-1 ${
            embedded || phonePortrait ? "flex flex-col justify-center gap-0.5" : ""
          }`}
        >
          <div className="flex items-center gap-1">
            <h2
              className={`font-semibold tracking-tight text-white ${
                embedded || phonePortrait
                  ? "text-[0.8125rem] leading-3"
                  : "text-[1.05rem] leading-tight"
              }`}
            >
              {location.name}
            </h2>
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${location.name} from favorites`
                  : `Add ${location.name} to favorites`
              }
              className={`flex shrink-0 items-center justify-center rounded-full transition-colors motion-reduce:transition-none ${
                embedded || phonePortrait ? "h-5 w-5" : "h-6 w-6"
              } ${
                isFavorite
                  ? "text-karl-gold"
                  : "text-white/42 hover:bg-white/[0.05] hover:text-karl-gold/85"
              }`}
            >
              <FavoriteHeartIcon
                filled={isFavorite}
                className={embedded || phonePortrait ? "h-3.5 w-3.5" : "h-4 w-4"}
              />
            </button>
          </div>
          <p
            className={`text-white/72 ${
              embedded || phonePortrait
                ? "mt-px line-clamp-1 text-[0.625rem] leading-tight"
                : "mt-0.5 line-clamp-2 text-[0.75rem] leading-snug"
            }`}
          >
            {conditionSentence}
          </p>

          {isDegraded ? (
            <DegradedDataLabel
              variant="location"
              className={embedded || phonePortrait ? "mt-px" : "mt-1"}
            />
          ) : null}

          {metadataItems.length > 0 ? (
            <p
              className={`font-medium text-white/48 ${
                embedded || phonePortrait
                  ? "mt-0.5 text-[0.5625rem] leading-none"
                  : "mt-1.5 text-[0.65rem]"
              }`}
            >
              {metadataItems.join(" • ")}
            </p>
          ) : null}
        </div>

        <div
          className={`flex shrink-0 flex-col items-center justify-center border-l ${
            embedded || phonePortrait
              ? "min-w-[3.25rem] self-stretch border-[rgb(150_175_200/0.16)] py-0.5 pl-2.5"
              : "min-w-[4.5rem] self-center border-white/10 pl-3"
          }`}
        >
          <div className="text-center">
            <p
              className={`font-bold uppercase text-white/40 ${
                embedded || phonePortrait
                  ? "text-[0.5rem] tracking-[0.06em]"
                  : "text-[0.5rem] tracking-[0.14em] max-lg:text-[0.625rem] max-lg:tracking-[0.12em]"
              }`}
            >
              Clear Skies Score
            </p>
            <p
              className={`font-light leading-none text-[#22E36B] ${
                embedded || phonePortrait
                  ? "mt-px text-xl leading-5"
                  : "mt-0.5 text-[1.35rem] max-lg:mt-1 max-lg:text-[2rem]"
              }`}
            >
              {location.sunshineScore}
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
