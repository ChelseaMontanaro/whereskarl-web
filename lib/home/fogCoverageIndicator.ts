export const FOG_COVERAGE_DENSITY_MARK_COUNT = 5;

export function fogCoverageActiveMarkCount(fogCoveragePercent: number): number {
  const clamped = Math.min(100, Math.max(0, fogCoveragePercent));
  return Math.round(
    (clamped / 100) * FOG_COVERAGE_DENSITY_MARK_COUNT,
  );
}

export function fogCoverageIndicatorAriaLabel(fogCoveragePercent: number): string {
  return `Fog coverage: ${fogCoveragePercent} percent`;
}
