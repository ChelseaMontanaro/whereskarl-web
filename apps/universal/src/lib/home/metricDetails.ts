/**
 * Home metric card explanations — aligned with mobile-web `metricDetails`,
 * plus Clearest Spot (web routes that card to the map instead of a sheet).
 */

export type MetricDetailKey =
  | 'fog-coverage'
  | 'karl-status'
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
  'karl-status': {
    title: 'Karl Status',
    body: "Shows what Karl the Fog is doing across the Bay right now — whether he's settled in, shifting around, or giving way to clearer skies.",
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
