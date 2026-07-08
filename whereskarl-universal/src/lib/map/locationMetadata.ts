import { resolveFogScore } from '@/lib/map/locationsDisplay';
import type { LocationWeather } from '@/types/weather';

export function formatFogPercent(location: LocationWeather): string | null {
  const fogScore = resolveFogScore(location);
  if (fogScore === null) {
    return null;
  }

  return `Fog: ${fogScore}%`;
}

export function formatWind(location: LocationWeather): string | null {
  if (
    typeof location.windSpeed !== 'number' ||
    !Number.isFinite(location.windSpeed)
  ) {
    return null;
  }

  const direction = location.windDirection?.trim();
  return direction
    ? `Wind: ${direction} ${Math.round(location.windSpeed)} mph`
    : `Wind: ${Math.round(location.windSpeed)} mph`;
}

export function formatTemperature(location: LocationWeather): string | null {
  if (
    typeof location.temperature !== 'number' ||
    !Number.isFinite(location.temperature)
  ) {
    return null;
  }

  return `${Math.round(location.temperature)}°F`;
}

export function locationWeatherMetadataItems(
  location: LocationWeather,
): string[] {
  return [
    formatFogPercent(location),
    formatWind(location),
    formatTemperature(location),
  ].filter((item): item is string => Boolean(item));
}
