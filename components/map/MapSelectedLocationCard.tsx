"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { KarlLogo } from "@/components/brand/KarlLogo";
import { MapLocationConditionIcon } from "@/components/map/MapLocationConditionIcon";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  getFogIntensity,
  getFogIntensityLabel,
  resolveFogScore,
  resolveLocationFogIntensity,
  type FogIntensity,
} from "@/lib/map/conditions";
import { getPhonePortraitFogRailConditionIconDataUri } from "@/lib/map/phonePortraitConditionIcons";
import { getProductRegionNameForLocation } from "@/lib/map/regions";
import { locationWeatherMetadataItems } from "@/lib/map/locationMetadata";
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

/**
 * Karl's Read always reads as a natural insight paragraph, never a bare
 * condition label. `karlReason` is the authored insight sentence, so it wins;
 * we fall back to the prediction narrative and only use the terse `status`
 * label as a last resort.
 */
function getKarlReadParagraph(location: LocationWeather): string {
  const reason = location.karlReason?.trim();
  if (reason) {
    return reason;
  }

  const predictionReason = location.prediction?.predictionReason?.trim();
  if (predictionReason) {
    return predictionReason;
  }

  return location.status?.trim() || "Conditions unavailable";
}


function useFavoriteToggle(locationId: string) {
  const [isFavorite, setIsFavorite] = useState(() =>
    isFavoriteLocation(locationId),
  );

  // Keep favorite state correct when the selected location changes without the
  // card unmounting (the persistent bottom sheet stays mounted across taps).
  useEffect(() => {
    setIsFavorite(isFavoriteLocation(locationId));
  }, [locationId]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(toggleFavoriteLocation(locationId));
  }, [locationId]);

  return { isFavorite, handleToggleFavorite };
}

/** Location pin glyph for the sheet subtitle. */
function LocationPinIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

