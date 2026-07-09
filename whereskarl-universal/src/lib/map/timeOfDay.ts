/**
 * Bay Area local time-of-day helpers — aligned with whereskarl-web/lib/home/weatherDisplay.ts.
 */

export function isNighttime(hour: number): boolean {
  return hour >= 19 || hour < 6;
}

export function getCurrentIsNighttime(date = new Date()): boolean {
  return isNighttime(date.getHours());
}
