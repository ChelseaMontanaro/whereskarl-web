/**
 * Phase 26 Temperature Unit is visual-only.
 *
 * °F represents current/default application behavior. The control must not
 * persist a preference, convert temperatures, or change Home / Map /
 * Favorites / location-detail unit display.
 */
export const SETTINGS_TEMPERATURE_UNIT = {
  current: 'fahrenheit',
  comingSoon: true,
  interactive: false,
} as const;

export function isSettingsTemperatureControlInteractive(): boolean {
  return SETTINGS_TEMPERATURE_UNIT.interactive;
}

export function settingsTemperatureSelectedUnit(): 'fahrenheit' {
  return SETTINGS_TEMPERATURE_UNIT.current;
}
