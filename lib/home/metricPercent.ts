export function clampMetricPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function metricPercentFillWidth(value: number): string {
  return `${clampMetricPercent(value)}%`;
}

export function fogCoverageIndicatorAriaLabel(percent: number): string {
  return `Fog coverage: ${clampMetricPercent(percent)} percent`;
}

export function clearSkiesIndicatorAriaLabel(score: number): string {
  return `Clear skies score: ${clampMetricPercent(score)} out of 100`;
}

export function clearestSpotBellCurveAriaLabel(score: number): string {
  return `Clearest spot score: ${clampMetricPercent(score)} out of 100`;
}

export const CLEAREST_SPOT_BELL_CURVE_VIEWBOX = {
  width: 100,
  height: 48,
} as const;

export const CLEAREST_SPOT_BELL_CURVE_BASELINE_Y = 42;

export function clearestSpotBellCurvePeakY(peakX: number): number {
  const clamped = clampMetricPercent(peakX);
  const edgeDistance = Math.min(clamped, 100 - clamped);
  const rise = 20 + Math.min(edgeDistance / 45, 1) * 14;
  return CLEAREST_SPOT_BELL_CURVE_BASELINE_Y - rise;
}

export function clearestSpotBellCurvePath(peakX: number): string {
  const x = clampMetricPercent(peakX);
  const peakY = clearestSpotBellCurvePeakY(x);
  const leftControl = x * 0.42;
  const rightControl = x + (100 - x) * 0.58;

  return `M 0 ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y} C ${leftControl} ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}, ${x * 0.68} ${peakY}, ${x} ${peakY} C ${x + (100 - x) * 0.32} ${peakY}, ${rightControl} ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}, 100 ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}`;
}
