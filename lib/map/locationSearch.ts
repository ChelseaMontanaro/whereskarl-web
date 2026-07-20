/**
 * Canonical catalog search for map location pickers.
 *
 * Operates on the already-loaded location collection (same objects the map
 * markers use). Does not fetch, clone into a parallel catalog, or invent
 * search-only metadata.
 *
 * Match priority (deterministic):
 * 1. exact display-name match
 * 2. display name starts with query
 * 3. any word within the display name starts with query
 * 4. display name contains query
 * 5. alias starts with query (when canonical aliases exist on the object)
 * 6. alias contains query
 * Within each rank: alphabetical by display name.
 */

export type CanonicalSearchableLocation = {
  id: string;
  name: string;
  /** Optional canonical aliases — only used when already present on the object. */
  aliases?: readonly string[];
};

function compareDisplayName(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function anyWordStartsWith(name: string, normalizedQuery: string): boolean {
  return name
    .split(/[\s\-_/]+/)
    .filter(Boolean)
    .some((word) => word.toLowerCase().startsWith(normalizedQuery));
}

function bestAliasRank(
  aliases: readonly string[] | undefined,
  normalizedQuery: string,
): 5 | 6 | null {
  if (!aliases || aliases.length === 0) {
    return null;
  }

  let best: 5 | 6 | null = null;
  for (const alias of aliases) {
    const normalizedAlias = alias.trim().toLowerCase();
    if (!normalizedAlias) {
      continue;
    }
    if (normalizedAlias.startsWith(normalizedQuery)) {
      return 5;
    }
    if (normalizedAlias.includes(normalizedQuery) && best === null) {
      best = 6;
    }
  }
  return best;
}

function matchRank(
  location: CanonicalSearchableLocation,
  normalizedQuery: string,
): 1 | 2 | 3 | 4 | 5 | 6 | null {
  const name = location.name.trim().toLowerCase();
  if (!name) {
    return bestAliasRank(location.aliases, normalizedQuery);
  }

  if (name === normalizedQuery) {
    return 1;
  }
  if (name.startsWith(normalizedQuery)) {
    return 2;
  }
  if (anyWordStartsWith(name, normalizedQuery)) {
    return 3;
  }
  if (name.includes(normalizedQuery)) {
    return 4;
  }

  return bestAliasRank(location.aliases, normalizedQuery);
}

/**
 * Filters and ranks canonical locations for live search.
 * Empty / whitespace-only query returns the full catalog sorted alphabetically.
 * Returned items are references into the input array — not copies of a second catalog.
 */
export function filterCanonicalLocationsBySearch<
  T extends CanonicalSearchableLocation,
>(locations: readonly T[], query: string): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [...locations].sort((left, right) =>
      compareDisplayName(left.name, right.name),
    );
  }

  const ranked: { location: T; rank: number }[] = [];

  for (const location of locations) {
    const rank = matchRank(location, normalizedQuery);
    if (rank !== null) {
      ranked.push({ location, rank });
    }
  }

  ranked.sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }
    return compareDisplayName(left.location.name, right.location.name);
  });

  return ranked.map((entry) => entry.location);
}
