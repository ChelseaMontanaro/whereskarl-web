/**
 * Deep-link / legacy query aliases remapped to canonical catalog ids.
 * These must never appear as catalog entries. `ocean-beach-sf` → `ocean-beach`.
 * Bare `richmond` is intentionally NOT remapped (ambiguous: richmond-district vs richmond-ca).
 */
const LOCATION_ID_COMPAT_ALIASES: Record<string, string> = {
  "ocean-beach-sf": "ocean-beach",
};

export function normalizeLocationId(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const lowered = trimmed.toLowerCase();
  return LOCATION_ID_COMPAT_ALIASES[lowered] ?? trimmed;
}
