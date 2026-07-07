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
  height: 64,
} as const;

export const CLEAREST_SPOT_BELL_CURVE_BASELINE_Y = 56;

export const CLEAREST_SPOT_BELL_CURVE_PEAK_Y = 6;

export const CLEAREST_SPOT_BELL_CURVE_START_X = 18;

export const CLEAREST_SPOT_BELL_CURVE_END_X = 82;

const CLEAREST_SPOT_SCORE_TO_VISUAL_X: ReadonlyArray<readonly [number, number]> = [
  [0, 18],
  [25, 32],
  [50, 50],
  [75, 68],
  [80, 72],
  [100, 82],
];

export function clearestSpotBellCurveVisualX(score: number): number {
  const clamped = clampMetricPercent(score);

  for (let index = 0; index < CLEAREST_SPOT_SCORE_TO_VISUAL_X.length - 1; index += 1) {
    const [scoreStart, visualStart] = CLEAREST_SPOT_SCORE_TO_VISUAL_X[index];
    const [scoreEnd, visualEnd] = CLEAREST_SPOT_SCORE_TO_VISUAL_X[index + 1];

    if (clamped >= scoreStart && clamped <= scoreEnd) {
      if (scoreEnd === scoreStart) {
        return visualStart;
      }

      const progress = (clamped - scoreStart) / (scoreEnd - scoreStart);
      return visualStart + progress * (visualEnd - visualStart);
    }
  }

  return CLEAREST_SPOT_SCORE_TO_VISUAL_X[CLEAREST_SPOT_SCORE_TO_VISUAL_X.length - 1][1];
}

export function clearestSpotBellCurveControlPoints(score: number): {
  peakX: number;
  peakY: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  c3x: number;
  c3y: number;
  c4x: number;
  c4y: number;
} {
  const peakX = clearestSpotBellCurveVisualX(score);
  const startX = CLEAREST_SPOT_BELL_CURVE_START_X;
  const endX = CLEAREST_SPOT_BELL_CURVE_END_X;
  const baselineY = CLEAREST_SPOT_BELL_CURVE_BASELINE_Y;
  const peakY = CLEAREST_SPOT_BELL_CURVE_PEAK_Y;
  const amplitude = baselineY - peakY;
  const peakRoundness = amplitude * 0.14;

  const leftSpan = peakX - startX;
  const rightSpan = endX - peakX;

  return {
    peakX,
    peakY,
    c1x: startX + leftSpan * 0.52,
    c1y: baselineY,
    c2x: peakX - leftSpan * 0.24,
    c2y: peakY + peakRoundness,
    c3x: peakX + rightSpan * 0.24,
    c3y: peakY + peakRoundness,
    c4x: endX - rightSpan * 0.52,
    c4y: baselineY,
  };
}

export function clearestSpotBellCurvePath(score: number): string {
  const baselineY = CLEAREST_SPOT_BELL_CURVE_BASELINE_Y;
  const { peakX, peakY, c1x, c1y, c2x, c2y, c3x, c3y, c4x, c4y } =
    clearestSpotBellCurveControlPoints(score);
  const startX = CLEAREST_SPOT_BELL_CURVE_START_X;
  const width = CLEAREST_SPOT_BELL_CURVE_VIEWBOX.width;

  return `M 0 ${baselineY} H ${startX} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${peakX} ${peakY} C ${c3x} ${c3y}, ${c4x} ${c4y}, ${width} ${baselineY}`;
}
