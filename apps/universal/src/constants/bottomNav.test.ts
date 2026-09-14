import { describe, expect, it } from 'vitest';

import {
  BOTTOM_NAV_BAR_HEIGHT,
  BOTTOM_NAV_MAP_PHONE_OFFSET,
  BOTTOM_NAV_SCROLL_INSET,
} from '@/constants/bottomNav';
import { bottomNavItems } from '@/lib/navigation';

describe('shared bottom navigation sizing', () => {
  it('matches mobile-web bottom nav clearance scale', () => {
    // Web home clearance ~4.25rem; map sheet clearance ~4.75rem.
    expect(BOTTOM_NAV_BAR_HEIGHT).toBe(68);
    expect(BOTTOM_NAV_SCROLL_INSET).toBe(BOTTOM_NAV_BAR_HEIGHT);
    expect(BOTTOM_NAV_MAP_PHONE_OFFSET).toBe(76);
  });

  it('preserves Universal tab names and routes', () => {
    expect(bottomNavItems.map((item) => item.shortLabel)).toEqual([
      'Home',
      'Map',
      'Favorites',
      'Settings',
    ]);
    expect(bottomNavItems.map((item) => item.href)).toEqual([
      '/',
      '/map',
      '/favorites',
      '/settings',
    ]);
  });
});
