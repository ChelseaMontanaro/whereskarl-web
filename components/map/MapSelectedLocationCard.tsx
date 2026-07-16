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
import {
  formatAirQualityCompact,
  presentAirQuality,
} from "@/lib/weather/airQuality";
import {
  CLIMATE_ICON_COLOR,
  presentClimate,
} from "@/lib/weather/climate";
import { presentHumidity } from "@/lib/weather/humidity";
import { presentPollen } from "@/lib/weather/pollen";
import { presentUvIndex } from "@/lib/weather/uvIndex";
import { presentVisibility } from "@/lib/weather/visibility";
import {
  airQualityAccessibleLabel,
  compactAirQualityTileLabel,
} from "@/lib/weather/environmentalDisplay";
import {
  EnvAqiIcon,
  EnvClimateIcon,
  EnvClimateTransitionIcon,
  EnvFogCeilingIcon,
  EnvHumidityIcon,
  EnvMarineLayerIcon,
  EnvPollenIcon,
  EnvUvIcon,
  EnvVisibilityIcon,
} from "@/components/map/EnvironmentalMetricIcons";
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
 * Phone selected-location uses a two-stage bottom sheet:
 *
 * Collapsed preview (peek header):
 *   Location identity + Core Weather strip (Clear Sky Score · Fog · Temp · Wind)
 *
 * Expanded intelligence body (revealed on tap/drag):
 *   1. Environmental Metrics — 3×2 grid (AQI · UV · Pollen / Humidity · Visibility · Climate)
 *   2. Marine Layer + Fog Ceiling cards — Coming Soon
 *   3. Karl's Read
 *   4. Hourly Outlook
 *
 * Environmental tiles must not share equal flex columns with Fog/Temp/Wind —
 * those ~55px slots cannot hold long category copy. Values, colors, bands,
 * and labels come from canonical helpers — these components never derive
 * thresholds, colors, or qualitative labels themselves.
 */
/** All Core Weather titles (Clear Sky Score · Fog · Temp · Wind): identical
 * phone-compact tokens — white uppercase semibold, single-line — so the long
 * Clear Sky Score label fits at 390px without a score-only shrink or wrap. */
const METRIC_TITLE_CLASS =
  "text-[11px] font-semibold uppercase leading-none tracking-[0.04em] text-white";
/** Secondary-metric value (white unless a canonical color is set). */
const SECONDARY_VALUE_CLASS = "text-[28px] font-light leading-none text-white";
/** Neutral placeholder shown when a metric value is unavailable. */
const METRIC_VALUE_PLACEHOLDER = "\u2014";

/**
 * Shared secondary-value size for Fog, Temp, Wind, and environmental values —
 * responsive to the *rendered string length only*, never the underlying
 * classification:
 *   - "—" placeholder → 28px
 *   - ≤ 3 chars ("85%", "66°", "78", "W 8") → 23px
 *   - ≥ 4 chars ("100%", "WNW 8", "Unavailable") → 19px
 * Clear Sky Score stays the sole hero at 38px. Typography only.
 */
function compactSecondaryValueClassName(formatted: string): string {
  if (formatted === METRIC_VALUE_PLACEHOLDER) {
    return SECONDARY_VALUE_CLASS;
  }
  const size = formatted.length >= 4 ? "text-[19px]" : "text-[23px]";
  return `${size} font-light leading-none text-white`;
}
/** Title row — single line for every Core Weather title, shared baseline. */
const METRIC_TITLE_ROW_CLASS =
  "flex h-5 w-full items-end justify-center text-center leading-none";
/** Fixed value row — every value bottom-aligns here so weather columns share a
 * value baseline and the supporting labels start at the same y (44px fits the
 * 38px score without clipping). */
const METRIC_VALUE_ROW_CLASS =
  "flex h-11 w-full items-end justify-center leading-none";
