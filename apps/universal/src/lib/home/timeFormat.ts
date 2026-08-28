const TWENTY_FOUR_HOUR_TIME_PATTERN =
  /\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/g;

export function formatPacific12HourClockTime(time: string): string | null {
  const match = time.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
}

/** Converts embedded 24-hour clock times in Next Hour copy to US Pacific 12-hour time. */
export function formatNextHourTimeCopy(text: string): string {
  return text.replace(
    TWENTY_FOUR_HOUR_TIME_PATTERN,
    (match) => formatPacific12HourClockTime(match) ?? match,
  );
}
