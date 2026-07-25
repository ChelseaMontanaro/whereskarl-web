/**
 * Canonical catalog search for map location pickers.
 *
 * Operates on the already-loaded location collection (same objects the map
 * markers use). Does not fetch, clone into a parallel catalog, or invent
 * search-only metadata.
 *
 * Matching is case-insensitive prefix-only on the canonical display name and
 * on catalog `search.aliases` (trimmed). Results are alphabetical. Contains /
 * later-word / fuzzy matches are intentionally excluded.
 */

export type CanonicalSearchableLocation = {
  id: string;
  name: string;
  /**
   * Catalog search metadata from /locations. Aliases are only matched when
   * present on the object — no ad hoc frontend alias tables.
   */
  search?: {
    aliases?: readonly string[];
  };
};

function compareDisplayName(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function matchesPrefix(value: string, normalizedQuery: string): boolean {
  return value.trim().toLowerCase().startsWith(normalizedQuery);
}

function locationMatchesSearchQuery(
  location: CanonicalSearchableLocation,
  normalizedQuery: string,
): boolean {
  if (matchesPrefix(location.name, normalizedQuery)) {
    return true;
  }

  const aliases = location.search?.aliases;

  if (!aliases) {
    return false;
  }

  return aliases.some((alias) => matchesPrefix(alias, normalizedQuery));
}

/**
 * Filters canonical locations by display-name or catalog-alias prefix.
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
    .filter((location) => locationMatchesSearchQuery(location, normalizedQuery))
    .sort((left, right) => compareDisplayName(left.name, right.name));
}
