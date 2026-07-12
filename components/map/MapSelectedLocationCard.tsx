"use client";

import { useCallback, useEffect, useState } from "react";

import { KarlLogo } from "@/components/brand/KarlLogo";
import { MapLocationConditionIcon } from "@/components/map/MapLocationConditionIcon";
import { MapPhonePortraitConditionIcon } from "@/components/map/MapPhonePortraitConditionIcon";
import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  getLocationConditionLabel,
  resolveLocationFogIntensity,
} from "@/lib/map/conditions";
import { locationWeatherMetadataItems } from "@/lib/map/locationMetadata";
import { nextHourOutlookSummary } from "@/lib/home/weatherDisplay";
import { useIsNighttime } from "@/lib/hooks/useIsNighttime";
import { presentClearSkiesScore } from "@/lib/score/clearSkiesScore";
import { presentAirQuality } from "@/lib/weather/airQuality";
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

function useFavoriteToggle(locationId: string) {
  const [isFavorite, setIsFavorite] = useState(() =>
    isFavoriteLocation(locationId),
  );

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(toggleFavoriteLocation(locationId));
  }, [locationId]);

  return { isFavorite, handleToggleFavorite };
}

function FavoriteButton({
  location,
  isFavorite,
  onToggle,
  size = "md",
}: {
  location: LocationWeather;
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Remove ${location.name} from favorites`
          : `Add ${location.name} to favorites`
      }
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors motion-reduce:transition-none ${
        size === "sm" ? "h-5 w-5" : "h-6 w-6"
      } ${
        isFavorite
          ? "text-karl-gold"
          : "text-white/42 hover:bg-white/[0.05] hover:text-karl-gold/85"
      }`}
    >
      <FavoriteHeartIcon
        filled={isFavorite}
        className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}
      />
    </button>
  );
}

