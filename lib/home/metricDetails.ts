export type MetricDetailKey = "fog-coverage" | "karl-status" | "sunshine-score";

export type MetricDetailContent = {
  title: string;
  body: string;
};

export const METRIC_DETAILS: Record<MetricDetailKey, MetricDetailContent> = {
  "fog-coverage": {
    title: "Fog Coverage",
    body: "This estimates how much of the Bay Area is currently under Karl's marine layer.",
  },
  "karl-status": {
    title: "Karl Status",
    body: "Shows Karl's current movement across the Bay, such as lingering, retreating, drifting, or clearing.",
  },
  "sunshine-score": {
    title: "Sunshine Score",
    body: "Higher scores mean better chances of finding clear skies. Lower scores mean Karl may still be hanging around.",
  },
};

export function metricDetailAriaLabel(title: string): string {
  return `Learn about ${title}`;
}
