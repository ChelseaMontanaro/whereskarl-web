/**
 * Confidence label presentation — suppress empty / "Unavailable" noise so
 * surfaces do not show placeholder confidence chrome.
 */
export function formatConfidenceLabel(
  label: string | null | undefined,
): string | null {
  const trimmed = label?.trim();
  if (!trimmed || trimmed.toLowerCase() === "unavailable") {
    return null;
  }

  return trimmed;
}
