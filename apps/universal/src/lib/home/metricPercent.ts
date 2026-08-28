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