/**
 * Shared supporting-label row for the weather strip. Fog supporting copy
 * ("Clear" … "Karl Territory") fits the 4-column weather budget; long EPA
 * category strings belong on the environmental metrics grid instead.
 */
const METRIC_SUPPORTING_ROW_CLASS =
  "mt-1 flex min-h-[0.9rem] items-start justify-center text-balance leading-[1.1] text-[13px] font-normal text-white";

/**
 * Supporting copy for environmental metrics. Single-line compact labels so
 * every 3-column cell stays equal height (long AQI canonical copy is shortened
 * via `compactAirQualityTileLabel`; a11y keeps the full backend label).
 * Centered to match the approved mockup tile alignment.
 */
const ENV_METRIC_SUPPORTING_CLASS =
  "mt-2 min-h-[0.95rem] w-full truncate text-center text-[11px] font-semibold leading-none text-white/55";

/**
 * Visibility compact values ("12.7 mi", 20px) sit 6px shorter than the shared
 * 26px primary-value rhythm. Extra top spacing restores the supporting-row
 * baseline without changing Visibility value typography or sibling tiles.
 */
const ENV_METRIC_SUPPORTING_AFTER_COMPACT_VALUE_CLASS =
  "mt-[14px] min-h-[0.95rem] w-full truncate text-center text-[11px] font-semibold leading-none text-white/55";

/** Environmental metric title — centered, mockup-weight presence. */
const ENV_METRIC_TITLE_CLASS =
  "w-full text-center text-[12px] font-semibold uppercase tracking-[0.06em] text-white/78";

/** Live environmental primary values — larger than weather-strip compact sizing. */
const ENV_METRIC_VALUE_CLASS =
  "text-[26px] font-light leading-none text-white";
const ENV_METRIC_VALUE_COMPACT_CLASS =
  "text-[20px] font-light leading-none text-white";

/** Unavailable value size — reserved value row so tiles stay equal height. */
const ENV_METRIC_UNAVAILABLE_VALUE_CLASS =
  "min-h-[1.625rem] text-[14px] font-normal leading-none text-white/55";

/**
 * Coming Soon labels (Marine Layer, Fog Ceiling) — quieter than live values,
 * but reserves the future primary-value row height.
 */
const ENV_COMING_SOON_VALUE_CLASS =
  "flex min-h-[1.625rem] items-center text-[12px] font-normal leading-none text-white/40";

/**
 * Climate classification labels (e.g. "Fog Belt") — word-scale, not numeric.
 * Sized to fit multi-word values in the shared tile without shrinking the grid.
 */
const ENV_CLIMATE_VALUE_CLASS =
  "min-h-[1.625rem] px-0.5 text-center text-[15px] font-medium leading-tight text-white";

/**
 * Environmental Metrics cell (inside one shared glass panel).
 * Flat metric cell — no per-tile card chrome — so the six metrics read as one
 * information block. Hierarchy: TITLE → icon → primary value → supporting.
 */
const ENV_METRIC_CELL_CLASS =
  "flex h-full min-h-[6.35rem] min-w-0 flex-col items-center px-2 py-2.5 text-center";

/** Soft panel wrapping the 3×2 Environmental Metrics block — lighter than six
 * separate cards; matches the sheet glass language without widget noise. */
const ENV_METRICS_PANEL_CLASS =
  "mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

/** Inset hairline dividers — softer (~0.07) so the panel reads as one surface;
 * inset-y/x-3 keeps lines off the rounded corners. */
const ENV_PANEL_V_DIVIDER_CLASS =
  "pointer-events-none absolute inset-y-3 w-px bg-white/[0.07]";
const ENV_PANEL_H_DIVIDER_CLASS =
  "pointer-events-none absolute inset-x-3 h-px bg-white/[0.07]";

/** Glass surface for each Marine Layer / Fog Ceiling card.
 * Compact supporting-metric height (~82px @ 390) — subordinate to Environmental Metrics. */
const MARINE_CARD_CLASS =
  "flex min-h-[5.125rem] max-h-[5.375rem] min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.125] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.28)]";

