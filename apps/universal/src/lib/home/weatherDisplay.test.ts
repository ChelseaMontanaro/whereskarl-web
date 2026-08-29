import { describe, expect, it } from 'vitest';

import {
  HERO_CDN_BASE,
  resolveHeroImageUrls,
  resolveLocalFallbackImageUrl,
} from '@/lib/home/heroAssets';
import {
  activeHeroImageUrl,
  resolveHeroPresentation,
  selectHeroImageSource,
} from '@/lib/home/heroPresentation';
import {
  bestRightNowItems,
  enrichBestRightNowItemsWithLocationWeather,
  foggiestKarlLocation,
  formatUpdatedAt,
  heroConfidenceText,
  heroHeadline,
  isNighttime,
  nextHourOutlookSummary,
  resolveKarlLocation,
  resolveKarlStatusPhrase,
} from '@/lib/home/weatherDisplay';
import type {
  BestSunshineResponse,
  CurrentResponse,
  KarlIntelligenceResponse,
  LocationWeather,
} from '@whereskarl/schemas';

function makeLocation(
  overrides: Partial<LocationWeather> & Pick<LocationWeather, 'id' | 'name'>,
): LocationWeather {
  const { id, name, ...rest } = overrides;
  return {
    id,
    name,
    region: 'san-francisco',
    latitude: 37.7,
    longitude: -122.4,
    temperature: 60,
    feelsLike: 58,
    humidity: 70,
    windSpeed: 8,
    windDirection: 'W',
    cloudCover: 80,
    visibility: 4,
    sunshineScore: 20,
    fogScore: 80,
    status: 'Foggy',
    karlReason: null,
    confidenceLabel: 'High',
    confidenceExplanation: null,
    distanceText: '2 mi',
    imageUrl: null,
    focalPoint: null,
    localFallbackAsset: null,
    prediction: null,
    airQuality: {
      aqi: 40,
      category: 'good',
      label: 'Good',
      isAvailable: true,
    },
    uvIndex: {
      value: 3,
      category: 'moderate',
      label: 'Moderate',
      isAvailable: true,
    },
    ...rest,
  } as LocationWeather;
}

describe('home weatherDisplay', () => {
  it('picks the foggiest location by lowest sunshine score', () => {
    const foggiest = foggiestKarlLocation([
      makeLocation({ id: 'a', name: 'A', sunshineScore: 40, cloudCover: 50 }),
      makeLocation({ id: 'b', name: 'B', sunshineScore: 15, cloudCover: 90 }),
    ]);
    expect(foggiest?.id).toBe('b');
  });

  /**
   * Karl used to jump between locations on every refresh because the client
   * ranked by lowest `sunshineScore` while `/current` ranked by highest
   * `fogScore`, and coastal pins tie on both client keys during a uniform
   * marine layer. `/current.karlLocationId` is now authoritative.
   */
  describe('canonical Karl position', () => {
    const locations = [
      makeLocation({ id: 'ocean-beach', name: 'Ocean Beach', sunshineScore: 56, cloudCover: 41 }),
      makeLocation({ id: 'lands-end', name: 'Lands End', sunshineScore: 56, cloudCover: 41 }),
      makeLocation({ id: 'moss-beach', name: 'Moss Beach', sunshineScore: 26, cloudCover: 55 }),
    ];

    it('follows /current.karlLocationId instead of re-ranking locally', () => {
      const current = { karlLocationId: 'lands-end' } as CurrentResponse;

      expect(resolveKarlLocation(current, locations)?.id).toBe('lands-end');
      // The local heuristic would have said moss-beach.
      expect(foggiestKarlLocation(locations)?.id).toBe('moss-beach');
    });

    it('is stable across refetches while the backend id is stable', () => {
      const current = { karlLocationId: 'ocean-beach' } as CurrentResponse;
      const reordered = [...locations].reverse();

      // Array order no longer decides the winner among tied pins.
      expect(resolveKarlLocation(current, locations)?.id).toBe('ocean-beach');
      expect(resolveKarlLocation(current, reordered)?.id).toBe('ocean-beach');
    });

    it('falls back to the local heuristic only when the id is absent or unknown', () => {
      expect(resolveKarlLocation(null, locations)?.id).toBe('moss-beach');
      expect(
        resolveKarlLocation({} as CurrentResponse, locations)?.id,
      ).toBe('moss-beach');
      expect(
        resolveKarlLocation(
          { karlLocationId: 'not-in-catalog' } as CurrentResponse,
          locations,
        )?.id,
      ).toBe('moss-beach');
    });
  });

  it('builds offshore headline when fog coverage is low', () => {
    const headline = heroHeadline({
      current: { fogCoverage: 10 } as CurrentResponse,
      karlLocation: makeLocation({ id: 'el-granada', name: 'El Granada' }),
      hasLoadedWeather: true,
    });
    expect(headline).toBe('Karl is hanging offshore.');
  });

  it('prefers intelligence narrative for confidence text', () => {
    const text = heroConfidenceText({
      intelligence: {
        narrative: { confidenceLabel: 'High' },
      } as KarlIntelligenceResponse,
      karlLocation: null,
      current: null,
    });
    expect(text).toBe('High confidence');
  });

  it('formats updated timestamps in Pacific time', () => {
    expect(formatUpdatedAt('not-a-date')).toBe('Updated recently');
    expect(formatUpdatedAt('2026-08-28T16:00:00.000Z')).toMatch(/2026/);
  });

  it('resolves karl status from intelligence headline first', () => {
    const phrase = resolveKarlStatusPhrase({
      current: { status: 'Karl is here' } as CurrentResponse,
      intelligence: {
        narrative: {
          headline: 'Karl is picking favorites',
          movementNarrative: null,
        },
      } as KarlIntelligenceResponse,
    });
    expect(phrase).toBe('Karl is picking favorites');
  });

  it('falls back best-right-now to best sunshine', () => {
    const items = bestRightNowItems(null, {
      locationID: 'dolores-park',
      locationName: 'Dolores Park',
      sunshineScore: 71,
      recommendationReason: 'Clearest nearby',
      reason: 'Clear',
    } as BestSunshineResponse);
    expect(items).toHaveLength(1);
    expect(items[0]?.locationId).toBe('dolores-park');
  });

  it('enriches best-right-now with fog/wind/temp metadata', () => {
    const enriched = enrichBestRightNowItemsWithLocationWeather(
      [
        {
          locationId: 'dolores-park',
          locationName: 'Dolores Park',
          detail: 'Clearing',
          score: 65,
          rank: 1,
        },
      ],
      [
        makeLocation({
          id: 'dolores-park',
          name: 'Dolores Park',
          fogScore: 26,
          sunshineScore: 65,
          windSpeed: 7,
          windDirection: 'W',
          temperature: 72,
        }),
      ],
    );
    expect(enriched[0]?.weatherMetadata).toEqual([
      'Fog: 26%',
      'Wind: W 7 mph',
      '72°F',
    ]);
  });

  it('hides next-hour summary when confidence is unavailable', () => {
    expect(
      nextHourOutlookSummary({
        trend: 'holding',
        predictionReason: 'Steady',
        burnOffEstimateLocal: null,
        predictionConfidenceLabel: 'Unavailable',
      }),
    ).toBeNull();
  });

  it('detects nighttime hours', () => {
    expect(isNighttime(20)).toBe(true);
    expect(isNighttime(12)).toBe(false);
  });
});

