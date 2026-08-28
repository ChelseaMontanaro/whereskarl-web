import { describe, expect, it } from 'vitest';

import {
  PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS,
  PHONE_PORTRAIT_APPLE_LOGO_INSETS,
  resolvePhonePortraitMarkerPresentation,
  resolvePhonePortraitVisibleMetaIds,
} from '@/lib/map/phonePortraitMapPresentation';
import { bottomNavItems } from '@/lib/navigation';

describe('Phase 22 native map parity polish', () => {
  it('labels the bottom Map tab as Map (not Find Clear Skies)', () => {
    const mapItem = bottomNavItems.find((item) => item.href === '/map');
    expect(mapItem?.label).toBe('Map');
    expect(mapItem?.shortLabel).toBe('Map');
  });

  it('declutter keeps all candidates on the map but thins colliding meta', () => {
    const locations = [
      {
        id: 'san-francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        sunshineScore: 80,
        region: 'san-francisco',
      },
      {
        id: 'presidio',
        latitude: 37.7989,
        longitude: -122.4662,
        sunshineScore: 70,
        region: 'san-francisco',
      },
      {
        id: 'sausalito',
        latitude: 37.8591,
        longitude: -122.4853,
        sunshineScore: 75,
        region: 'north-bay',
      },
      {
        id: 'tiburon',
        latitude: 37.8735,
        longitude: -122.4567,
        sunshineScore: 72,
        region: 'north-bay',
      },
      {
        id: 'berkeley',
        latitude: 37.8715,
        longitude: -122.273,
        sunshineScore: 90,
        region: 'east-bay',
      },
    ];

    const presentation = resolvePhonePortraitMarkerPresentation(locations, null);
    const visible = resolvePhonePortraitVisibleMetaIds(locations, null);

    // Low-zoom coastal ids stay icon-present but meta-suppressed.
    expect(presentation.get('presidio')).toBe('icon-only');
    expect(visible.has('presidio')).toBe(false);
    // Priority + non-colliding meta remain.
    expect(visible.has('san-francisco')).toBe(true);
    expect(visible.has('berkeley')).toBe(true);
    // Marin cluster: at most one of the close pair when both compete.
    expect(visible.has('sausalito') || visible.has('tiburon')).toBe(true);
    expect(visible.has('sausalito') && visible.has('tiburon')).toBe(false);
  });

  it('always keeps the selected location meta-visible', () => {
    const locations = [
      {
        id: 'presidio',
        latitude: 37.7989,
        longitude: -122.4662,
        sunshineScore: 70,
        region: 'san-francisco',
      },
      {
        id: 'san-francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        sunshineScore: 80,
        region: 'san-francisco',
      },
    ];

    const visible = resolvePhonePortraitVisibleMetaIds(locations, 'presidio');
    expect(visible.has('presidio')).toBe(true);
  });

  it('promotes one regional anchor per product region for readable labels', () => {
    const locations = [
      {
        id: 'mill-valley',
        latitude: 37.906,
        longitude: -122.545,
        sunshineScore: 65,
        region: 'north-bay',
      },
      {
        id: 'sausalito',
        latitude: 37.8591,
        longitude: -122.4853,
        sunshineScore: 75,
        region: 'north-bay',
      },
      {
        id: 'san-francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        sunshineScore: 80,
        region: 'san-francisco',
      },
    ];

    const visible = resolvePhonePortraitVisibleMetaIds(locations, null);
    expect(visible.has('san-francisco')).toBe(true);
    expect(visible.has('sausalito') || visible.has('mill-valley')).toBe(true);
  });

  it('exposes supported Apple Maps legal/logo insets for phone portrait', () => {
    // Non-zero required: react-native-maps treats 0 as unset.
    expect(PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS.bottom).toBeGreaterThan(0);
    expect(PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS.left).toBeGreaterThan(0);
    expect(PHONE_PORTRAIT_APPLE_LOGO_INSETS.bottom).toBeGreaterThan(0);
    expect(PHONE_PORTRAIT_APPLE_LOGO_INSETS.right).toBeGreaterThan(0);
  });
});
