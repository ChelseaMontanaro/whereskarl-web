import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type {
  BestSunshineResponse,
  CurrentResponse,
  KarlIntelligenceResponse,
  LocationWeather,
} from '@whereskarl/schemas';

import { resolveHeroPresentation } from '@/lib/home/heroPresentation';
import {
  createHomeRefreshGuard,
  executeHomeRefresh,
  HOME_WEATHER_FRESHNESS_MS,
  homeDashboardNightPresentation,
  INITIAL_HOME_WEATHER,
  nextDueDelayMs,
  nextHomeSuccessAt,
  shouldStartHomeRefresh,
  type HomeWeatherSnapshot,
} from '@/lib/home/homeWeatherRefresh';
import {
  applyPrimaryNavigation,
  countRoutesNamed,
  type PrimaryRoute,
} from '@/lib/navigation/primaryRouteHistory';
import { WEATHER_STALE_TIME_MS } from '@whereskarl/config';

const TTL = HOME_WEATHER_FRESHNESS_MS;

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

function location(id = 'tiburon'): LocationWeather {
  return { id, name: 'Tiburon' } as LocationWeather;
}

function current(karlLocationId = 'tiburon'): CurrentResponse {
  return {
    id: 'bay-area-current',
    karlLocationId,
    temperature: 60,
    updatedAt: '2026-10-05T18:00:00.000Z',
  } as CurrentResponse;
}

function sunshine(locationID = 'crissy-field'): BestSunshineResponse {
  return { locationID, locationName: 'Crissy Field' } as BestSunshineResponse;
}

function intelligence(stabilityKey: string): KarlIntelligenceResponse {
  return {
    heroImagery: {
      stabilityKey,
      imageUrl: `https://cdn.example.test/${stabilityKey}.jpg`,
      conditionState: 'clear',
      localFallbackAsset: null,
      presentation: { timeOfDay: 'day' },
      source: 'live',
      confidenceLabel: null,
      imageKey: stabilityKey,
      focusLocationId: 'tiburon',
      fallbackReason: null,
      altText: 'Karl',
    },
    narrative: { headline: stabilityKey, summary: 'Fog is moving.' },
  } as KarlIntelligenceResponse;
}

function settledHome(): HomeWeatherSnapshot {
  return {
    ...INITIAL_HOME_WEATHER,
    isLoading: false,
    current: current(),
    locations: [location()],
    bestSunshine: sunshine(),
    intelligence: intelligence('ocean|day'),
    hasLiveData: true,
    hasLoadedCoreWeather: true,
  };
}

describe('Home weather freshness', () => {
  it('uses the canonical 10-minute weather TTL', () => {
    expect(HOME_WEATHER_FRESHNESS_MS).toBe(WEATHER_STALE_TIME_MS);
    expect(HOME_WEATHER_FRESHNESS_MS).toBe(10 * 60 * 1000);
  });

  it('does not treat a failed refresh as fresh', () => {
    expect(nextHomeSuccessAt(1_000, false, 20_000)).toBe(1_000);
    expect(nextHomeSuccessAt(null, false, 20_000)).toBeNull();
    expect(nextHomeSuccessAt(1_000, true, 20_000)).toBe(20_000);
  });

  it('skips focus and foreground inside the TTL and starts at the boundary', () => {
    expect(
      shouldStartHomeRefresh({ lastSuccessAt: 0, now: TTL - 1, inFlight: false }),
    ).toBe('skip-fresh');
    expect(
      shouldStartHomeRefresh({ lastSuccessAt: 0, now: TTL, inFlight: false }),
    ).toBe('start');
    expect(
      shouldStartHomeRefresh({ lastSuccessAt: 0, now: TTL, inFlight: true }),
    ).toBe('skip-inflight');
    expect(
      shouldStartHomeRefresh({ lastSuccessAt: null, now: 0, inFlight: false }),
    ).toBe('start');
  });

  it('schedules one due refresh and does not return a zero delay', () => {
    expect(
      nextDueDelayMs({ lastSuccessAt: 0, lastAttemptAt: 0, now: 0 }),
    ).toBe(TTL);
    expect(
      nextDueDelayMs({ lastSuccessAt: 0, lastAttemptAt: 0, now: TTL - 1 }),
    ).toBe(1);
    const afterFailure = nextDueDelayMs({
      lastSuccessAt: 0,
      lastAttemptAt: TTL,
      now: TTL,
    });
    expect(afterFailure).toBe(TTL);
    expect(afterFailure).toBeGreaterThan(0);

    let now = 0;
    let lastSuccessAt: number | null = 0;
    let lastAttemptAt: number | null = 0;
    let fetches = 0;
    let dueAt = now + nextDueDelayMs({ lastSuccessAt, lastAttemptAt, now });

    for (let step = 0; step < 30 * 60; step += 1) {
      now += 1000;
      if (now < dueAt) {
        continue;
      }
      const decision = shouldStartHomeRefresh({
        lastSuccessAt,
        now,
        inFlight: false,
      });
      expect(decision).toBe('start');
      fetches += 1;
      lastSuccessAt = nextHomeSuccessAt(lastSuccessAt, true, now);
      lastAttemptAt = now;
      dueAt = now + nextDueDelayMs({ lastSuccessAt, lastAttemptAt, now });
    }

    expect(fetches).toBe(3);
  });
});

