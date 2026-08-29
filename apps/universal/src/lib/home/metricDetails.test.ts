import { describe, expect, it } from 'vitest';

import {
  METRIC_DETAILS,
  metricDetailAriaLabel,
} from '@/lib/home/metricDetails';

describe('metricDetails', () => {
  it('covers all four Home dashboard metrics', () => {
    expect(Object.keys(METRIC_DETAILS).sort()).toEqual([
      'air-quality',
      'clearest-spot',
      'fog-coverage',
      'sunshine-score',
    ]);
  });

  it('no longer carries the retired Karl Status metric', () => {
    expect(METRIC_DETAILS).not.toHaveProperty('karl-status');
  });

  it('keeps Fog Coverage aligned with mobile-web marine-layer meaning', () => {
    expect(METRIC_DETAILS['fog-coverage'].body).toContain("Karl's marine layer");
  });

  it('explains Air Quality as Bay-wide AQI with Map for locations', () => {
    const airQuality = METRIC_DETAILS['air-quality'];

    expect(airQuality.title).toBe('Air Quality');
    // What the number means, and that it is a Bay-wide figure.
    expect(airQuality.body).toContain('Air Quality Index');
    expect(airQuality.body).toContain('Bay Area as a whole');
    // What the classification beneath it means, using canonical band names.
    expect(airQuality.body).toContain('health category');
    expect(airQuality.body).toContain('Good');
    expect(airQuality.body).toContain('Hazardous');
    // Location-specific AQI stays on Map.
    expect(airQuality.body).toContain('Map');
  });

  it('explains Clear Skies Score with the Poor → Excellent scale', () => {
    expect(METRIC_DETAILS['sunshine-score'].body).toContain('Poor to Excellent');
    expect(METRIC_DETAILS['sunshine-score'].body).toContain('Higher scores');
  });

  it('explains Clearest Spot as the strongest clear-sky location', () => {
    expect(METRIC_DETAILS['clearest-spot'].body).toContain(
      'strongest current clear-sky location',
    );
    expect(METRIC_DETAILS['clearest-spot'].body).toContain('score');
  });

  it('builds Learn about aria labels', () => {
    expect(metricDetailAriaLabel('Air Quality')).toBe('Learn about Air Quality');
  });
});