describe('home hero presentation', () => {
  it('resolves CDN fallback URLs from localFallbackAsset', () => {
    expect(resolveLocalFallbackImageUrl('hero_fog', 'day')).toBe(
      `${HERO_CDN_BASE}/hero/ocean-beach/day.png`,
    );
  });

  it('prefers remote imageUrl and keeps local fallback', () => {
    const urls = resolveHeroImageUrls({
      conditionState: 'mixed-bay',
      stabilityKey: 'test',
      imageUrl: 'https://cdn.example.com/hero.png',
      localFallbackAsset: 'hero_mixed',
      imageKey: null,
      focusLocationId: null,
      sceneId: null,
      sceneName: null,
      timeOfDay: 'day',
      daypart: null,
      colorGrade: null,
      baseVariant: null,
      altText: 'Hero',
      fallbackReason: null,
      presentation: null,
    } as Parameters<typeof resolveHeroImageUrls>[0]);

    expect(urls.imageUrl).toBe('https://cdn.example.com/hero.png');
    expect(urls.fallbackImageUrl).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
  });

  it('selects remote then local-fallback then gradient', () => {
    const presentation = resolveHeroPresentation({
      conditionState: 'clear',
      stabilityKey: 'clear|day',
      imageUrl: 'https://cdn.example.com/a.png',
      localFallbackAsset: 'hero_clearing',
      imageKey: null,
      focusLocationId: null,
      sceneId: null,
      sceneName: null,
      timeOfDay: 'day',
      daypart: null,
      colorGrade: null,
      baseVariant: null,
      altText: null,
      fallbackReason: null,
      presentation: {
        atmosphereTopOpacity: 0.1,
        atmosphereBottomOpacity: 0.2,
        bottomGradientLeadOpacity: 0.3,
        bottomGradientMidOpacity: 0.4,
      },
    } as Parameters<typeof resolveHeroPresentation>[0]);

    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        fallbackImageUrl: presentation.fallbackImageUrl,
      }),
    ).toBe('remote');
    expect(activeHeroImageUrl(presentation, 'remote')).toBe(
      presentation.imageUrl,
    );
    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        fallbackImageUrl: presentation.fallbackImageUrl,
        remoteLoadFailed: true,
      }),
    ).toBe('local-fallback');
  });
});
