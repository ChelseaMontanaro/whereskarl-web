import { describe, expect, it } from 'vitest';

import {
  AIR_QUALITY_BAND_ORDER,
  airQualityMeterAriaLabel,
  airQualityMeterFillPercent,
  airQualityMetricDetail,
  airQualityMetricValue,
  bayWideAirQuality,
} from '@/lib/home/airQualityMetric';
import { presentAirQuality } from '@whereskarl/domain';
import {
  currentResponseSchema,
  type AirQuality,
  type CurrentResponse,
} from '@whereskarl/schemas';

function airQuality(overrides: Partial<AirQuality> = {}): AirQuality {
  return {
    aqi: 32,
    category: 'good',
    colorToken: 'aqi.good',
    label: 'Good',
    isAvailable: true,
    ...overrides,
  };
}

/**
 * Only the fields this module reads. `regionalAirQuality` is the Bay-wide
 * aggregate; `airQuality` is Karl's single pin and must never be substituted.
 */
function current(
  value: AirQuality | undefined,
  pinValue?: AirQuality,
): CurrentResponse {
  return {
    regionalAirQuality: value,
    airQuality: pinValue,
  } as unknown as CurrentResponse;
}

describe('Home Air Quality metric (Bay-wide)', () => {
  it('reads the backend regional aggregate and never aggregates on the client', () => {
    const presentation = bayWideAirQuality(current(airQuality({ aqi: 51 })));

    expect(presentation.available).toBe(true);
    expect(presentation.aqi).toBe(51);
  });

  /**
   * Physical-iPhone root cause: `/current.airQuality` is the foggiest single
   * pin's object, so it read "--" whenever that pin degraded and it labelled a
   * location-specific number "across the Bay". Home must ignore it entirely.
   */
  it('never falls back to Karl’s single-pin AQI', () => {
    const pinOnly = current(undefined, airQuality({ aqi: 88 }));

    expect(bayWideAirQuality(pinOnly).available).toBe(false);
    expect(airQualityMetricValue(bayWideAirQuality(pinOnly))).toBe('--');

    // A live regional value must win even when the pin disagrees.
    const both = current(airQuality({ aqi: 49 }), airQuality({ aqi: 88 }));
    expect(bayWideAirQuality(both).aqi).toBe(49);
  });

  it('treats a missing or unavailable value as unavailable rather than guessing', () => {
    expect(bayWideAirQuality(current(undefined)).available).toBe(false);
    expect(bayWideAirQuality(null).available).toBe(false);
  });

  it('renders the numeric AQI as the card value', () => {
    expect(airQualityMetricValue(bayWideAirQuality(current(airQuality())))).toBe(
      '32',
    );
    expect(airQualityMetricValue(bayWideAirQuality(null))).toBe('--');
  });

  it('states the canonical classification with a Bay-wide qualifier', () => {
    expect(
      airQualityMetricDetail(bayWideAirQuality(current(airQuality()))),
    ).toBe('Good across the Bay');

    expect(
      airQualityMetricDetail(
        bayWideAirQuality(
          current(
            airQuality({
              aqi: 160,
              category: 'unhealthy',
              colorToken: 'aqi.unhealthy',
              label: 'Unhealthy',
            }),
          ),
        ),
      ),
    ).toBe('Unhealthy across the Bay');

    expect(airQualityMetricDetail(bayWideAirQuality(null))).toBe(
      'Air quality unavailable',
    );
  });

  it('uses the canonical six-band order from the backend schema', () => {
    expect([...AIR_QUALITY_BAND_ORDER]).toEqual([
      'good',
      'moderate',
      'unhealthy-sensitive',
      'unhealthy',
      'very-unhealthy',
      'hazardous',
    ]);
  });

  it('places the meter by AQI band, not by treating AQI as a percentage', () => {
    // AQI 32 is Good: it must sit near the Good end, not at 32% of the track.
    const good = bayWideAirQuality(current(airQuality()));
    expect(airQualityMeterFillPercent(good)).toBeCloseTo(100 / 12, 1);

    // A percentage mapping would put AQI 32 at 32%.
    expect(airQualityMeterFillPercent(good)).not.toBeCloseTo(32, 0);
  });

  it('advances the meter monotonically from Good to Hazardous', () => {
    const positions = AIR_QUALITY_BAND_ORDER.map((category) =>
      airQualityMeterFillPercent(
        presentAirQuality(
          airQuality({
            category,
            colorToken: `aqi.${category}`,
            label: category,
          }),
        ),
      ),
    );

    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1]);
    }
    // Stays inside the track at both ends.
    expect(positions[0]).toBeGreaterThan(0);
    expect(positions[positions.length - 1]).toBeLessThan(100);
  });

  it('parks the indicator at the Good end when AQI is unavailable', () => {
    expect(airQualityMeterFillPercent(bayWideAirQuality(null))).toBe(0);
  });

  it('announces the Bay-wide scope and canonical label to screen readers', () => {
    expect(
      airQualityMeterAriaLabel(bayWideAirQuality(current(airQuality()))),
    ).toBe('Bay-wide air quality index 32, Good');
    expect(airQualityMeterAriaLabel(bayWideAirQuality(null))).toBe(
      'Bay-wide air quality index unavailable',
    );
  });
});

