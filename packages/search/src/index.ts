/**
 * `@whereskarl/search` — client-side location catalog search and identity
 * matching rules. Platform-agnostic; no network or UI.
 */

export {
  filterCanonicalLocationsBySearch,
  type CanonicalSearchableLocation,
} from "./locationSearch";

export { normalizeLocationId } from "./normalizeLocationId";
