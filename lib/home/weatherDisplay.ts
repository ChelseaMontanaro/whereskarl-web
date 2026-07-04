import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";
import type {
  BestSunshineResponse,
  CurrentResponse,
  LocationWeather,
} from "@/lib/schemas/weather";
import type { WeatherPrediction } from "@/lib/schemas/shared";
import { formatNextHourTimeCopy } from "@/lib/home/timeFormat";
import { isLocationDataDegraded } from "@/lib/weather/dataStatus";
import {
  getBestRightNowScoreLabel,
  locationQualifiesAsClearIntensity,
  resolveRawLocationFogIntensity,
  type LocationConditionInput,
} from "@/lib/map/conditions";

export type BestRightNowItem = {
  locationId: string;
  locationName: string;
  detail: string;
  score: number | null;
  scoreLabel?: string | null;
  rank: number | null;
  isDegraded?: boolean;
};

export type KarlReadPresentation = {
  headline: string;
  summary: string;
};

export const KARL_READ_GENERIC_CLEARING =
  "Some inland corridors are clearing while Karl lingers closer to the coast.";

function normalizeLocationId(locationId: string | null | undefined): string | null {
  const normalized = locationId?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function bestRightNowLocationItems(
  locations: LocationWeather[] | undefined,
  excludeLocationId: string | null | undefined,
  limit = 4,
): BestRightNowItem[] {
  if (!locations?.length) {
    return [];
  }

  const excludedId = normalizeLocationId(excludeLocationId);

  return [...locations]
    .filter((location) => normalizeLocationId(location.id) !== excludedId)
    .sort((left, right) => right.sunshineScore - left.sunshineScore)
    .slice(0, limit)
    .map((location, index) => ({
      locationId: location.id,
      locationName: location.name,
      detail:
        trimmedNonEmpty(location.karlReason) ??
        trimmedNonEmpty(location.status) ??
        "Current conditions available",
      score: location.sunshineScore,
      scoreLabel: getBestRightNowScoreLabel(location),
      rank: index + 1,
      isDegraded: isLocationDataDegraded(location.dataStatus),
    }));
}

export function foggiestKarlLocation(
  locations: LocationWeather[],
): LocationWeather | null {
  if (locations.length === 0) {
    return null;
  }

  return [...locations].sort((left, right) => {
    if (left.sunshineScore === right.sunshineScore) {
      return right.cloudCover - left.cloudCover;
    }

    return left.sunshineScore - right.sunshineScore;
  })[0];
}

export function displayLocationName(locationId: string): string {
  return locationId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const MOVEMENT_PHRASES = [
  "advancing into",
  "retreating toward",
  "drifting through",
  "spilling into",
  "hugging",
  "lingering over",
  "rolling into",
  "gathering near",
  "settling over",
  "sliding through",
] as const;

export function movementPhrase(locationId: string): string {
  const normalizedKey = locationId.trim();
  let hash = 0;

  for (let index = 0; index < normalizedKey.length; index += 1) {
    hash = (hash * 31 + normalizedKey.charCodeAt(index)) | 0;
  }

  return MOVEMENT_PHRASES[Math.abs(hash) % MOVEMENT_PHRASES.length];
}

export function heroHeadline(input: {
  current: CurrentResponse | null;
  karlLocation: LocationWeather | null;
  intelligenceFocusLocationId?: string | null;
  hasLoadedWeather: boolean;
}): string {
  if (!input.hasLoadedWeather || !input.current) {
    return "Reading Karl intelligence";
  }

  if (input.current.fogCoverage < 28) {
    return "Karl is hanging offshore.";
  }

  if (input.intelligenceFocusLocationId) {
    const name = displayLocationName(input.intelligenceFocusLocationId);
    return `Karl is ${movementPhrase(input.intelligenceFocusLocationId)} ${name}.`;
  }

  if (input.karlLocation) {
    const locationKey =
      input.karlLocation.id.trim().length > 0
        ? input.karlLocation.id
        : input.karlLocation.name;
    return `Karl is ${movementPhrase(locationKey)} ${input.karlLocation.name}.`;
  }

  return input.current.summary;
}

export function heroSubheadline(input: {
  current: CurrentResponse | null;
  karlLocation: LocationWeather | null;
  hasLoadedWeather: boolean;
}): string {
  const preferredReason = trimmedNonEmpty(input.karlLocation?.karlReason);
  if (preferredReason) {
    return preferredReason;
  }

  if (!input.hasLoadedWeather || !input.current) {
    return "Checking conditions";
  }

  const { current, karlLocation } = input;

  if (current.windSpeed >= 6) {
    return `Marine layer nearby with ${Math.round(current.windSpeed)} mph coastal wind.`;
  }

  if (karlLocation && karlLocation.cloudCover >= 70) {
    return "Fog is strongest near the shoreline right now.";
  }

  if (current.fogCoverage < 30) {
    return "Karl is lighter across most of the Bay.";
  }

  if (current.sunshineScore >= 55) {
    return "Clearing skies are developing inland.";
  }

  return current.status;
}

export function heroConfidenceText(input: {
  intelligence: KarlIntelligenceResponse | null;
  karlLocation: LocationWeather | null;
  current: CurrentResponse | null;
}): string | null {
  const narrativeLabel = trimmedNonEmpty(
    input.intelligence?.narrative.confidenceLabel,
  );
  if (narrativeLabel && narrativeLabel.toLowerCase() !== "unavailable") {
    return `${narrativeLabel} confidence`;
  }

  const label =
    trimmedNonEmpty(input.karlLocation?.confidenceLabel) ??
    trimmedNonEmpty(input.current?.confidenceLabel);
  const explanation =
    trimmedNonEmpty(input.karlLocation?.confidenceExplanation) ??
    trimmedNonEmpty(input.current?.confidenceExplanation);

  if (label && explanation) {
    return `${label} · ${explanation}`;
  }

  if (label && label.toLowerCase() !== "unavailable") {
    return label;
  }

  return null;
}

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function displayPredictionTrend(trend: string | null | undefined): string | null {
  const normalized = trimmedNonEmpty(trend)?.toLowerCase().replaceAll("_", " ");

  switch (normalized) {
    case "clearing":
    case "clearing up":
    case "improving":
      return "Clearing up";
    case "thickening":
    case "building":
    case "worsening":
      return "Fog building";
    case "holding steady":
    case "steady":
    case "holding":
    case "unchanged":
      return "Holding steady";
    case "retreating":
    case "retreat":
    case "lifting":
      return "Fog lifting";
    case "advancing":
    case "advance":
    case "spreading":
      return "Fog spreading";
    default:
      return normalized
        ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
        : null;
  }
}

export function isPredictionUnavailable(
  prediction: WeatherPrediction | null | undefined,
): boolean {
  const label = trimmedNonEmpty(prediction?.predictionConfidenceLabel);
  return label?.toLowerCase() === "unavailable";
}

export function nextHourOutlookSummary(
  prediction: WeatherPrediction | null | undefined,
): string | null {
  if (!prediction || isPredictionUnavailable(prediction)) {
    return null;
  }

  const parts: string[] = [];
  const trend = displayPredictionTrend(prediction.trend);

  if (trend) {
    parts.push(trend);
  }

  const reason = trimmedNonEmpty(prediction.predictionReason);
  if (reason) {
    parts.push(formatNextHourTimeCopy(reason));
  } else {
    const burnOff = trimmedNonEmpty(prediction.burnOffEstimateLocal);
    if (burnOff) {
      parts.push(`Burn-off around ${formatNextHourTimeCopy(burnOff)}`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function bestRightNowItems(
  intelligence: KarlIntelligenceResponse | null | undefined,
  fallbackRecommendation: BestSunshineResponse | null | undefined,
): BestRightNowItem[] {
  if (intelligence) {
    const ranked = intelligence.multiRegionRanking.bestRightNow.slice(0, 3).map(
      (item) => ({
        locationId: item.locationId,
        locationName: item.locationName,
        detail: item.explanation,
        score: item.score,
        rank: item.rank,
      }),
    );

    if (ranked.length > 0) {
      return ranked;
    }

    const destinations = intelligence.bestDestinations.destinations
      .slice()
      .sort((left, right) => {
        if (left.rank != null && right.rank != null && left.rank !== right.rank) {
          return left.rank - right.rank;
        }

        return right.score - left.score;
      })
      .slice(0, 3)
      .map((item) => ({
        locationId: item.locationId,
        locationName: item.locationName,
        detail: item.explanation,
        score: item.score,
        rank: item.rank,
      }));

    if (destinations.length > 0) {
      return destinations;
    }
  }

  if (fallbackRecommendation) {
    return [
      {
        locationId: fallbackRecommendation.locationID,
        locationName: fallbackRecommendation.locationName,
        detail:
          trimmedNonEmpty(fallbackRecommendation.recommendationReason) ??
          fallbackRecommendation.reason,
        score: fallbackRecommendation.sunshineScore,
        rank: 1,
      },
    ];
  }

  return [];
}

function isPositiveClearingStatus(clearingStatus: string): boolean {
  return clearingStatus === "clear-now" || clearingStatus === "clearing-soon";
}

function locationScoreFromWeather(
  locationId: string,
  locations: LocationWeather[] | undefined,
): number | null {
  const normalizedId = normalizeLocationId(locationId);
  if (!normalizedId || !locations?.length) {
    return null;
  }

  const match = locations.find(
    (location) => normalizeLocationId(location.id) === normalizedId,
  );

  return match?.sunshineScore ?? null;
}

function clearestSpotNarrativeLine(
  bestSunshine: BestSunshineResponse,
): string {
  return (
    trimmedNonEmpty(bestSunshine.recommendationReason) ??
    trimmedNonEmpty(bestSunshine.reason) ??
    `${bestSunshine.locationName} has the clearest conditions nearby right now.`
  );
}

function stripClearingNarrativeFromSummary(
  summary: string,
  clearingNarrative: string,
): string {
  const trimmedNarrative = clearingNarrative.trim();
  if (!trimmedNarrative) {
    return summary.trim();
  }

  if (summary.includes(trimmedNarrative)) {
    return summary.replace(trimmedNarrative, "").replace(/\s+/g, " ").trim();
  }

  return summary.trim();
}

function findSummaryClearingNarrative(intelligence: KarlIntelligenceResponse) {
  const summary = intelligence.narrative.summary;

  return intelligence.narrative.clearingNarratives.find((entry) => {
    const narrative = entry.narrative.trim();
    return narrative.length > 0 && summary.includes(narrative);
  });
}

function shouldReplaceClearingLocation(input: {
  mentionedLocationId: string;
  clearestLocationId: string;
  clearestScore: number;
  locations: LocationWeather[] | undefined;
  bestRightNow: BestRightNowItem[] | undefined;
}): boolean {
  if (
    normalizeLocationId(input.mentionedLocationId) ===
    normalizeLocationId(input.clearestLocationId)
  ) {
    return false;
  }

  const mentionedScore = locationScoreFromWeather(
    input.mentionedLocationId,
    input.locations,
  );

  if (mentionedScore != null && mentionedScore >= input.clearestScore) {
    return false;
  }

  const clearestId = normalizeLocationId(input.clearestLocationId);
  const rankedItems = input.bestRightNow ?? [];
  const mentionedRank = rankedItems.find(
    (item) => normalizeLocationId(item.locationId) === normalizeLocationId(input.mentionedLocationId),
  );
  const clearestRank = rankedItems.find(
    (item) => normalizeLocationId(item.locationId) === clearestId,
  );

  if (
    mentionedRank?.score != null &&
    clearestRank?.score != null &&
    mentionedRank.score >= clearestRank.score
  ) {
    return false;
  }

  return true;
}

export function resolveKarlReadPresentation(input: {
  intelligence: KarlIntelligenceResponse | null | undefined;
  bestSunshine: BestSunshineResponse | null | undefined;
  locations?: LocationWeather[];
  bestRightNow?: BestRightNowItem[];
}): KarlReadPresentation | null {
  if (!input.intelligence) {
    return null;
  }

  const { narrative } = input.intelligence;
  const headline = narrative.headline;
  const matchedClearing = findSummaryClearingNarrative(input.intelligence);
  const clearestLocationId = normalizeLocationId(input.bestSunshine?.locationID);

  if (!matchedClearing) {
    return {
      headline,
      summary: narrative.summary,
    };
  }

  const baseSummary = stripClearingNarrativeFromSummary(
    narrative.summary,
    matchedClearing.narrative,
  );

  if (!isPositiveClearingStatus(matchedClearing.clearingStatus)) {
    const summary =
      baseSummary.length > 0
        ? `${baseSummary} ${KARL_READ_GENERIC_CLEARING}`.trim()
        : KARL_READ_GENERIC_CLEARING;

    return { headline, summary };
  }

  if (!clearestLocationId || !input.bestSunshine) {
    const summary =
      baseSummary.length > 0
        ? `${baseSummary} ${KARL_READ_GENERIC_CLEARING}`.trim()
        : narrative.summary;

    return { headline, summary };
  }

  if (
    !shouldReplaceClearingLocation({
      mentionedLocationId: matchedClearing.locationId,
      clearestLocationId,
      clearestScore: input.bestSunshine.sunshineScore,
      locations: input.locations,
      bestRightNow: input.bestRightNow,
    })
  ) {
    return {
      headline,
      summary: narrative.summary,
    };
  }

  const summary = `${baseSummary} ${clearestSpotNarrativeLine(input.bestSunshine)}`.trim();

  return {
    headline,
    summary,
  };
}

export function sunshineResultTitle(
  sunshineScore: number,
  isNighttime: boolean,
  location?: LocationConditionInput | null,
): string {
  if (location && locationQualifiesAsClearIntensity(location)) {
    return isNighttime ? "CLEAREST NIGHT" : "BEST CLEAR SKIES";
  }

  if (location && resolveRawLocationFogIntensity(location) === "lightFog") {
    return "BEST BREAK IN THE FOG";
  }

  if (sunshineScore >= 50) {
    return isNighttime ? "CLEAREST NIGHT" : "BEST CLEAR SKIES";
  }

  if (sunshineScore >= 25) {
    return "BEST BREAK IN THE FOG";
  }

  return "NO CLEAR SKIES NEARBY";
}

export function isNighttime(hour: number): boolean {
  return hour >= 19 || hour < 6;
}
