import { describe, expect, it } from 'vitest';

import {
  METRIC_DETAILS,
  metricDetailAriaLabel,
} from '@/lib/home/metricDetails';

describe('metricDetails', () => {
  it('covers all four Home dashboard metrics', () => {
    expect(Object.keys(METRIC_DETAILS).sort()).toEqual([
      'clearest-spot',
      'fog-coverage',
      'karl-status',
      'sunshine-score',
    ]);
  });

  it('keeps Fog Coverage aligned with mobile-web marine-layer meaning', () => {
    expect(METRIC_DETAILS['fog-coverage'].body).toContain("Karl's marine layer");
  });

  it('introduces Karl the Fog in the Karl Status explanation', () => {
    expect(METRIC_DETAILS['karl-status'].title).toBe('Karl Status');
    expect(METRIC_DETAILS['karl-status'].body).toContain('Karl the Fog');
    expect(METRIC_DETAILS['karl-status'].body).toContain('across the Bay');
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
    expect(metricDetailAriaLabel('Karl Status')).toBe('Learn about Karl Status');
  });
});
