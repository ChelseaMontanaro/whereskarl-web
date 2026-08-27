import { describe, expect, it } from 'vitest';

import { resolvePhonePortraitVisibleLabelIds } from '@/lib/map/phonePortraitMapPresentation';
import { bottomNavItems } from '@/lib/navigation';

describe('Phase 22 native map parity polish', () => {
  it('labels the bottom Map tab as Map (not Find Clear Skies)', () => {
    const mapItem = bottomNavItems.find((item) => item.href === '/map');
    expect(mapItem?.label).toBe('Map');
    expect(mapItem?.shortLabel).toBe('Map');
  });

  it('declutter keeps all candidates in catalog but hides colliding labels', () => {
    const locations = [
      {
        id: 'san-francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        sunshineScore: 80,
      },
      {
        id: 'presidio',
        latitude: 37.7989,
        longitude: -122.4662,
        sunshineScore: 70,
      },
      {
        id: 'sausalito',
        latitude: 37.8591,
        longitude: -122.4853,
        sunshineScore: 75,
      },
      {
        id: 'tiburon',
        latitude: 37.8735,
        longitude: -122.4567,
        sunshineScore: 72,
      },
      {
        id: 'berkeley',
        latitude: 37.8715,
        longitude: -122.273,
        sunshineScore: 90,
      },
    ];

    const visible = resolvePhonePortraitVisibleLabelIds(locations, null);

    // Low-zoom hidden ids stay marker-present but label-suppressed.
    expect(visible.has('presidio')).toBe(false);
    // Priority + non-colliding labels remain.
    expect(visible.has('san-francisco')).toBe(true);
    expect(visible.has('berkeley')).toBe(true);
    // Marin cluster: at most one of the close pair when both compete.
    expect(visible.has('sausalito') || visible.has('tiburon')).toBe(true);
    expect(visible.has('sausalito') && visible.has('tiburon')).toBe(false);
  });

  it('always keeps the selected location labeled', () => {
    const locations = [
      {
        id: 'presidio',
        latitude: 37.7989,
        longitude: -122.4662,
        sunshineScore: 70,
      },
      {
        id: 'san-francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        sunshineScore: 80,
      },
    ];

    const visible = resolvePhonePortraitVisibleLabelIds(locations, 'presidio');
    expect(visible.has('presidio')).toBe(true);
  });
});