describe('Home stale-while-refresh', () => {
  it('loads the four Home endpoints on a cold start', async () => {
    const calls: string[] = [];
    const result = await executeHomeRefresh({
      previous: INITIAL_HOME_WEATHER,
      now: new Date(2026, 9, 5, 17, 0, 0),
      getCurrent: async () => {
        calls.push('current');
        return current();
      },
      getLocations: async () => {
        calls.push('locations');
        return { locations: [location()] };
      },
      getBestSunshine: async () => {
        calls.push('best-sunshine');
        return sunshine();
      },
      getKarlIntelligence: async (locationId) => {
        calls.push(`intelligence:${locationId}`);
        return intelligence('ocean|day');
      },
    });

    expect(calls).toEqual([
      'current',
      'locations',
      'best-sunshine',
      'intelligence:tiburon',
    ]);
    expect(result.fullySuccessful).toBe(true);
    expect(result.next.intelligence?.heroImagery.stabilityKey).toBe('ocean|day');
    expect(result.isNightPresentation).toBe(false);
  });

  it('keeps the successful hero while core data is still in flight', async () => {
    const previous = settledHome();
    let coreIntelligence: HomeWeatherSnapshot['intelligence'] = null;
    const result = await executeHomeRefresh({
      previous,
      now: new Date(2026, 9, 5, 20, 30, 0),
      getCurrent: async () => current('baker-beach'),
      getLocations: async () => ({ locations: [location('baker-beach')] }),
      getBestSunshine: async () => sunshine('ocean-beach'),
      getKarlIntelligence: async () => intelligence('baker|night'),
      onCore: (core) => {
        coreIntelligence = core.intelligence;
        expect(core.intelligence).toBe(previous.intelligence);
        expect(core.isLoadingIntelligence).toBe(false);
      },
    });

    expect(coreIntelligence).toBe(previous.intelligence);
    expect(result.next.current?.karlLocationId).toBe('baker-beach');
    expect(result.next.intelligence?.heroImagery.stabilityKey).toBe('baker|night');
    expect(result.isNightPresentation).toBe(true);
  });

  it('preserves each previous success when that request fails', async () => {
    const previous = settledHome();
    const result = await executeHomeRefresh({
      previous,
      now: new Date(2026, 9, 5, 18, 0, 0),
      getCurrent: async () => {
        throw new Error('current down');
      },
      getLocations: async () => {
        throw new Error('locations down');
      },
      getBestSunshine: async () => {
        throw new Error('sunshine down');
      },
      getKarlIntelligence: async () => {
        throw new Error('intelligence down');
      },
    });

    expect(result.fullySuccessful).toBe(false);
    expect(result.next.current).toBe(previous.current);
    expect(result.next.locations).toBe(previous.locations);
    expect(result.next.bestSunshine).toBe(previous.bestSunshine);
    expect(result.next.intelligence).toBe(previous.intelligence);
    expect(nextHomeSuccessAt(5_000, result.fullySuccessful, 90_000)).toBe(5_000);
  });

  it('replaces only the endpoints that succeed', async () => {
    const previous = settledHome();
    const nextCurrent = current('ocean-beach');
    const result = await executeHomeRefresh({
      previous,
      now: new Date(2026, 9, 5, 18, 0, 0),
      getCurrent: async () => nextCurrent,
      getLocations: async () => {
        throw new Error('locations down');
      },
      getBestSunshine: async () => sunshine('baker-beach'),
      getKarlIntelligence: async () => {
        throw new Error('intelligence down');
      },
    });

    expect(result.fullySuccessful).toBe(false);
    expect(result.next.current).toBe(nextCurrent);
    expect(result.next.locations).toBe(previous.locations);
    expect(result.next.bestSunshine?.locationID).toBe('baker-beach');
    expect(result.next.intelligence).toBe(previous.intelligence);
  });

  it('lets the newer refresh win when an older one finishes last', () => {
    const guard = createHomeRefreshGuard();
    const applied: string[] = [];
    const commit = (token: number, label: string) => {
      if (!guard.isCurrent(token)) {
        return;
      }
      applied.push(label);
    };

    const older = guard.issue();
    const newer = guard.issue();
    commit(newer, 'newer');
    commit(older, 'older');

    expect(applied).toEqual(['newer']);
    expect(guard.isCurrent(older)).toBe(false);
  });

  it('keeps the same hero image key and changes it for a new identity', () => {
    const background = read('src/components/home/HomeHeroBackground.tsx');
    expect(background).toContain(
      'key={`${presentation.stabilityKey}|${imageSource}`}',
    );

    const first = resolveHeroPresentation(intelligence('ocean|day').heroImagery);
    const repeat = resolveHeroPresentation(intelligence('ocean|day').heroImagery);
    const next = resolveHeroPresentation(intelligence('baker|night').heroImagery);

    expect(`${first.stabilityKey}|remote`).toBe(`${repeat.stabilityKey}|remote`);
    expect(`${first.stabilityKey}|remote`).not.toBe(`${next.stabilityKey}|remote`);
    expect(next.imageUrl).toBe('https://cdn.example.test/baker|night.jpg');
  });

  it('updates dashboard day/night from the refresh clock', () => {
    expect(homeDashboardNightPresentation(new Date(2026, 9, 5, 17, 0, 0))).toBe(
      false,
    );
    expect(homeDashboardNightPresentation(new Date(2026, 9, 5, 20, 0, 0))).toBe(
      true,
    );
    expect(homeDashboardNightPresentation(new Date(2026, 9, 5, 5, 30, 0))).toBe(
      true,
    );
  });
});

