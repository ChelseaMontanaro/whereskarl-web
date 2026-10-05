/** Supporting line under the Map selected-location Fog percentage. */
export const MAP_LOCATION_CARD_FOG_SUPPORTING_LABEL = 'Coverage';

const FOG_VALUE_PLACEHOLDER = '—';

/**
 * Map-card presentation only. The percentage is the already-resolved fog
 * score; this does not recompute it.
 */
export function presentMapLocationCardFogMetric(fogScore: number | null): {
  title: 'FOG';
  value: string;
  supporting: typeof MAP_LOCATION_CARD_FOG_SUPPORTING_LABEL;
} {
  return {
    title: 'FOG',
    value:
      fogScore === null ? FOG_VALUE_PLACEHOLDER : `${fogScore}%`,
    supporting: MAP_LOCATION_CARD_FOG_SUPPORTING_LABEL,
  };
}
