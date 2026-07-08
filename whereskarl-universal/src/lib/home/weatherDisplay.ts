/**
 * Home presentation helpers — ported from whereskarl-web/lib/home/weatherDisplay.ts.
 * Intelligence narrative is omitted until that endpoint is wired.
 */

import type {
  BestSunshineResponse,
  CurrentResponse,
  LocationWeather,
} from '@/types/weather';

const MOVEMENT_PHRASES = [
  'advancing into',
  'retreating toward',
  'drifting through',
  'spilling into',
  'hugging',
  'lingering over',
  'rolling into',
  'gathering near',
  'settling over',
  'sliding through',
] as const;

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

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
  hasLoadedWeather: boolean;
}): string {
  if (!input.hasLoadedWeather || !input.current) {
    return 'Reading Karl intelligence';
  }

  if (input.current.fogCoverage < 28) {
    return 'Karl is hanging offshore.';
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
    return 'Checking conditions';
  }

  const { current, karlLocation } = input;

  if (current.windSpeed >= 6) {
    return `Marine layer nearby with ${Math.round(current.windSpeed)} mph coastal wind.`;
  }

  if (karlLocation && karlLocation.cloudCover >= 70) {
    return 'Fog is strongest near the shoreline right now.';
  }

  if (current.fogCoverage < 30) {
    return 'Karl is lighter across most of the Bay.';
  }

  if (current.sunshineScore >= 55) {
    return 'Clearing skies are developing inland.';
  }

  return current.status;
}

export function heroConfidenceText(input: {
  karlLocation: LocationWeather | null;
  current: CurrentResponse | null;
}): string | null {
  const label =
    trimmedNonEmpty(input.karlLocation?.confidenceLabel) ??
    trimmedNonEmpty(input.current?.confidenceLabel);
  const explanation =
    trimmedNonEmpty(input.karlLocation?.confidenceExplanation) ??
    trimmedNonEmpty(input.current?.confidenceExplanation);

  if (label && explanation) {
    return `${label} · ${explanation}`;
  }

  if (label && label.toLowerCase() !== 'unavailable') {
    return label;
  }

  return null;
}

export function bestSunshineStatus(bestSunshine: BestSunshineResponse): string {
  return (
    trimmedNonEmpty(bestSunshine.recommendationReason) ??
    trimmedNonEmpty(bestSunshine.reason) ??
    trimmedNonEmpty(bestSunshine.status) ??
    'Brightest spot nearby'
  );
}
