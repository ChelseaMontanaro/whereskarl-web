import { describe, expect, it } from 'vitest';

import {
  BOTTOM_NAV_BAR_HEIGHT,
  BOTTOM_NAV_MAP_PHONE_OFFSET,
  BOTTOM_NAV_SCROLL_INSET,
} from '@/constants/bottomNav';
import { bottomNavItems } from '@/lib/navigation';

describe('shared bottom navigation sizing', () => {
  it('matches mobile-web bottom nav clearance scale', () => {
    // Home inset stays on the shared bar height. The phone map card uses a
    // larger offset: native nav content is about 74pt, plus a 12pt gap.
    expect(BOTTOM_NAV_BAR_HEIGHT).toBe(68);
    expect(BOTTOM_NAV_SCROLL_INSET).toBe(BOTTOM_NAV_BAR_HEIGHT);
    expect(BOTTOM_NAV_MAP_PHONE_OFFSET).toBe(86);
    expect(BOTTOM_NAV_MAP_PHONE_OFFSET).toBeGreaterThan(BOTTOM_NAV_BAR_HEIGHT);
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
