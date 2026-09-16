import { describe, expect, it } from 'vitest';

import {
  conditionsStatusLabel,
  resolveConditionsPresentation,
} from '@/lib/home/conditionsStatus';

describe('conditionsStatus', () => {
  it('reports live conditions when weather has loaded from the API', () => {
    expect(
      resolveConditionsPresentation({
        isLoading: false,
        hasLoadedWeather: true,
        currentSource: 'live',
      }),
    ).toBe('live');
    expect(conditionsStatusLabel('live')).toBe('Live conditions');
  });

  it('reports loading and unavailable states', () => {
    expect(
      resolveConditionsPresentation({
        isLoading: true,
        hasLoadedWeather: false,
      }),
    ).toBe('loading');

    expect(
      resolveConditionsPresentation({
        isLoading: false,
        hasLoadedWeather: false,
      }),
    ).toBe('unavailable');
  });
});
