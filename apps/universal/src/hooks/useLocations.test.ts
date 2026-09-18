import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLocations } from '@whereskarl/api-client';
import { WEATHER_STALE_TIME_MS } from '@whereskarl/config';
import type { LocationWeather } from '@whereskarl/schemas';

import {
  __locationsCatalogTestUtils,
  __resetLocationsCacheForTests,
} from '@/hooks/useLocations';

vi.mock('@whereskarl/api-client', () => ({
  getLocations: vi.fn(),
}));

vi.mock('@/constants/config', () => ({
  getApiBaseUrl: () => 'https://api.example.test',
  isApiBaseUrlConfigured: () => true,
}));

const getLocationsMock = vi.mocked(getLocations);

function makeLocation(
  overrides: Partial<LocationWeather> = {},
): LocationWeather {
  return {
    id: 'tiburon',
    name: 'Tiburon',
    region: 'north-bay',
    latitude: 37.87,
    longitude: -122.46,
    sunshineScore: 80,
    fogScore: 20,
    temperature: 62,
    status: 'Clear skies',
    ...overrides,
  } as LocationWeather;
}

const CATALOG = [makeLocation(), makeLocation({ id: 'berkeley', name: 'Berkeley' })];

describe('useLocations catalog session', () => {
  beforeEach(() => {
    __resetLocationsCacheForTests();
    getLocationsMock.mockReset();
    getLocationsMock.mockResolvedValue({ locations: CATALOG });
  });

  it('cold first mount uses initial-loading semantics and requests getLocations', async () => {
    const cold = __locationsCatalogTestUtils.mountSnapshot();

    expect(cold.isLoading).toBe(true);
    expect(cold.locations).toEqual([]);
    expect(cold.isBlockingInitialLoad).toBe(true);
    expect(cold.shouldFetchOnMount).toBe(true);
    expect(getLocationsMock).not.toHaveBeenCalled();

    const result = await __locationsCatalogTestUtils.load(false);

    expect(result.skipped).toBe(false);
    expect(getLocationsMock).toHaveBeenCalledTimes(1);
    expect(result.next.locations).toEqual(CATALOG);
    expect(result.next.isLoading).toBe(false);
    expect(result.next.hasLiveData).toBe(true);
    expect(result.next.error).toBeNull();
  });

  it('fresh warm cache seeds usable rows and skips a duplicate GET /locations', async () => {
    await __locationsCatalogTestUtils.load(false);
    getLocationsMock.mockClear();

    const remount = __locationsCatalogTestUtils.mountSnapshot();

    expect(remount.locations).toEqual(CATALOG);
    expect(remount.isLoading).toBe(false);
    expect(remount.isBlockingInitialLoad).toBe(false);
    expect(remount.shouldFetchOnMount).toBe(false);

    const result = await __locationsCatalogTestUtils.load(false);

    expect(result.skipped).toBe(true);
    expect(result.next.locations).toEqual(CATALOG);
    expect(getLocationsMock).not.toHaveBeenCalled();
  });

  it('stale cache keeps rows visible and refreshes without clearing to []', async () => {
    await __locationsCatalogTestUtils.load(false);
    __locationsCatalogTestUtils.expire();
    getLocationsMock.mockClear();

    const nextCatalog = [makeLocation({ id: 'sausalito', name: 'Sausalito' })];
    getLocationsMock.mockResolvedValue({ locations: nextCatalog });

    const stale = __locationsCatalogTestUtils.mountSnapshot();

    expect(stale.locations).toEqual(CATALOG);
    expect(stale.isLoading).toBe(false);
    expect(stale.isBlockingInitialLoad).toBe(false);
    expect(stale.shouldFetchOnMount).toBe(true);

    const result = await __locationsCatalogTestUtils.load(false);

    expect(result.skipped).toBe(false);
    expect(getLocationsMock).toHaveBeenCalledTimes(1);
    expect(result.next.locations).toEqual(nextCatalog);
    expect(result.next.isLoading).toBe(false);
    expect(stale.locations).not.toEqual([]);
  });

  it('does not cache an error as warm and does not wipe previously usable rows', async () => {
    await __locationsCatalogTestUtils.load(false);
    getLocationsMock.mockReset();
    getLocationsMock.mockRejectedValue(new Error('network down'));

    const result = await __locationsCatalogTestUtils.load(true);

    expect(result.skipped).toBe(false);
    expect(result.next.locations).toEqual(CATALOG);
    expect(result.next.error).toBe('network down');
    expect(result.next.isLoading).toBe(false);
    expect(result.next.hasLiveData).toBe(true);

    const remount = __locationsCatalogTestUtils.mountSnapshot();

    expect(remount.locations).toEqual(CATALOG);
    expect(remount.isBlockingInitialLoad).toBe(false);
    expect(remount.shouldFetchOnMount).toBe(false);
  });

  it('does not treat an empty catalog as a warm usable source', async () => {
    getLocationsMock.mockResolvedValue({ locations: [] });

    const result = await __locationsCatalogTestUtils.load(false);

    expect(result.next.locations).toEqual([]);
    expect(result.next.hasLiveData).toBe(false);

    const remount = __locationsCatalogTestUtils.mountSnapshot();

    expect(remount.locations).toEqual([]);
    expect(remount.isLoading).toBe(true);
    expect(remount.isBlockingInitialLoad).toBe(true);
    expect(remount.shouldFetchOnMount).toBe(true);
  });

  it('refresh() still reaches the backend while the cache is otherwise fresh', async () => {
    await __locationsCatalogTestUtils.load(false);
    expect(__locationsCatalogTestUtils.mountSnapshot().shouldFetchOnMount).toBe(
      false,
    );
    expect(__locationsCatalogTestUtils.mountSnapshot().shouldFetchOnRefresh).toBe(
      true,
    );

    const refreshed = [makeLocation({ id: 'pacifica', name: 'Pacifica' })];
    getLocationsMock.mockClear();
    getLocationsMock.mockResolvedValue({ locations: refreshed });

    const result = await __locationsCatalogTestUtils.load(true);

    expect(result.skipped).toBe(false);
    expect(getLocationsMock).toHaveBeenCalledTimes(1);
    expect(result.next.locations).toEqual(refreshed);
  });

  it('treats a catalog older than WEATHER_STALE_TIME_MS as stale without emptying it', async () => {
    await __locationsCatalogTestUtils.load(false);
    expect(__locationsCatalogTestUtils.mountSnapshot().shouldFetchOnMount).toBe(
      false,
    );

    __locationsCatalogTestUtils.expire();

    const stale = __locationsCatalogTestUtils.mountSnapshot();
    expect(WEATHER_STALE_TIME_MS).toBe(10 * 60 * 1000);
    expect(stale.shouldFetchOnMount).toBe(true);
    expect(stale.locations).toEqual(CATALOG);
    expect(stale.isBlockingInitialLoad).toBe(false);
  });
});
