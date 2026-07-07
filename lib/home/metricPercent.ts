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
  height: 52,
} as const;

export const CLEAREST_SPOT_BELL_CURVE_BASELINE_Y = 44;

export function clearestSpotBellCurvePeakY(peakX: number): number {
  const clamped = clampMetricPercent(peakX);
  const edgeDistance = Math.min(clamped, 100 - clamped);
  const rise = 32 + Math.min(edgeDistance / 50, 1) * 8;
  return CLEAREST_SPOT_BELL_CURVE_BASELINE_Y - rise;
}

/** Midpoint cubic control on the right side — always beyond the peak for a smooth taper. */
export function clearestSpotBellCurveRightControlX(peakX: number): number {
  const x = clampMetricPercent(peakX);
  if (x >= 100) {
    return 100;
  }
  if (x <= 0) {
    return 50;
  }

  return x + (100 - x) * 0.5;
}

export function clearestSpotBellCurveLeftControlX(peakX: number): number {
  const x = clampMetricPercent(peakX);
  if (x <= 0) {
    return 0;
  }
  if (x >= 100) {
    return 50;
  }

  return x * 0.5;
}

export function clearestSpotBellCurvePath(peakX: number): string {
  const x = clampMetricPercent(peakX);
  const baseline = CLEAREST_SPOT_BELL_CURVE_BASELINE_Y;
  const peakY = clearestSpotBellCurvePeakY(x);

  if (x <= 0) {
    const rightMid = clearestSpotBellCurveRightControlX(x);
    return `M 0 ${peakY} C ${rightMid * 0.7} ${peakY} ${rightMid} ${baseline} 100 ${baseline}`;
  }

  if (x >= 100) {
    const leftMid = clearestSpotBellCurveLeftControlX(x);
    return `M 0 ${baseline} C ${leftMid} ${baseline} ${leftMid} ${peakY} 100 ${peakY}`;
  }

  const leftMid = clearestSpotBellCurveLeftControlX(x);
  const rightMid = clearestSpotBellCurveRightControlX(x);

  return `M 0 ${baseline} C ${leftMid} ${baseline} ${leftMid} ${peakY} ${x} ${peakY} C ${rightMid} ${peakY} ${rightMid} ${baseline} 100 ${baseline}`;
}