function PhonePortraitSelectedCard({
  location,
  onClose,
  showCloseButton,
}: {
  location: LocationWeather;
  onClose?: () => void;
  showCloseButton: boolean;
}) {
  const isNighttime = useIsNighttime();
  const isDegraded = isLocationDataDegraded(location.dataStatus);
  const intensity = resolveLocationFogIntensity(location);
  const conditionLabel = getLocationConditionLabel(location, isNighttime);
  const karlRead = getConditionSentence(location);
  const score = presentClearSkiesScore(location.sunshineScore);
  const airQuality = presentAirQuality(location.aqi);
  const forecastSummary = nextHourOutlookSummary(location.prediction);

  const { isFavorite, handleToggleFavorite } = useFavoriteToggle(location.id);

  useEffect(() => {
    if (!onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const humidity =
    typeof location.humidity === "number" && Number.isFinite(location.humidity)
      ? `Humidity ${Math.round(location.humidity)}%`
      : null;
  const weatherSummary = [
    ...locationWeatherMetadataItems(location).map((item) =>
      item.replace(/^Fog: /, "Fog ").replace(/^Wind: /, "Wind "),
    ),
    humidity,
  ].filter((item): item is string => Boolean(item));

  return (
    <article
      aria-label={`Selected location: ${location.name}`}
      className="relative w-full rounded-2xl border border-[rgb(160_185_210/0.24)] bg-[rgb(6_15_27/0.92)] px-3 py-2.5 shadow-[0_10px_18px_rgb(0_0_0/0.45)]"
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

      {/* Top row: location name + favorite */}
      <div className="flex items-center gap-1.5 pr-6">
        <h2 className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold leading-tight tracking-tight text-white">
          {location.name}
        </h2>
        <FavoriteButton
          location={location}
          isFavorite={isFavorite}
          onToggle={handleToggleFavorite}
          size="sm"
        />
      </div>

      {isDegraded ? <DegradedDataLabel variant="location" className="mt-1" /> : null}

      {/* Primary metrics: condition · Karl's Read · Clear Skies Score */}
      <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-stretch gap-2.5">
        <div className="flex flex-col items-center justify-center gap-0.5 text-center">
          <MapPhonePortraitConditionIcon
            intensity={intensity}
            className="h-6 w-6"
          />
          <span className="text-[0.5625rem] font-medium leading-none text-white/60">
            {conditionLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-col justify-center border-x border-[rgb(150_175_200/0.16)] px-2.5">
          <div className="flex items-center gap-1">
            <KarlLogo className="h-4 w-4" />
            <span className="text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-karl-gold/90">
              Karl&apos;s Read
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-white/78">
            {karlRead}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[0.5rem] font-bold uppercase leading-none tracking-[0.06em] text-white/40">
            Clear Skies
          </span>
          <span
            className="mt-0.5 text-2xl font-light leading-none"
            style={{ color: score.color }}
            data-score-band={score.band}
            data-testid="clear-skies-score"
          >
            {score.score}
          </span>
        </div>
      </div>

      {/* Secondary metrics: Air Quality + weather summary */}
      <div className="mt-2 space-y-1.5 border-t border-[rgb(150_175_200/0.16)] pt-2">
        <div
          className="flex items-center justify-between gap-2"
          data-testid="air-quality-slot"
        >
          <span className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-white/40">
            Air Quality
          </span>
          {airQuality.available ? (
            <span
              className="text-[0.6875rem] font-semibold leading-none"
              style={{ color: airQuality.color ?? undefined }}
              data-aqi-band={airQuality.band ?? undefined}
            >
              {airQuality.aqi} · {airQuality.label}
            </span>
          ) : (
            <span className="text-[0.6875rem] font-medium leading-none text-white/38">
              Coming Soon
            </span>
          )}
        </div>

        {weatherSummary.length > 0 ? (
          <p className="text-[0.625rem] font-medium leading-snug text-white/55">
            {weatherSummary.join("  ·  ")}
          </p>
        ) : null}
      </div>

      {/* Forecast preview — the card is the primary forecast experience. */}
      {forecastSummary ? (
        <div className="mt-2 border-t border-[rgb(150_175_200/0.16)] pt-2">
          <p className="text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-white/40">
            Next hour
          </p>
          <p className="mt-1 text-[0.6875rem] leading-snug text-white/72">
            {forecastSummary}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function DesktopSelectedCard({
  location,
  onClose,
  showCloseButton,
}: {
  location: LocationWeather;
  onClose?: () => void;
  showCloseButton: boolean;
}) {
  const conditionSentence = getConditionSentence(location);
  const isDegraded = isLocationDataDegraded(location.dataStatus);
  const metadataItems = locationWeatherMetadataItems(location);
  const score = presentClearSkiesScore(location.sunshineScore);

  const { isFavorite, handleToggleFavorite } = useFavoriteToggle(location.id);

  useEffect(() => {
    if (!onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <article
      className={`${desktopGlassCardClass} relative max-w-[28rem] px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.28)]`}
      aria-label={`Selected location: ${location.name}`}
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

      <div className="flex w-full items-center gap-3 pr-5">
        <MapLocationConditionIcon location={location} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h2 className="text-[1.05rem] font-semibold leading-tight tracking-tight text-white">
              {location.name}
            </h2>
            <FavoriteButton
              location={location}
              isFavorite={isFavorite}
              onToggle={handleToggleFavorite}
            />
          </div>
          <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-snug text-white/72">
            {conditionSentence}
          </p>

          {isDegraded ? (
            <DegradedDataLabel variant="location" className="mt-1" />
          ) : null}

          {metadataItems.length > 0 ? (
            <p className="mt-1.5 text-[0.65rem] font-medium text-white/48">
              {metadataItems.join(" • ")}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-[4.5rem] shrink-0 flex-col items-center justify-center self-center border-l border-white/10 pl-3">
          <div className="text-center">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-white/40 max-lg:text-[0.625rem] max-lg:tracking-[0.12em]">
              Clear Skies Score
            </p>
            <p
              className="mt-0.5 text-[1.35rem] font-light leading-none max-lg:mt-1 max-lg:text-[2rem]"
              style={{ color: score.color }}
              data-score-band={score.band}
              data-testid="clear-skies-score"
            >
              {score.score}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MapSelectedLocationCard({
  location,
  onClose,
  phonePortrait = false,
  showCloseButton = true,
}: MapSelectedLocationCardProps) {
  if (phonePortrait) {
    return (
      <PhonePortraitSelectedCard
        location={location}
        onClose={onClose}
        showCloseButton={showCloseButton}
      />
    );
  }

  return (
    <DesktopSelectedCard
      location={location}
      onClose={onClose}
      showCloseButton={showCloseButton}
    />
  );
}