/**
 * Shared Environmental Metrics icon slot — fixed box so AQI / UV / Pollen /
 * Humidity / Visibility / Climate share one optical center without resizing glyphs.
 */
const ENV_ICON_SLOT_CLASS =
  "inline-flex h-[37px] w-[37px] shrink-0 items-center justify-center";

/**
 * Rich mockup-inspired icon identity colors (independent of live value colorTokens).
 * AQI / UV / Pollen values still use canonical `colorToken` colors.
 * Climate accents live in `CLIMATE_ICON_COLOR`.
 */
const ENV_PRESENTATION_ICON_COLOR = {
  aqi: "#3DB4FF",
  uv: "#FFD012",
  pollen: "#34D399",
  humidity: "#38BDF8",
  visibility: "#C4B5FD",
  climateUnavailable: "#94A8B8",
} as const;

/** Default ~32px icon slot. */
const ENV_ICON_CLASS = "h-8 w-8";
/** AQI waves ~15% larger than sibling icons for mockup presence. */
const ENV_AQI_ICON_CLASS = "h-[37px] w-[37px]";
/** Pollen trees matched to AQI / UV visual weight. */
const ENV_POLLEN_ICON_CLASS = "h-[37px] w-[37px]";
/** Climate glyphs — ~18% larger than the prior 34px for glanceability
 * (matches AQI / Pollen visual weight; SVG artwork unchanged). */
const ENV_CLIMATE_ICON_CLASS = "h-[40px] w-[40px]";

/** Marine Layer / Fog Ceiling — ~5% smaller than the default 32px tile icon. */
const ENV_MARINE_ICON_CLASS = "h-[30px] w-[30px] text-white/95";

/** Marine half title — left-aligned beside the icon (mockup horizontal stack). */
const MARINE_TITLE_CLASS =
  "w-full text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-white/78";

/**
 * Presentation-only soften for AQI value/supporting color (does not change
 * canonical presenters). Blends ~10% toward white for a calmer moderate orange.
 */
function softenAqiPresentationColor(color: string | undefined): string | undefined {
  if (!color || !/^#([0-9a-f]{6})$/i.test(color)) {
    return color;
  }
  const hex = color.slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const mix = 0.1;
  const to = (c: number) => Math.round(c + (255 - c) * mix);
  return `#${[to(r), to(g), to(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function envMetricLiveValueClassName(formatted: string): string {
  return formatted.length >= 5
    ? ENV_METRIC_VALUE_COMPACT_CLASS
    : ENV_METRIC_VALUE_CLASS;
}
/** Right-pointing arrow for the Wind supporting row (#F5B000 per mockup). */
function WindArrowIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M2 6h6.5L6.5 4.25 7.75 3 11 6l-3.25 3-1.25-1.25L8.5 6.75H2V6Z" />
    </svg>
  );
}

/** Gold arrow (#F5B000) + white "mph" — Wind supporting row per approved mockup. */
function WindSupportingLabel() {
  return (
    <span className="inline-flex items-center gap-0.5 text-white">
      <WindArrowIcon className="h-3 w-3 shrink-0 text-[#F5B000]" />
      <span>mph</span>
    </span>
  );
}

function MetricColumn({
  title,
  value,
  valueColor,
  titleClassName = METRIC_TITLE_CLASS,
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
  showDivider = true,
}: {
  title: ReactNode;
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
  showDivider?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 ${columnClassName} flex-col items-center text-center ${
        showDivider ? "border-r border-white/10 last:border-r-0" : ""
      }`}
      data-testid={containerTestId}
    >
      <span className={`${METRIC_TITLE_ROW_CLASS} ${titleClassName}`}>
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
      {/* Supporting labels share one baseline across weather-strip columns. */}
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

