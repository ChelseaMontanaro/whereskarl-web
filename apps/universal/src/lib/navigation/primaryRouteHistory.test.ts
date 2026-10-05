import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildMapHref } from '@/lib/navigation';
import {
  applyPrimaryNavigation,
  countRoutesNamed,
  decidePrimaryNavigation,
  type PrimaryRoute,
} from '@/lib/navigation/primaryRouteHistory';

const HOME: PrimaryRoute = { name: 'index' };

function mapCount(routes: PrimaryRoute[]): number {
  return countRoutesNamed(routes, 'map');
}

function walk(
  start: PrimaryRoute[],
  hrefs: string[],
): { routes: PrimaryRoute[]; maxMap: number; maxLength: number } {
  let routes = start;
  let maxMap = mapCount(routes);
  let maxLength = routes.length;

  for (const href of hrefs) {
    routes = applyPrimaryNavigation(routes, href);
    maxMap = Math.max(maxMap, mapCount(routes));
    maxLength = Math.max(maxLength, routes.length);
  }

  return { routes, maxMap, maxLength };
}

function repeat(hrefs: string[], cycles: number): string[] {
  return Array.from({ length: cycles }, () => hrefs).flat();
}

describe('primary route history', () => {
  it('selects Favorite A and then Favorite B on the same Map', () => {
    let routes = applyPrimaryNavigation([HOME, { name: 'favorites' }], buildMapHref('crissy-field'));
    expect(routes.at(-1)?.params?.selected).toBe('crissy-field');

    routes = applyPrimaryNavigation(routes, '/favorites');
    routes = applyPrimaryNavigation(routes, buildMapHref('baker-beach'));

    expect(routes.at(-1)?.name).toBe('map');
    expect(routes.at(-1)?.params?.selected).toBe('baker-beach');
    expect(mapCount(routes)).toBe(1);
  });

  it('keeps one Map across 50 Favorite selection cycles', () => {
    const ids = ['crissy-field', 'baker-beach', 'ocean-beach'];
    const hrefs = repeat(
      ids.flatMap((id) => [buildMapHref(id), '/favorites']),
      50,
    );
    const { routes, maxMap, maxLength } = walk(
      [HOME, { name: 'favorites' }],
      hrefs,
    );

    expect(maxMap).toBe(1);
    expect(maxLength).toBeLessThanOrEqual(4);
    expect(mapCount(routes)).toBe(1);
    expect(countRoutesNamed(routes, 'favorites')).toBeLessThanOrEqual(2);
    expect(routes.find((route) => route.name === 'map')?.params?.selected).toBe(
      'ocean-beach',
    );
  });

  it('does not append a Map when the same Favorite is opened again', () => {
    const hrefs = repeat([buildMapHref('crissy-field'), '/favorites'], 50);
    const { maxMap, maxLength, routes } = walk(
      [HOME, { name: 'favorites' }],
      hrefs,
    );

    expect(maxMap).toBe(1);
    expect(maxLength).toBeLessThanOrEqual(4);
    expect(routes.find((route) => route.name === 'map')?.params?.selected).toBe(
      'crissy-field',
    );
  });

  it('keeps one Map across 50 Map ↔ Favorites tab cycles', () => {
    const { routes, maxMap, maxLength } = walk(
      [HOME],
      ['/map', ...repeat(['/favorites', '/map'], 50)],
    );

    expect(maxMap).toBe(1);
    expect(maxLength).toBeLessThanOrEqual(3);
    expect(mapCount(routes)).toBe(1);
    expect(routes.at(-1)?.name).toBe('map');
  });

  it('does not append Home or Map across 50 Home ↔ Map cycles', () => {
    const { maxMap, maxLength, routes } = walk(
      [HOME],
      repeat(['/map', '/'], 50),
    );

    expect(maxMap).toBeLessThanOrEqual(1);
    expect(maxLength).toBeLessThanOrEqual(2);
    expect(countRoutesNamed(routes, 'index')).toBe(1);
    expect(routes).toEqual([HOME]);
  });

  it('does not append Favorites or Settings across 50 cycles', () => {
    const { maxLength, routes } = walk(
      [HOME],
      repeat(['/favorites', '/settings'], 50),
    );

    expect(maxLength).toBeLessThanOrEqual(3);
    expect(countRoutesNamed(routes, 'favorites')).toBeLessThanOrEqual(1);
    expect(countRoutesNamed(routes, 'settings')).toBeLessThanOrEqual(1);
    expect(routes.at(-1)?.name).toBe('settings');
  });

  it('pushes Map the first time and reuses it after that', () => {
    expect(decidePrimaryNavigation([HOME], '/map').type).toBe('push');

    const withMap = applyPrimaryNavigation([HOME], buildMapHref('crissy-field'));
    expect(decidePrimaryNavigation(withMap, buildMapHref('baker-beach')).type).toBe(
      'dismissTo',
    );
    expect(mapCount(applyPrimaryNavigation(withMap, buildMapHref('baker-beach')))).toBe(1);
  });

  it('preserves an existing Map selection when the Map tab has no query', () => {
    const withSelection = applyPrimaryNavigation(
      [HOME],
      buildMapHref('crissy-field'),
    );
    const withFavorites = applyPrimaryNavigation(withSelection, '/favorites');
    const backToMap = applyPrimaryNavigation(withFavorites, '/map');

    expect(backToMap.find((route) => route.name === 'map')?.params?.selected).toBe(
      'crissy-field',
    );
    expect(mapCount(backToMap)).toBe(1);
  });

  it('lets back leave Map for the Favorites screen underneath', () => {
    const routes = applyPrimaryNavigation(
      applyPrimaryNavigation([HOME], '/favorites'),
      buildMapHref('crissy-field'),
    );

    expect(routes.map((route) => route.name)).toEqual(['index', 'favorites', 'map']);
    expect(routes.slice(0, -1).at(-1)?.name).toBe('favorites');
    expect(routes.length).toBeGreaterThan(1);
  });

  it('does not change the Favorites storage key or buildMapHref', () => {
    const favorites = readFileSync(
      resolve(process.cwd(), 'src/lib/storage/favorites.ts'),
      'utf8',
    );
    const opener = readFileSync(
      resolve(process.cwd(), 'src/lib/navigation/openPrimaryRoute.ts'),
      'utf8',
    );

    expect(favorites).toContain(
      "const FAVORITE_LOCATION_IDS_KEY = 'wheresKarl.universal.favoriteLocationIDs'",
    );
    expect(opener).not.toContain('favoriteLocationIDs');
    expect(buildMapHref('ocean-beach-sf')).toBe('/map?selected=ocean-beach');
  });

  it('wires bottom navigation and both favorite cards through the helper', () => {
    const nav = readFileSync(
      resolve(process.cwd(), 'src/components/layout/NavLinks.tsx'),
      'utf8',
    );
    const saved = readFileSync(
      resolve(process.cwd(), 'src/components/favorites/SavedLocationCard.tsx'),
      'utf8',
    );
    const top = readFileSync(
      resolve(process.cwd(), 'src/components/favorites/TopSavedLocationCard.tsx'),
      'utf8',
    );

    expect(nav).toContain('openPrimaryRoute(item.href');
    expect(nav).not.toContain('<Link');
    expect(saved).toContain('openPrimaryRoute(buildMapHref(location.id)');
    expect(top).toContain('openPrimaryRoute(buildMapHref(location.id)');
  });
});
