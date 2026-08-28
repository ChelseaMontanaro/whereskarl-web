import { clampMetricPercent } from "@/lib/home/metricPercent";

export function clearestSpotGaugeAriaLabel(score: number): string {
  return `Clearest spot score: ${clampMetricPercent(score)} out of 100`;
}

export const CLEAREST_SPOT_GAUGE_VIEWBOX = {
  width: 100,
  height: 56,
} as const;

export const CLEAREST_SPOT_GAUGE_CENTER_X = 50;

export const CLEAREST_SPOT_GAUGE_CENTER_Y = 44;

export const CLEAREST_SPOT_GAUGE_RADIUS = 34;

export const CLEAREST_SPOT_GAUGE_ARC_STROKE_WIDTH = 4.5;

export function clearestSpotGaugeAngleRadians(score: number): number {
  const clamped = clampMetricPercent(score);

  return Math.PI - (clamped / 100) * Math.PI;
}

export function clearestSpotGaugeMarkerPoint(score: number): { x: number; y: number } {
  const angle = clearestSpotGaugeAngleRadians(score);

  return {
    x: CLEAREST_SPOT_GAUGE_CENTER_X + CLEAREST_SPOT_GAUGE_RADIUS * Math.cos(angle),
    y: CLEAREST_SPOT_GAUGE_CENTER_Y - CLEAREST_SPOT_GAUGE_RADIUS * Math.sin(angle),
  };
}

export function clearestSpotGaugeArcStart(): { x: number; y: number } {
  return {
    x: CLEAREST_SPOT_GAUGE_CENTER_X - CLEAREST_SPOT_GAUGE_RADIUS,
    y: CLEAREST_SPOT_GAUGE_CENTER_Y,
  };
}

export function clearestSpotGaugeArcEnd(): { x: number; y: number } {
  return {
    x: CLEAREST_SPOT_GAUGE_CENTER_X + CLEAREST_SPOT_GAUGE_RADIUS,
    y: CLEAREST_SPOT_GAUGE_CENTER_Y,
  };
}

export function clearestSpotGaugeActiveArcPath(score: number): string | null {
  const clamped = clampMetricPercent(score);
  if (clamped <= 0) {
    return null;
  }

  const start = clearestSpotGaugeArcStart();
  const marker = clearestSpotGaugeMarkerPoint(clamped);

  return `M ${start.x} ${start.y} A ${CLEAREST_SPOT_GAUGE_RADIUS} ${CLEAREST_SPOT_GAUGE_RADIUS} 0 0 1 ${marker.x} ${marker.y}`;
}

export function clearestSpotGaugeInactiveArcPath(score: number): string | null {
  const clamped = clampMetricPercent(score);
  if (clamped >= 100) {
    return null;
  }

  const end = clearestSpotGaugeArcEnd();
  const marker = clearestSpotGaugeMarkerPoint(clamped);

  return `M ${marker.x} ${marker.y} A ${CLEAREST_SPOT_GAUGE_RADIUS} ${CLEAREST_SPOT_GAUGE_RADIUS} 0 0 1 ${end.x} ${end.y}`;
}

export function clearestSpotGaugeMarkerRotationDegrees(score: number): number {
  const angleRadians = clearestSpotGaugeAngleRadians(score);

  return (angleRadians * 180) / Math.PI - 90;
}
