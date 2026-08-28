import { describe, expect, it } from 'vitest';

import {
  clearestSpotMeterAriaLabel,
  clearestSpotMeterFillPercent,
} from '@/lib/home/clearestSpotMeter';

describe('clearestSpotMeter', () => {
  it('builds the accessibility label', () => {
    expect(clearestSpotMeterAriaLabel(60)).toBe(
      'Clearest spot score: 60 out of 100',
    );
    expect(clearestSpotMeterAriaLabel(140)).toBe(
      'Clearest spot score: 100 out of 100',
    );
  });

  it.each([
    [0, 0],
    [25, 25],
    [60, 60],
    [100, 100],
    [-5, 0],
    [140, 100],
  ])('maps score %i to horizontal fill percent %i', (score, expected) => {
    expect(clearestSpotMeterFillPercent(score)).toBe(expected);
  });

  it('positions mid and high scores toward Best (right)', () => {
    expect(clearestSpotMeterFillPercent(50)).toBe(50);
    expect(clearestSpotMeterFillPercent(80)).toBeGreaterThan(50);
  });
});
