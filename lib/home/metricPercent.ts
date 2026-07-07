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

export function clearestSpotBellCurvePeakY(peakX: number): number {
  const clamped = clampMetricPercent(peakX);
  const edgeDistance = Math.min(clamped, 100 - clamped);
  const peakHeight = 5 + Math.min(edgeDistance / 100, 0.35) * 4;
  return 20 - peakHeight;
}

export function clearestSpotBellCurvePath(peakX: number): string {
  const x = clampMetricPercent(peakX);
  const peakY = clearestSpotBellCurvePeakY(x);
  const leftControl = x * 0.45;
  const rightControl = x + (100 - x) * 0.55;

  return `M 0 20 C ${leftControl} 20, ${x * 0.72} ${peakY}, ${x} ${peakY} C ${x + (100 - x) * 0.28} ${peakY}, ${rightControl} 20, 100 20`;
}
