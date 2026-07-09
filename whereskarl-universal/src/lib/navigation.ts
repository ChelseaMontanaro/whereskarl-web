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
  {
    href: '/map',
    label: 'Find Clear Skies',
    shortLabel: 'Find Clear Skies',
  },
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

export function buildMapHref(locationId: string | null): string {
  if (locationId?.trim()) {
    return `/map?selected=${encodeURIComponent(locationId.trim())}`;
  }

  return '/map';
}
