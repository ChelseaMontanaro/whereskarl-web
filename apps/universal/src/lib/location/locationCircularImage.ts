import type { FocalPoint } from '@whereskarl/schemas';

/**
 * Derive expo-image / CSS-style content position from backend focal-point
 * fractions. Falls back to center when focal metadata is absent.
 */
export function contentPositionFromFocalPoint(
  focalPoint?: FocalPoint | null,
): { top: string; left: string } {
  if (
    !focalPoint ||
    typeof focalPoint.x !== 'number' ||
    typeof focalPoint.y !== 'number' ||
    !Number.isFinite(focalPoint.x) ||
    !Number.isFinite(focalPoint.y)
  ) {
    return { top: '50%', left: '50%' };
  }

  return {
    left: `${formatFocalPercent(focalPoint.x)}%`,
    top: `${formatFocalPercent(focalPoint.y)}%`,
  };
}

function formatFocalPercent(fraction: number): string {
  return String(Number((fraction * 100).toFixed(4)));
}
