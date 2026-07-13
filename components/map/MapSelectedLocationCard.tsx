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

function SectionLabel({
  children,
  variant = "gold",
}: {
  children: ReactNode;
  variant?: "gold" | "white";
}) {
  return (
    <p
      className={`text-[0.625rem] font-bold uppercase tracking-[0.14em] ${
        variant === "white" ? "text-white/90" : "text-karl-gold/90"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * A single column in the unified metrics row. Every metric (including Clear Sky
 * Score) shares this structure so the five columns stay aligned in one row.
 * Values, colors, bands, and labels come from the canonical helpers — this
 * component never derives thresholds, colors, or labels itself. The Clear Sky
 * Score column gets the strongest hierarchy purely through props (gold title,
 * larger value, canonical color on both value and quality label) — no boxed or
 * tinted background.
 */
/*
 * Row balance: the Clear Sky Score column takes ~29% of the row (flex-[1.72]
 * against four flex-1 columns → 1.72 / 5.72 ≈ 30%); Fog / AQI / Temp / Wind
 * split the remaining ~71% evenly (~17.5% each). Because Wind now shows only a
 * short speed value (direction moved to the supporting label), every secondary
 * value is compact ("18%", "68°", "12") and can be sized comfortably. Sizes
 * below are verified at a real 390px CSS viewport with no overlap / clip /
 * overflow via getBoundingClientRect.
 */
/** Secondary-metric title: uppercase gray, one line. */
const SECONDARY_TITLE_CLASS =
  "text-[10px] font-bold uppercase tracking-[0.04em] text-white/40";
/** Secondary-metric value (white unless a canonical color is set). */
const SECONDARY_VALUE_CLASS = "text-[28px] font-light leading-none text-white";
/** Shared supporting-label row height — every column ends on this baseline. */
const METRIC_SUPPORTING_ROW_CLASS =
  "flex min-h-[1.25rem] items-end justify-center whitespace-nowrap leading-tight text-[11px] font-medium text-white/45";
/** Value row — tall enough for the hero score, centers every value vertically. */
const METRIC_VALUE_ROW_CLASS =
  "flex min-h-[3rem] w-full items-center justify-center leading-none";

/** Small compass arrow for the Wind supporting label (presentation only). */
function WindDirectionArrow({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M6 1.5 9.25 8.25H6V10.5H2.75V8.25H2.75L6 1.5Z" />
    </svg>
  );
}

/** Gold arrow + "mph" — the Wind supporting row, matching the approved mockup. */
function WindSupportingLabel() {
  return (
    <span className="inline-flex items-center gap-1">
      <WindDirectionArrow className="h-3 w-3 shrink-0 text-karl-gold/90" />
      <span>mph</span>
    </span>
  );
}

function MetricColumn({
  title,
  value,
  valueColor,
  titleClassName = SECONDARY_TITLE_CLASS,
  valueClassName = SECONDARY_VALUE_CLASS,
  supporting,
  supportingColor,
  supportingClassName = METRIC_SUPPORTING_ROW_CLASS,
  band,
  testId,
  supportingTestId,
  containerTestId,
  noWrapValue = false,
  columnClassName = "flex-1",
}: {
  title: string;
  value: ReactNode;
  valueColor?: string;
  titleClassName?: string;
  valueClassName?: string;
  supporting?: ReactNode;
  supportingColor?: string;
  supportingClassName?: string;
  band?: string;
  testId?: string;
  supportingTestId?: string;
  containerTestId?: string;
  noWrapValue?: boolean;
  columnClassName?: string;
}) {
  return (
    <div
      className={`flex min-w-0 ${columnClassName} flex-col items-center text-center`}
      data-testid={containerTestId}
    >
      <span
        className={`flex min-h-[1.125rem] items-end justify-center leading-none ${titleClassName}`}
      >
        {title}
      </span>
      <span
        className={`${METRIC_VALUE_ROW_CLASS} ${valueClassName} ${
          noWrapValue ? "whitespace-nowrap" : ""
        }`}
        style={valueColor ? { color: valueColor } : undefined}
        data-score-band={band}
        data-testid={testId}
      >
        {value}
      </span>
      {/* Supporting labels share one baseline row across all five columns. */}
      <span
        className={supportingClassName}
        style={supportingColor ? { color: supportingColor } : undefined}
        data-testid={supportingTestId}
      >
        {supporting ?? "\u00A0"}
      </span>
    </div>
  );
}

/**
 * One period in the lightweight Hourly Outlook strip. Presentation only: no
 * tile background, border, or rounded box — periods are separated by spacing
 * and typography. Time, canonical condition icon, and temperature are
 * unchanged.
 */
function ForecastPeriod({
  period,
  isNighttime,
}: {
  period: MapForecastPeriod;
  isNighttime: boolean;
}) {
  return (
    <div
      className="flex min-w-[3rem] shrink-0 flex-col items-center gap-1.5 text-center"
      data-testid="hourly-outlook-period"
    >
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

  // Wind value carries the compass direction + speed together (e.g. "NW 8",
  // "WSW 12") to match the approved mockup; the supporting row is the gold arrow
  // + "mph". The combined value is the widest metric string, so the Wind value
  // uses a slightly smaller size that fits three-letter directions cleanly at
  // 390px — Fog / AQI / Temp keep the full 28px hierarchy (never shrunk for Wind).
  const hasWindSpeed =
    typeof location.windSpeed === "number" &&
    Number.isFinite(location.windSpeed);
  const windDirection = location.windDirection?.trim();
  const windValue = hasWindSpeed
    ? windDirection
      ? `${windDirection} ${Math.round(location.windSpeed)}`
      : `${Math.round(location.windSpeed)}`
    : "—";
  const windSupporting: ReactNode = hasWindSpeed ? (
    <WindSupportingLabel />
  ) : undefined;
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

      {/* Unified metrics row — canonical helpers only. Clear Sky Score leads the
          row with the strongest hierarchy (gold title, larger canonical-colored
          value, canonical quality label) but stays inline with Fog / AQI / Temp
          / Wind. No boxed or tinted background — emphasis comes from typography,
          color, and spacing. */}
      <div
        className="mt-4 flex items-start gap-1 border-t border-white/10 pt-4"
        data-testid="selected-location-metrics"
      >
        <MetricColumn
          title="Clear Sky Score"
          titleClassName="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.02em] text-karl-gold/90"
          columnClassName="flex-[1.35]"
          value={score.score}
          valueColor={score.color}
          valueClassName="text-[38px] font-light"
          supporting={score.qualityLabel}
          supportingColor={score.color}
          supportingClassName={`${METRIC_SUPPORTING_ROW_CLASS} text-[14px] font-semibold`}
          band={score.band}
          testId="clear-skies-score"
          supportingTestId="clear-skies-quality"
        />
        <MetricColumn
          title="Fog"
          value={fogScore !== null ? `${fogScore}%` : "—"}
          supporting={fogLabel}
        />
        {/*
          AQI uses the exact same three-level structure as every other metric
          (title / value / supporting). While the canonical helper reports no
          value, the value renders a neutral "—" placeholder (same typography as
          the other metric values) and the supporting label reads "Coming Soon".
          When backend AQI arrives the value becomes the number and the
          supporting label becomes the canonical category — no structural or
          layout change required here.
        */}
        <MetricColumn
          title="AQI"
          value={airQuality.available ? airQuality.aqi : "—"}
          valueColor={
            airQuality.available ? (airQuality.color ?? undefined) : undefined
          }
          supporting={airQuality.available ? airQuality.label : "Coming Soon"}
          supportingColor={
            airQuality.available ? (airQuality.color ?? undefined) : undefined
          }
          supportingClassName={
            airQuality.available
              ? METRIC_SUPPORTING_ROW_CLASS
              : `${METRIC_SUPPORTING_ROW_CLASS} text-[10px] tracking-tight`
          }
          band={airQuality.available ? (airQuality.band ?? undefined) : undefined}
          containerTestId="air-quality-slot"
          testId="air-quality-value"
          supportingTestId="air-quality-supporting"
        />
        <MetricColumn title="Temp" value={tempValue} />
        <MetricColumn
          title="Wind"
          value={windValue}
          valueClassName="text-[19px] font-light leading-none text-white"
          columnClassName="flex-[1.45]"
          supporting={windSupporting}
          testId="wind-value"
          supportingTestId="wind-direction"
          noWrapValue
        />
      </div>
    </>
  );

  return (
    <BottomSheet
      ariaLabel={`Selected location: ${location.name}`}
      header={header}
      expandOnSurfaceTap
    >
      {/* Karl's Read — the primary insight section. */}
      <section aria-label="Karl's Read" className="border-t border-white/10 pt-4">
        <SectionLabel>Karl&apos;s Read</SectionLabel>
        <div className="mt-3 flex items-start gap-3.5">
          <KarlLogo className="h-14 w-14 shrink-0" />
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
        <SectionLabel variant="white">Hourly Outlook</SectionLabel>
        <div className="mt-3 flex gap-5 overflow-x-auto overscroll-x-contain pb-1">
          {forecastPeriods.map((period) => (
            <ForecastPeriod
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
