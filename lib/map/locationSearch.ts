/**
 * Canonical catalog search for map location pickers.
 *
 * Operates on the already-loaded location collection (same objects the map
 * markers use). Does not fetch, clone into a parallel catalog, or invent
 * search-only metadata.
 *
 * Matching is case-insensitive prefix-only on the canonical display name
 * (trimmed). Results are alphabetical. Contains / later-word / fuzzy matches
 * are intentionally excluded.
 */

export type CanonicalSearchableLocation = {
  id: string;
  name: string;
  /**
   * Reserved for future canonical catalog aliases. Not used by prefix search
   * until aliases exist as catalog metadata (no ad hoc alias tables).
   */
  aliases?: readonly string[];
};

function compareDisplayName(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

/**
 * Filters canonical locations by display-name prefix.
 * Empty / whitespace-only query returns an empty list — the UI owns the
 * focused empty-state panel and must not list the full catalog on focus.
 * Returned items are references into the input array.
 */
export function filterCanonicalLocationsBySearch<
  T extends CanonicalSearchableLocation,
>(locations: readonly T[], query: string): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return locations
    .filter((location) =>
      location.name.trim().toLowerCase().startsWith(normalizedQuery),
    )
    .sort((left, right) => compareDisplayName(left.name, right.name));
}
