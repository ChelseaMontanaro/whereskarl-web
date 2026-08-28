import { clampMetricPercent } from '@/lib/home/metricPercent';

export function clearestSpotMeterAriaLabel(score: number): string {
  return `Clearest spot score: ${clampMetricPercent(score)} out of 100`;
}

/** Horizontal bead position along the LOW → BEST track (0–100%). */
export function clearestSpotMeterFillPercent(score: number): number {
  return clampMetricPercent(score);
}
