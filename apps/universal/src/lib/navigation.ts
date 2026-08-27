import { MAP_LOCATION_ALIAS_QUERY_PARAM } from '@whereskarl/config';
import { normalizeLocationId } from '@whereskarl/search';

export type PrimaryNavItem = {
  href: '/' | '/map' | '/favorites' | '/settings';
  label: string;
  shortLabel: string;
};

export const primaryNavItems: PrimaryNavItem[] = [
  { href: '/', label: 'Home', shortLabel: 'Home' },
  { href: '/map', label: 'Map', shortLabel: 'Map' },
  { href: '/favorites', label: 'Favorites', shortLabel: 'Favorites' },
  { href: '/settings', label: 'Settings', shortLabel: 'Settings' },
];

export const bottomNavItems: PrimaryNavItem[] = [
  { href: '/', label: 'Home', shortLabel: 'Home' },
  { href: '/map', label: 'Map', shortLabel: 'Map' },
  { href: '/favorites', label: 'Favorites', shortLabel: 'Favorites' },
  { href: '/settings', label: 'Settings', shortLabel: 'Settings' },
];

export function isPrimaryNavActive(
  pathname: string,
  href: PrimaryNavItem['href'],
): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function buildMapHref(
  locationId: string | null,
  options?: { view?: 'list' | 'map' },
): string {
  const params = new URLSearchParams();
  const view = options?.view;
  if (view === 'list' || view === 'map') {
    params.set('view', view);
  }

  const canonicalId = normalizeLocationId(locationId);
  if (canonicalId) {
    params.set(MAP_LOCATION_ALIAS_QUERY_PARAM, canonicalId);
  }

  const query = params.toString();
  return query ? `/map?${query}` : '/map';
}

/** Opens Universal map search (list mode) with optional preselected location. */
export function buildMapSearchHref(locationId: string | null = null): string {
  return buildMapHref(locationId, { view: 'list' });
}