/**
 * The physical-iPhone failure was originally suspected to be a schema/transport
 * problem (field stripped, wrong nesting, stale type). It was not — but the new
 * regional field must be proven to survive the real Universal data path rather
 * than assumed to, so this parses a verbatim live `/current` payload through the
 * actual schema the API client uses and drives the card from the result.
 */
describe('Bay-wide AQI survives the real Universal data path', () => {
  /**
   * Captured verbatim from a live `GET /current`. It happens to be the exact
   * physical-iPhone failure: Karl's pin (Lands End) is degraded, so the
   * per-pin `airQuality` is unavailable, while the regional aggregate is a
   * healthy 49 "Good". The old card read "--" here.
   */
  const LIVE_CURRENT = {
    id: 'bay-area-current',
    karlLocationId: 'lands-end',
    summary: 'Karl is karl territory near Lands End.',
    status: 'Patchy fog nearby',
    temperature: 57,
    fogCoverage: 48,
    sunshineScore: 52,
    windSpeed: 15,
    windDirection: 'W',
    cloudCover: 93,
    visibility: 0.9,
    humidity: 94,
    weatherCode: 45,
    iconName: 'cloud.fog.fill',
    updatedAt: '2026-08-29T00:22:43.522Z',
    source: 'live',
    airQuality: {
      aqi: null,
      category: null,
      colorToken: 'aqi.unavailable',
      label: 'Unavailable',
      description: null,
      pollutant: null,
      observedAt: null,
      source: null,
      isAvailable: false,
    },
    regionalAirQuality: {
      aqi: 49,
      category: 'good',
      colorToken: 'aqi.good',
      label: 'Good',
      description: 'Air quality is considered satisfactory.',
      pollutant: 'PM2.5',
      observedAt: '2026-08-29T00:00:00.000Z',
      source: 'Open-Meteo',
      isAvailable: true,
    },
    confidenceScore: 0,
    confidenceLabel: 'Unavailable',
    confidenceExplanation: 'Confidence unavailable for demo or fallback data.',
    confidenceComponents: {
      freshness: 0,
      observationQuality: 0,
      fieldCompleteness: 0,
      sourceReliability: 0,
    },
    dataStatus: {
      source: 'degraded',
      isDegraded: true,
      lastLiveObservationAt: null,
      freshnessMinutes: null,
    },
  };

  it('keeps regionalAirQuality and karlLocationId through the schema', () => {
    const parsed = currentResponseSchema.parse(LIVE_CURRENT);

    expect(parsed.regionalAirQuality).toBeDefined();
    expect(parsed.regionalAirQuality?.aqi).toBe(49);
    expect(parsed.karlLocationId).toBe('lands-end');
  });

  it('renders the region even though Karl’s own pin has no AQI', () => {
    const presentation = bayWideAirQuality(currentResponseSchema.parse(LIVE_CURRENT));

    // Exactly the physical-iPhone regression: this used to be '--'.
    expect(airQualityMetricValue(presentation)).toBe('49');
    expect(airQualityMetricDetail(presentation)).toBe('Good across the Bay');
    expect(airQualityMetricDetail(presentation)).not.toBe(
      'Air quality unavailable',
    );
    // A meter can only draw when the value is available.
    expect(presentation.available).toBe(true);
  });

  it('degrades honestly against a backend deployed before the field existed', () => {
    const { regionalAirQuality, karlLocationId, ...legacy } = LIVE_CURRENT;
    const parsed = currentResponseSchema.parse(legacy);

    expect(parsed.regionalAirQuality).toBeUndefined();
    expect(parsed.karlLocationId).toBeUndefined();
    // Never silently substitutes Karl's pin.
    expect(airQualityMetricValue(bayWideAirQuality(parsed))).toBe('--');
  });
});
