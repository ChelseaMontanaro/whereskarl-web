export function clampFogCoveragePercent(fogCoveragePercent: number): number {
  return Math.min(100, Math.max(0, fogCoveragePercent));
}

export function fogCoverageSliderFillWidth(fogCoveragePercent: number): string {
  return `${clampFogCoveragePercent(fogCoveragePercent)}%`;
}

export function fogCoverageIndicatorAriaLabel(fogCoveragePercent: number): string {
  const clamped = clampFogCoveragePercent(fogCoveragePercent);
  return `Fog coverage: ${clamped} percent`;
}