/** Relative freshness label for the selected-location header ("Updated …"). */
function relativeUpdatedLabel(updatedAt: string): string {
  const timestamp = Date.parse(updatedAt);
  if (Number.isNaN(timestamp)) {
    return "Updated recently";
  }

  const diffMinutes = Math.round((Date.now() - timestamp) / 60000);
  if (diffMinutes <= 1) {
    return "Updated just now";
  }
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Updated ${diffDays}d ago`;
}

type MapForecastPeriod = {
  key: string;
  label: string;
  intensity: FogIntensity;
  tempF: number | null;
  caption: string | null;
};

/**
 * Real forecast periods for the sheet's hourly strip.
 *
 * The web backend does not yet expose an hourly forecast array — only the
 * current observation and a single next-hour projection. We render the honest
 * data we have (current conditions + the projected next-hour intensity) rather
 * than fabricating hourly temperatures. When a backend hourly array lands, this
 * builder is the single place to expand into the full strip.
 */
function buildForecastPeriods(
  location: LocationWeather,
  isNighttime: boolean,
): MapForecastPeriod[] {
  const periods: MapForecastPeriod[] = [
    {
      key: "now",
      label: "Now",
      intensity: resolveLocationFogIntensity(location),
      tempF:
        typeof location.temperature === "number" &&
        Number.isFinite(location.temperature)
          ? Math.round(location.temperature)
          : null,
      caption: null,
    },
  ];

  const projected = location.prediction?.projectedFogScore1h;
  if (typeof projected === "number" && Number.isFinite(projected)) {
    const nextIntensity = getFogIntensity(Math.max(0, Math.min(100, projected)));
    periods.push({
      key: "next-hour",
      label: "Next hr",
      intensity: nextIntensity,
      tempF: null,
      caption: getFogIntensityLabel(nextIntensity, isNighttime),
    });
  }

  return periods;
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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-karl-gold/90">
      {children}
    </p>
  );
}

/**
 * A single secondary metric (Fog / AQI / Temp / Wind). Values come from the
 * canonical helpers — this never derives thresholds or colors itself. The cell
 * is intentionally border-free: hierarchy comes from typography and spacing.
 */
function SecondaryMetric({
  title,
  value,
  valueColor,
  supporting,
  band,
  testId,
  containerTestId,
  noWrapValue = false,
}: {
  title: string;
  value: ReactNode;
  valueColor?: string;
  supporting?: string;
  band?: string;
  testId?: string;
  containerTestId?: string;
  noWrapValue?: boolean;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
      data-testid={containerTestId}
    >
      <span className="text-[0.5625rem] font-bold uppercase leading-none tracking-[0.1em] text-white/40">
        {title}
      </span>
      <span
        className={`text-[0.9375rem] font-semibold leading-none ${
          noWrapValue ? "whitespace-nowrap" : ""
        }`}
        style={valueColor ? { color: valueColor } : undefined}
        data-score-band={band}
        data-testid={testId}
      >
        {value}
      </span>
      <span className="min-h-[0.75rem] text-[0.5625rem] font-medium leading-tight text-white/45">
        {supporting ?? ""}
      </span>
    </div>
  );
}

function ForecastChip({
  period,
  isNighttime,
}: {
  period: MapForecastPeriod;
  isNighttime: boolean;
}) {
  return (
    <div className="flex min-w-[3.5rem] shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-white/[0.03] px-3 py-2.5 text-center">
      <span className="text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.06em] text-white/55">
        {period.label}
      </span>
      {/* Canonical condition icon (Clear → cloud-free sun), matching the map
          markers and Fog Intensity rail. */}
      <img
        src={getPhonePortraitFogRailConditionIconDataUri(period.intensity, {
          isNighttime,
        })}
        alt=""
        aria-hidden
        width={28}
        height={28}
        className="h-7 w-7"
      />
      <span className="text-sm font-semibold leading-none text-white">
        {period.tempF !== null ? `${period.tempF}°` : (period.caption ?? "—")}
      </span>
    </div>
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
  const headerIntensity = resolveLocationFogIntensity(location);
  const karlRead = getKarlReadParagraph(location);
  const score = presentClearSkiesScore(location.sunshineScore);
  const airQuality = presentAirQuality(location.aqi);
  const fogScore = resolveFogScore(location);
  const fogLabel = getFogIntensityLabel(headerIntensity, isNighttime);
  const forecastPeriods = buildForecastPeriods(location, isNighttime);

  const subtitle = `${getProductRegionNameForLocation(location) ?? "Bay Area"}, CA`;
  const updatedLabel = relativeUpdatedLabel(location.updatedAt);

  const windValue =
    typeof location.windSpeed === "number" && Number.isFinite(location.windSpeed)
      ? location.windDirection?.trim()
        ? `${location.windDirection.trim()} ${Math.round(location.windSpeed)}`
        : `${Math.round(location.windSpeed)}`
      : "—";
  const tempValue =
    typeof location.temperature === "number" &&
    Number.isFinite(location.temperature)
      ? `${Math.round(location.temperature)}°`
      : "—";

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

  const header = (
    <>
      <div className="flex items-start gap-3">
        {/*
          Location image placeholder. The backend does not yet expose a
          canonical per-location image URL, so this renders a neutral, premium
          placeholder occupying the exact circular frame the real image will
          fill. When the backend provides an image URL, replace the inner
          caption with `<img src={…} className="h-full w-full object-cover" />`
          inside this same frame — no structural change and no new image
          pipeline, mapping, or per-location asset required.
        */}
        <span
          data-testid="location-image-placeholder"
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-white/[0.18] via-white/[0.06] to-transparent text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <span className="px-1 text-[0.5rem] font-semibold leading-[1.05] tracking-tight text-white/70">
            Location Image
          </span>
          <span className="text-[0.4375rem] font-medium uppercase leading-[1.05] tracking-[0.08em] text-white/45">
            Coming Soon
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[1.0625rem] font-semibold leading-tight tracking-tight text-white">
            {location.name}
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-[0.75rem] leading-tight text-white/60">
            <LocationPinIcon className="h-3 w-3 shrink-0 text-white/45" />
            <span className="truncate">{subtitle}</span>
          </p>
          <p className="mt-0.5 text-[0.625rem] leading-tight text-white/40">
            {updatedLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <FavoriteButton
            location={location}
            isFavorite={isFavorite}
            onToggle={handleToggleFavorite}
          />
          {showCloseButton && onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close selected location"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-sm leading-none text-white/60 transition-colors hover:border-white/25 hover:text-white motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {isDegraded ? (
        <DegradedDataLabel variant="location" className="mt-1.5" />
      ) : null}

      {/* At-a-glance metrics — canonical helpers only. The Clear Skies Score
          leads as the headline metric (large number + quality label, no boxed
          tint); Fog / AQI / Temp / Wind follow as a lighter typographic row. */}
      <div className="mt-4" data-testid="selected-location-metrics">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-karl-gold/90">
          Clear Sky Score
        </p>
        <div className="mt-1 flex items-baseline gap-2.5">
          <span
            className="text-[2.75rem] font-light leading-none tracking-tight"
            style={{ color: score.color }}
            data-score-band={score.band}
            data-testid="clear-skies-score"
          >
            {score.score}
          </span>
          <span
            className="text-base font-semibold leading-none"
            style={{ color: score.color }}
            data-testid="clear-skies-quality"
          >
            {score.qualityLabel}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-4">
          <SecondaryMetric
            title="Fog"
            value={fogScore !== null ? `${fogScore}%` : "—"}
            supporting={fogLabel}
          />
          <SecondaryMetric
            title="AQI"
            value={
              airQuality.available ? (
                airQuality.aqi
              ) : (
                <span className="text-[0.625rem] font-medium leading-tight text-white/45">
                  Coming Soon
                </span>
              )
            }
            valueColor={
              airQuality.available ? (airQuality.color ?? undefined) : undefined
            }
            supporting={airQuality.available ? airQuality.label : undefined}
            band={airQuality.available ? (airQuality.band ?? undefined) : undefined}
            containerTestId="air-quality-slot"
          />
          <SecondaryMetric title="Temp" value={tempValue} />
          <SecondaryMetric
            title="Wind"
            value={windValue}
            supporting="mph"
            noWrapValue
          />
        </div>
      </div>
    </>
  );

  return (
    <BottomSheet
      ariaLabel={`Selected location: ${location.name}`}
      header={header}
    >
      {/* Karl's Read — the primary insight section. */}
      <section aria-label="Karl's Read" className="border-t border-white/10 pt-4">
        <SectionLabel>Karl&apos;s Read</SectionLabel>
        <div className="mt-3 flex items-start gap-3.5">
          <KarlLogo className="h-12 w-12 shrink-0" />
          <p className="text-[0.8125rem] leading-relaxed text-white/80">
            {karlRead}
          </p>
        </div>
      </section>

      {/* Hourly outlook — the sheet is the forecast experience. */}
      <section
        aria-label="Hourly outlook"
        className="mt-5 border-t border-white/10 pt-4"
      >
        <SectionLabel>Hourly Outlook</SectionLabel>
        <div className="mt-3 flex gap-2.5 overflow-x-auto overscroll-x-contain pb-1">
          {forecastPeriods.map((period) => (
            <ForecastChip
              key={period.key}
              period={period}
              isNighttime={isNighttime}
            />
          ))}
        </div>
      </section>
    </BottomSheet>
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
