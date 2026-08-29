/**
 * Home metric card explanations — aligned with mobile-web `metricDetails`,
 * plus Clearest Spot (web routes that card to the map instead of a sheet).
 *
 * Air Quality replaced Karl Status on the Universal dashboard: the status
 * phrase duplicated Karl's Read directly beneath the grid. Karl's Read and the
 * rest of the Karl intelligence surfaces are unchanged.
 */

export type MetricDetailKey =
  | 'fog-coverage'
  | 'air-quality'
  | 'sunshine-score'
  | 'clearest-spot';

export type MetricDetailContent = {
  title: string;
  body: string;
};

export const METRIC_DETAILS: Record<MetricDetailKey, MetricDetailContent> = {
  'fog-coverage': {
    title: 'Fog Coverage',
    body: "This estimates how much of the Bay Area is currently under Karl's marine layer.",
  },
  'air-quality': {
    title: 'Air Quality',
    body: 'The Air Quality Index (AQI) for the Bay Area as a whole — lower numbers mean cleaner air. The label beneath it is the health category that number falls into, from Good through Hazardous. Open the Map to see air quality for a specific location.',
  },
  'sunshine-score': {
    title: 'Clear Skies Score',
    body: 'The Bay Area-wide clear-sky score from Poor to Excellent. Higher scores mean better chances of finding clear skies nearby. At night, this reflects clearer conditions and the likelihood of sunshine returning after sunrise.',
  },
  'clearest-spot': {
    title: 'Clearest Spot',
    body: "Identifies the strongest current clear-sky location in the Bay Area. The score shows that location's clear-sky conditions right now.",
  },
};

export function metricDetailAriaLabel(title: string): string {
  return `Learn about ${title}`;
}
