import { describe, expect, it } from 'vitest';

import {
  SETTINGS_TEMPERATURE_UNIT,
  isSettingsTemperatureControlInteractive,
  settingsTemperatureSelectedUnit,
} from '@/lib/settings/settingsTemperature';

describe('Phase 26 — Temperature Unit is Coming Soon', () => {
  it('keeps Fahrenheit as the current default and is not interactive', () => {
    expect(SETTINGS_TEMPERATURE_UNIT.current).toBe('fahrenheit');
    expect(SETTINGS_TEMPERATURE_UNIT.comingSoon).toBe(true);
    expect(SETTINGS_TEMPERATURE_UNIT.interactive).toBe(false);
    expect(isSettingsTemperatureControlInteractive()).toBe(false);
    expect(settingsTemperatureSelectedUnit()).toBe('fahrenheit');
  });
});