type EnvironmentalMetricProps = {
  title: string;
  /** Accessible name — keeps full canonical meaning when the tile shows a compact label. */
  ariaLabel?: string;
  /** Optional native tooltip for the full canonical supporting label. */
  titleAttr?: string;
  icon: ReactNode;
  value: ReactNode;
  valueText: string;
  valueColor?: string;
  /** Compact visible supporting label (may differ from canonical a11y label). */
  supporting?: ReactNode;
  supportingColor?: string;
  band?: string;
  unavailable?: boolean;
  /** Quieter Coming Soon presentation (Marine/Fog Ceiling); not live Unavailable. */
  comingSoon?: boolean;
  /** Word-scale Climate classification styling (not numeric compact sizing). */
  climateValue?: boolean;
  /**
   * When true, the icon slot is not aria-hidden so Climate glyphs can expose
   * their own accessible names.
   */
  exposeIconA11y?: boolean;
  /**
   * Second-row tiles (Humidity / Visibility / Climate) use a slightly looser
   * icon→value gap per approved mockup; top row stays tighter.
   */
  relaxedIconValueGap?: boolean;
  /** Optional override for the supporting-row class (Visibility compact nudge). */
  supportingClassName?: string;
  containerTestId?: string;
  testId?: string;
  supportingTestId?: string;
};

/**
 * One Environmental Metrics cell inside the shared panel.
 * Hierarchy: TITLE → icon → primary value → compact supporting label.
 * All six cells share equal min-height and internal spacing; borders are
 * applied by the parent grid so the block reads as one surface.
 */
function EnvironmentalMetricTile({
  title,
  ariaLabel,
  titleAttr,
  icon,
  value,
  valueText,
  valueColor,
  supporting,
  supportingColor,
  band,
  unavailable = false,
  comingSoon = false,
  climateValue = false,
  exposeIconA11y = false,
  relaxedIconValueGap = false,
  supportingClassName,
  containerTestId,
  testId,
  supportingTestId,
}: EnvironmentalMetricProps) {
  return (
    <div
      className={ENV_METRIC_CELL_CLASS}
      data-testid={containerTestId}
      aria-label={ariaLabel ?? title}
      title={titleAttr}
    >
      <p className={ENV_METRIC_TITLE_CLASS}>{title}</p>
      {/* Icon + value: live metrics keep top rhythm; Coming Soon placeholders
          optically center icon + label while the supporting row still anchors
          the shared bottom baseline. */}
      <div
        className={
          comingSoon
            ? "mt-1.5 flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-2"
            : `mt-1.5 flex w-full flex-col items-center ${
                relaxedIconValueGap ? "gap-2" : "gap-1.5"
              }`
        }
      >
        <span
          className={ENV_ICON_SLOT_CLASS}
          aria-hidden={exposeIconA11y ? undefined : true}
        >
          {icon}
        </span>
        <p
          className={
            comingSoon
              ? ENV_COMING_SOON_VALUE_CLASS
              : unavailable
                ? ENV_METRIC_UNAVAILABLE_VALUE_CLASS
                : climateValue
                  ? ENV_CLIMATE_VALUE_CLASS
                  : envMetricLiveValueClassName(valueText)
          }
          style={!unavailable && valueColor ? { color: valueColor } : undefined}
          data-score-band={band}
          data-testid={testId}
        >
          {value}
        </p>
      </div>
      <p
        className={supportingClassName ?? ENV_METRIC_SUPPORTING_CLASS}
        style={
          !unavailable && supportingColor ? { color: supportingColor } : undefined
        }
        data-testid={supportingTestId}
      >
        {supporting ?? "\u00A0"}
      </p>
    </div>
  );
}

/**
 * Environmental Metrics — cohesive 3×2 block in the expanded body:
 *   [AQI] [UV] [Pollen]
 *   [Humidity] [Visibility] [Climate]
 *
 * One soft glass panel with hairline dividers (Core Weather affinity) instead
 * of six separate widget cards. Presenters and hierarchy are unchanged.
 */