describe('Home refresh navigation', () => {
  it('reuses Home and does not refresh on a fresh Map return', () => {
    let routes: PrimaryRoute[] = [{ name: 'index' }];
    let maxMap = 0;
    routes = applyPrimaryNavigation(routes, '/map');
    maxMap = Math.max(maxMap, countRoutesNamed(routes, 'map'));
    routes = applyPrimaryNavigation(routes, '/');
    maxMap = Math.max(maxMap, countRoutesNamed(routes, 'map'));

    expect(routes).toEqual([{ name: 'index' }]);
    expect(countRoutesNamed(routes, 'index')).toBe(1);
    expect(maxMap).toBe(1);
    expect(
      shouldStartHomeRefresh({
        lastSuccessAt: 0,
        now: 60_000,
        inFlight: false,
      }),
    ).toBe('skip-fresh');
  });

  it('reuses Home and starts a refresh after the TTL without clearing the hero first', async () => {
    let routes: PrimaryRoute[] = [{ name: 'index' }];
    routes = applyPrimaryNavigation(routes, '/map');
    routes = applyPrimaryNavigation(routes, '/');
    expect(countRoutesNamed(routes, 'index')).toBe(1);
    expect(
      shouldStartHomeRefresh({ lastSuccessAt: 0, now: TTL, inFlight: false }),
    ).toBe('start');

    const previous = settledHome();
    const result = await executeHomeRefresh({
      previous,
      now: new Date(2026, 9, 5, 18, 10, 0),
      getCurrent: async () => current(),
      getLocations: async () => ({ locations: [location()] }),
      getBestSunshine: async () => sunshine(),
      getKarlIntelligence: async () => {
        throw new Error('intelligence down');
      },
      onCore: (core) => {
        expect(core.intelligence).toBe(previous.intelligence);
      },
    });

    expect(result.next.intelligence).toBe(previous.intelligence);
  });
});

describe('Home refresh wiring', () => {
  it('keeps focus, foreground, and the due timer on one coordinator', () => {
    const hook = read('src/hooks/useHomeWeather.ts');
    const screen = read('src/app/index.tsx');

    expect(hook).toContain('useFocusEffect');
    expect(hook).toContain('AppState.addEventListener');
    expect(hook).toContain('subscription.remove()');
    expect(hook).toContain('shouldStartHomeRefresh');
    expect(hook).toContain('nextDueDelayMs');
    expect(hook).toContain('executeHomeRefresh');
    expect(hook).toContain('createHomeRefreshGuard');
    expect(hook).toContain('setTimeout');
    expect(hook).toContain('clearTimeout');
    expect(hook).not.toContain('setInterval');
    expect(hook).not.toContain('intelligence: null');
    expect(hook).not.toContain('google');
    expect(hook).not.toContain('pollen');
    expect(screen).toContain('isNightPresentation');
    expect(screen).not.toContain('isNighttime(new Date().getHours())');
  });
});
