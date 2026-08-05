import { describe, expect, it } from 'vitest';

import {
  parseMapSelectedLocationId,
  parseMapViewMode,
} from '@/lib/map/mapRouteParams';

describe('parseMapSelectedLocationId', () => {
  it('normalizes the canonical location query param', () => {
    expect(parseMapSelectedLocationId({ location: 'Ocean-Beach-SF' })).toBe(
      'ocean-beach',
    );
  });

  it('normalizes the selected alias query param', () => {
    expect(parseMapSelectedLocationId({ selected: ' ocean-beach-sf ' })).toBe(
      'ocean-beach',
    );
  });

  it('prefers location over selected when both are present', () => {
    expect(
      parseMapSelectedLocationId({
        location: 'tiburon',
        selected: 'ocean-beach-sf',
      }),
    ).toBe('tiburon');
  });

  it('returns null for empty values', () => {
    expect(parseMapSelectedLocationId({})).toBeNull();
    expect(parseMapSelectedLocationId({ selected: '   ' })).toBeNull();
    expect(parseMapSelectedLocationId({ selected: [] })).toBeNull();
  });

  it('does not remap ambiguous bare richmond', () => {
    expect(parseMapSelectedLocationId({ selected: 'richmond' })).toBe(
      'richmond',
    );
  });
});

describe('parseMapViewMode', () => {
  it('treats list as search mode and everything else as map', () => {
    expect(parseMapViewMode('list')).toBe('list');
    expect(parseMapViewMode('map')).toBe('map');
    expect(parseMapViewMode(undefined)).toBe('map');
    expect(parseMapViewMode(['list'])).toBe('list');
  });
});