function EnvironmentalMetricsSection({
  metrics,
}: {
  metrics: EnvironmentalMetricProps[];
}) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-3 border-t border-white/10 pt-3"
      data-testid="selected-location-env-metrics"
      aria-label="Environmental metrics"
    >
      <SectionLabel>Environmental Metrics</SectionLabel>
      <div className={ENV_METRICS_PANEL_CLASS} data-testid="selected-location-env-panel">
        {/* Relative host so inset dividers overlay the grid without participating
            in CSS grid auto-placement (absolute children of a grid can steal
            tracks in some engines and collapse/clip the first metric row). */}
        <div className="relative" data-testid="selected-location-env-grid">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            <div className={`${ENV_PANEL_V_DIVIDER_CLASS} left-1/3`} />
            <div className={`${ENV_PANEL_V_DIVIDER_CLASS} left-2/3`} />
            <div className={`${ENV_PANEL_H_DIVIDER_CLASS} top-1/2`} />
          </div>
          <div className="relative z-[1] grid grid-cols-3 items-stretch">
            {metrics.map((metric) => (
              <EnvironmentalMetricTile key={metric.title} {...metric} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type MarinePlaceholderColumn = {
  title: string;
  ariaLabel: string;
  icon: ReactNode;
  containerTestId: string;
  testId: string;
};

/**
 * Marine Layer + Fog Ceiling cards (Coming Soon placeholders).
 * Two equal-width rounded cards with a small horizontal gap (~8px) — visually
 * distinct from the Environmental Metrics panel above (≈12px top margin).
 * Each card keeps the approved horizontal composition:
 * [ICON] title / Coming Soon — icon left, vertically centered; text left-aligned.
 * Lives in the expanded body so the collapsed peek preserves map area.
 */
function MarineFogCeilingCard({
  columns,
}: {
  columns: MarinePlaceholderColumn[];
}) {
  return (
    <div
      className="mt-3 flex w-full gap-2"
      data-testid="selected-location-marine-card"
      aria-label="Marine layer and fog ceiling"
    >
      {columns.map((column) => (
        <div
          key={column.title}
          className={MARINE_CARD_CLASS}
          data-testid={column.containerTestId}
          aria-label={column.ariaLabel}
        >
          <span
            className="inline-flex h-[30px] w-[30px] shrink-0 -translate-y-1 items-center justify-center self-center drop-shadow-[0_0_3px_rgba(255,255,255,0.16)]"
            aria-hidden
          >
            {column.icon}
          </span>
          <div className="flex min-w-0 -translate-y-1 flex-col items-start justify-center gap-1.5 self-center text-left">
            <p className={MARINE_TITLE_CLASS}>{column.title}</p>
            <p
              className="text-[12px] font-normal leading-none tracking-[0.01em] text-white/40"
              data-testid={column.testId}
            >
              Coming Soon
            </p>
          </div>
        </div>
      ))}
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
  const airQuality = presentAirQuality(location.airQuality);
  const ultraviolet = presentUvIndex(location.uvIndex);
  const pollen = presentPollen(location.pollen);
  const humidity = presentHumidity(location.humidity);
  const visibility = presentVisibility(location.visibility);
  const climate = presentClimate(location.climate);
  const fogScore = resolveFogScore(location);
  // Metrics row shows the canonical Fog Intensity label only (Clear / Light Fog
  // / Foggy / Karl Territory) — never a nighttime or forecast phrasing. The
  // nighttime "Clear Night" wording belongs to Karl's Read, not this label, so
  // we intentionally omit the isNighttime flag here.
  const fogLabel = getFogIntensityLabel(headerIntensity);
  const forecastPeriods = buildForecastPeriods(location, isNighttime);

  const subtitle = `${getProductRegionNameForLocation(location) ?? "Bay Area"}, CA`;
  const updatedLabel = relativeUpdatedLabel(location.updatedAt);

  // Wind value carries the compass direction + speed together (e.g. "NW 8",
  // "WSW 12"); the supporting row is the gold arrow + "mph". Wind shares the
  // same length-responsive secondary value system as Fog and Temp.
  const hasWindSpeed =
    typeof location.windSpeed === "number" &&
    Number.isFinite(location.windSpeed);
  const windDirection = location.windDirection?.trim();
  const windValue = hasWindSpeed
    ? windDirection
      ? `${windDirection} ${Math.round(location.windSpeed)}`
      : `${Math.round(location.windSpeed)}`
    : METRIC_VALUE_PLACEHOLDER;
  const windSupporting: ReactNode = hasWindSpeed ? (
    <WindSupportingLabel />
  ) : undefined;
  const fogValue = fogScore !== null ? `${fogScore}%` : METRIC_VALUE_PLACEHOLDER;
  const tempValue =
    typeof location.temperature === "number" &&
    Number.isFinite(location.temperature)
      ? `${Math.round(location.temperature)}°`
      : METRIC_VALUE_PLACEHOLDER;
  const aqiValueText = airQuality.available
    ? String(airQuality.aqi)
    : "Unavailable";
  const uvValueText = ultraviolet.available
    ? String(ultraviolet.value)
    : "Unavailable";
  const pollenValueText = pollen.available
    ? String(pollen.value)
    : "Unavailable";

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
      <div className="flex items-start gap-3.5">
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
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-white/[0.18] via-white/[0.06] to-transparent text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <span className="px-1 text-[0.5625rem] font-semibold leading-[1.05] tracking-tight text-white/70">
            Location Image
          </span>
          <span className="text-[0.5rem] font-medium uppercase leading-[1.05] tracking-[0.08em] text-white/45">
            Coming Soon
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[1.375rem] font-semibold leading-tight tracking-tight text-white">
            {location.name}
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-[0.9375rem] leading-tight text-white/65">
            <LocationPinIcon className="h-3.5 w-3.5 shrink-0 text-white/45" />
            <span className="truncate">{subtitle}</span>
          </p>
          <p className="mt-0.5 text-[0.75rem] leading-tight text-white/45">
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

      {/* Core Weather strip (collapsed peek): Score / Fog / Temp / Wind.
          Expanded intelligence (Environmental Metrics onward) lives in the
          sheet body so the preview stays compact. */}
      <div
        className="mt-3 flex items-stretch gap-0 border-t border-white/10 pt-3"
        data-testid="selected-location-metrics"
      >
        <MetricColumn
          title="Clear Sky Score"
          titleClassName={`whitespace-nowrap ${METRIC_TITLE_CLASS}`}
          columnClassName="min-w-0 flex-[2.2] px-1"
          value={score.score}
          valueColor={score.color}
          valueClassName="text-[38px] font-semibold"
          supporting={score.qualityLabel}
          supportingColor={score.color}
          supportingClassName={`${METRIC_SUPPORTING_ROW_CLASS} text-[14px] font-semibold`}
          band={score.band}
          testId="clear-skies-score"
          supportingTestId="clear-skies-quality"
        />
        <MetricColumn
          title="Fog"
          columnClassName="min-w-0 flex-[1.25] px-1"
          value={fogValue}
          valueClassName={compactSecondaryValueClassName(fogValue)}
          testId="fog-value"
          supporting={fogLabel}
        />
        <MetricColumn
          title="Temp"
          columnClassName="min-w-0 flex-1 px-1"
          value={tempValue}
          valueClassName={compactSecondaryValueClassName(tempValue)}
          testId="temp-value"
        />
        <MetricColumn
          title="Wind"
          value={windValue}
          valueClassName={compactSecondaryValueClassName(windValue)}
          columnClassName="min-w-0 flex-[1.25] px-1"
          supporting={windSupporting}
          testId="wind-value"
          supportingTestId="wind-direction"
          noWrapValue
          showDivider={false}
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
      {/* Expanded intelligence — identical ordering/styling below Core Weather. */}
      <EnvironmentalMetricsSection
        metrics={[
          {
            title: "AQI",
            ariaLabel: airQualityAccessibleLabel(airQuality),
            titleAttr: airQuality.available ? airQuality.label : undefined,
            icon: (
              <span style={{ color: ENV_PRESENTATION_ICON_COLOR.aqi }}>
                <EnvAqiIcon className={ENV_AQI_ICON_CLASS} />
              </span>
            ),
            value: airQuality.available ? airQuality.aqi : "Unavailable",
            valueText: aqiValueText,
            valueColor: airQuality.available
              ? softenAqiPresentationColor(airQuality.color ?? undefined)
              : undefined,
            supporting: airQuality.available
              ? compactAirQualityTileLabel(airQuality)
              : undefined,
            supportingColor: airQuality.available
              ? softenAqiPresentationColor(airQuality.color ?? undefined)
              : undefined,
            band: airQuality.available
              ? (airQuality.category ?? undefined)
              : undefined,
            unavailable: !airQuality.available,
            containerTestId: "air-quality-slot",
            testId: "air-quality-value",
            supportingTestId: "air-quality-supporting",
          },
          {
            title: "UV",
            ariaLabel: ultraviolet.available
              ? `UV, ${ultraviolet.value}, ${ultraviolet.label}`
              : "UV, Unavailable",
            icon: (
              <span style={{ color: ENV_PRESENTATION_ICON_COLOR.uv }}>
                <EnvUvIcon className={ENV_ICON_CLASS} />
              </span>
            ),
            value: ultraviolet.available ? ultraviolet.value : "Unavailable",
            valueText: uvValueText,
            valueColor: ultraviolet.available
              ? (ultraviolet.color ?? undefined)
              : undefined,
            supporting: ultraviolet.available ? ultraviolet.label : undefined,
            supportingColor: ultraviolet.available
              ? (ultraviolet.color ?? undefined)
              : undefined,
            band: ultraviolet.available
              ? (ultraviolet.category ?? undefined)
              : undefined,
            unavailable: !ultraviolet.available,
            containerTestId: "uv-index-slot",
            testId: "uv-index-value",
            supportingTestId: "uv-index-supporting",
          },
          {
            title: "Pollen",
            ariaLabel: pollen.available
              ? `Pollen, ${pollen.value}, ${pollen.label}`
              : "Pollen, Unavailable",
            icon: (
              <span style={{ color: ENV_PRESENTATION_ICON_COLOR.pollen }}>
                <EnvPollenIcon className={ENV_POLLEN_ICON_CLASS} />
              </span>
            ),
            value: pollen.available ? pollen.value : "Unavailable",
            valueText: pollenValueText,
            valueColor: pollen.available
              ? (pollen.color ?? undefined)
              : undefined,
            supporting: pollen.available ? pollen.label : undefined,
            supportingColor: pollen.available
              ? (pollen.color ?? undefined)
              : undefined,
            band: pollen.available ? (pollen.category ?? undefined) : undefined,
            unavailable: !pollen.available,
            containerTestId: "pollen-slot",
            testId: "pollen-value",
            supportingTestId: "pollen-supporting",
          },
          {
            title: "Humidity",
            ariaLabel: humidity.available
              ? `Humidity, ${humidity.formatted}, ${humidity.label}`
              : "Humidity, Unavailable",
            icon: (
              <span style={{ color: ENV_PRESENTATION_ICON_COLOR.humidity }}>
                <EnvHumidityIcon className={ENV_ICON_CLASS} />
              </span>
            ),
            value: humidity.formatted,
            valueText: humidity.formatted,
            unavailable: !humidity.available,
            supporting: humidity.available ? humidity.label : undefined,
            relaxedIconValueGap: true,
            containerTestId: "humidity-slot",
            testId: "humidity-value",
            supportingTestId: "humidity-supporting",
          },
          {
            title: "Visibility",
            ariaLabel: visibility.available
              ? `Visibility, ${visibility.formatted}, ${visibility.label}`
              : "Visibility, Unavailable",
            icon: (
              <span style={{ color: ENV_PRESENTATION_ICON_COLOR.visibility }}>
                <EnvVisibilityIcon className={ENV_ICON_CLASS} />
              </span>
            ),
            value: visibility.formatted,
            valueText: visibility.formatted,
            unavailable: !visibility.available,
            supporting: visibility.available ? visibility.label : undefined,
            // Compact miles ("12.7 mi") use 20px type; +6px top spacing keeps
            // the footer on the shared Environmental Metrics baseline.
            supportingClassName:
              visibility.available && visibility.formatted.length >= 5
                ? ENV_METRIC_SUPPORTING_AFTER_COMPACT_VALUE_CLASS
                : undefined,
            relaxedIconValueGap: true,
            containerTestId: "visibility-slot",
            testId: "visibility-value",
            supportingTestId: "visibility-supporting",
          },
          {
            title: "Climate",
            ariaLabel: climate.available
              ? `Climate, ${climate.formatted}, ${climate.label}`
              : "Climate, Unavailable",
            icon: (
              <span
                style={{
                  color: climate.available
                    ? CLIMATE_ICON_COLOR[climate.value!]
                    : ENV_PRESENTATION_ICON_COLOR.climateUnavailable,
                }}
              >
                {climate.available && climate.value ? (
                  <EnvClimateIcon
                    climate={climate.value}
                    className={ENV_CLIMATE_ICON_CLASS}
                    title={climate.iconLabel}
                  />
                ) : (
                  <EnvClimateTransitionIcon
                    className={ENV_CLIMATE_ICON_CLASS}
                    title={climate.iconLabel}
                  />
                )}
              </span>
            ),
            value: climate.formatted,
            valueText: climate.formatted,
            unavailable: !climate.available,
            climateValue: climate.available,
            supporting: climate.available ? climate.label : undefined,
            supportingColor: climate.available
              ? CLIMATE_ICON_COLOR[climate.value!]
              : undefined,
            exposeIconA11y: true,
            relaxedIconValueGap: true,
            containerTestId: "climate-slot",
            testId: "climate-value",
            supportingTestId: "climate-supporting",
          },
        ]}
      />

      <MarineFogCeilingCard
        columns={[
          {
            title: "Marine Layer",
            ariaLabel: "Marine Layer height, Coming Soon",
            icon: <EnvMarineLayerIcon className={ENV_MARINE_ICON_CLASS} />,
            containerTestId: "marine-layer-slot",
            testId: "marine-layer-value",
          },
          {
            title: "Fog Ceiling",
            ariaLabel: "Fog Ceiling height, Coming Soon",
            icon: <EnvFogCeilingIcon className={ENV_MARINE_ICON_CLASS} />,
            containerTestId: "fog-ceiling-slot",
            testId: "fog-ceiling-value",
          },
        ]}
      />

      {/* Karl's Read — the primary insight section. */}
      <section aria-label="Karl's Read" className="mt-4 border-t border-white/10 pt-4">
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
        className="mt-4 border-t border-white/10 pt-4"
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
  const airQuality = presentAirQuality(location.airQuality);
  const airQualityCompact = formatAirQualityCompact(airQuality);

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

          {/* Product decision (not a technical limit): desktop/tablet keep the
              compact AQI chip only for now. UV and pollen ship first on phone
              Selected Location's environmental grid; desktop/tablet UV/pollen
              are separate roadmap layout items so we don't bolt them onto this
              dense chip. */}
          <p
            className="mt-1 line-clamp-2 text-[0.65rem] font-medium leading-snug"
            data-testid="desktop-air-quality"
            data-aqi-category={
              airQuality.available ? airQuality.category ?? undefined : undefined
            }
            style={
              airQuality.available && airQuality.color
                ? { color: airQuality.color }
                : { color: "rgba(255,255,255,0.48)" }
            }
          >
            AQI {airQualityCompact}
          </p>
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
