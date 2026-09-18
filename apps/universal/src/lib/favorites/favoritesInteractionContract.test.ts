import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Phase 25 §7/§8/§18 — structural contract tests.
 *
 * There is no React Native test renderer installed in this repo (adding one
 * is a dependency change outside Phase 25 scope), so — following the same
 * established pattern as `lib/map/mapPhase24Parity.test.ts` and
 * `lib/map/nativeMarkerGeometry.test.ts` — these assert directly on source
 * so the nested-Pressable / no-navigation-on-remove contract cannot silently
 * regress, without requiring component rendering.
 */
function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const FAVORITES_SCREEN = 'src/app/favorites.tsx';
const SAVED_LOCATION_CARD = 'src/components/favorites/SavedLocationCard.tsx';
const TOP_SAVED_LOCATION_CARD =
  'src/components/favorites/TopSavedLocationCard.tsx';
const FAVORITE_HEART_BUTTON = 'src/components/favorites/FavoriteHeartButton.tsx';
const USE_FAVORITES_HOOK = 'src/hooks/useFavorites.ts';
const USE_FAVORITE_TOGGLE_HOOK = 'src/hooks/useFavoriteToggle.ts';

describe('Phase 25 — direct unfavorite does not trigger card navigation', () => {
  it('SavedLocationCard nests the heart button inside the navigating card Pressable', () => {
    const source = readSource(SAVED_LOCATION_CARD);
    const cardOpen = source.indexOf('<Pressable');
    const heartUsage = source.indexOf('<FavoriteHeartButton');
    const cardClose = source.indexOf('</Pressable>');

    expect(cardOpen).toBeGreaterThan(-1);
    expect(heartUsage).toBeGreaterThan(cardOpen);
    expect(heartUsage).toBeLessThan(cardClose);
  });

  it('SavedLocationCard wires the card body to buildMapHref and the heart to onRemoveFavorite only', () => {
    const source = readSource(SAVED_LOCATION_CARD);

    expect(source).toContain("router.push(buildMapHref(location.id)");
    expect(source).toContain('onPress={handlePress}');
    expect(source).toContain('onRemove={() => onRemoveFavorite(location.id)}');

    // The heart control must never call the card's own navigation handler.
    const heartBlock = source.slice(source.indexOf('<FavoriteHeartButton'));
    expect(heartBlock).not.toContain('handlePress');
    expect(heartBlock).not.toContain('router.push');
  });

  it('TopSavedLocationCard nests the heart button inside the navigating card Pressable', () => {
    const source = readSource(TOP_SAVED_LOCATION_CARD);
    const cardOpen = source.indexOf('<Pressable');
    const heartUsage = source.indexOf('<FavoriteHeartButton');
    const cardClose = source.lastIndexOf('</Pressable>');

    expect(cardOpen).toBeGreaterThan(-1);
    expect(heartUsage).toBeGreaterThan(cardOpen);
    expect(heartUsage).toBeLessThan(cardClose);
  });

  it('TopSavedLocationCard removal never navigates (Phase 25 §8)', () => {
    const source = readSource(TOP_SAVED_LOCATION_CARD);
    const heartBlock = source.slice(source.indexOf('<FavoriteHeartButton'));

    expect(heartBlock).not.toContain('handlePress');
    expect(heartBlock).not.toContain('router.push');
    expect(source).toContain('onRemove={() => onRemoveFavorite(location.id)}');
  });

  it('FavoriteHeartButton keeps accessibility, hit target, and approved mockup red', () => {
    const source = readSource(FAVORITE_HEART_BUTTON);

    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('Remove ${locationName} from favorites');
    expect(source).toContain('hitSlop={8}');
    expect(source).toContain('#FF375F');
    expect(source).not.toContain('Colors.gold');
  });
});

describe('Phase 25 — Favorites screen hierarchy (§2/§9)', () => {
  it('renders Quick Summary before Top Saved Location before All Favorites', () => {
    const source = readSource(FAVORITES_SCREEN);

    const summaryIndex = source.indexOf('<FavoritesSummaryRow');
    const topIndex = source.indexOf('<TopSavedLocationCard');
    const listIndex = source.indexOf('All Favorites');

    expect(summaryIndex).toBeGreaterThan(-1);
    expect(topIndex).toBeGreaterThan(summaryIndex);
    expect(listIndex).toBeGreaterThan(topIndex);
  });

  it('keeps the Tip card as empty-state-only supporting content', () => {
    const source = readSource(FAVORITES_SCREEN);
    const tip = readSource('src/components/favorites/FavoritesTipCard.tsx');

    const emptyStateIndex = source.indexOf('<FavoritesEmptyState');
    const tipIndexes = [...source.matchAll(/<FavoritesTipCard/g)];

    expect(emptyStateIndex).toBeGreaterThan(-1);
    // Rendered exactly once, and only after the empty state (not in the
    // populated branch), so it never competes with the core hierarchy.
    expect(tipIndexes).toHaveLength(1);
    expect(tipIndexes[0].index).toBeGreaterThan(emptyStateIndex);
    expect(source).toContain('tipSlot');
    expect(tip).not.toContain('LiquidGlassSurface');
    expect(tip).toContain('FAVORITES_HINT_FILL');
    expect(tip).toContain('>Tip<');
    expect(tip).toContain('💡');
    expect(tip).not.toContain('maxWidth: 300');
  });

  it('keeps the conditions status chip restrained to non-live states (§12)', () => {
    const source = readSource(FAVORITES_SCREEN);

    expect(source).toContain("conditionsPresentation !== 'live'");
    expect(source).toContain('showConditionsChip');
  });

  it('wires removeFavorite from useFavorites into both card types', () => {
    const source = readSource(FAVORITES_SCREEN);

    expect(source).toContain('removeFavorite');
    expect(source).toContain('onRemoveFavorite={removeFavorite}');
  });

  it('accommodates the frozen floating bottom nav via the shared scroll inset (§16)', () => {
    const source = readSource(FAVORITES_SCREEN);

    expect(source).toContain('BOTTOM_NAV_SCROLL_INSET');
    expect(source).toContain('insets.bottom');
  });
});

describe('Phase 25 — populated visual density (approved mockup)', () => {
  it('keeps the summary row compact rather than an 88pt dashboard band', () => {
    const source = readSource('src/components/favorites/FavoritesSummaryRow.tsx');

    expect(source).not.toContain('minHeight: 88');
    expect(source).toContain('paddingVertical: 10');
    expect(source).toContain('Sunny & Clear');
    expect(source).not.toContain('Sunny or Clear');
  });

  it('stacks summary cards as value, then label, then icon (not icon beside label)', () => {
    const source = readSource('src/components/favorites/FavoritesSummaryRow.tsx');
    const valueIndex = source.indexOf('styles.cardValue');
    const titleIndex = source.indexOf('styles.cardTitle');
    const iconIndex = source.indexOf('styles.cardIcon');

    expect(valueIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(valueIndex);
    expect(iconIndex).toBeGreaterThan(titleIndex);
    expect(source).not.toContain('cardLabelRow');
    expect(source).toContain('numberOfLines={1}');
  });

  it('keeps Top Saved compact: no giant temperature or next-hour prose block', () => {
    const source = readSource(TOP_SAVED_LOCATION_CARD);

    expect(source).not.toContain('fontSize: 56');
    expect(source).not.toContain('nextHour');
    expect(source).toContain('FavoriteHeartButton');
    expect(source).toContain('buildMapHref');
  });

  it('renders Top Saved condition as a chip rather than a duplicated numeric score', () => {
    const source = readSource(TOP_SAVED_LOCATION_CARD);

    expect(source).toContain('FavoritesConditionChip');
    expect(source).not.toContain('getBestRightNowScoreLabel');
    expect(source).not.toContain('presentClearSkiesScore');
    expect(source).not.toContain('` ${scoreLabel}`');
  });

  it('uses only the location\'s own imageUrl for Top Saved photography', () => {
    const source = readSource(TOP_SAVED_LOCATION_CARD);

    expect(source).toContain('location.imageUrl');
    expect(source).not.toContain('FAVORITES_ATMOSPHERE_IMAGE_KEY');
    expect(source).not.toContain('hero/marin-headlands');
  });

  it('uses only the location\'s own imageUrl for saved-row photography', () => {
    const source = readSource(SAVED_LOCATION_CARD);

    expect(source).toContain('FavoritesLocationThumb');
    expect(source).toContain('imageUrl={location.imageUrl}');
    expect(source).not.toContain('FAVORITES_ATMOSPHERE_IMAGE_KEY');
    expect(source).not.toContain('hero/marin-headlands');
  });
});

describe('Phase 25 — cross-screen favorite sync (§11)', () => {
  it('useFavorites subscribes to storage changes so removals reload derived state', () => {
    const source = readSource(USE_FAVORITES_HOOK);

    expect(source).toContain('subscribeFavoriteChanges');
    expect(source).toContain('toggleFavoriteLocation');
  });

  it('useFavorites never writes empty-catalog sanitization back to storage', () => {
    const source = readSource(USE_FAVORITES_HOOK);

    expect(source).toContain('shouldPersistSanitizedFavoriteIds');
    expect(source).toContain('catalogSize === 0 ? storedIds : sanitized');
  });

  it('useFavoriteToggle (Map) re-subscribes to storage changes so a stale heart cannot persist across screens', () => {
    const source = readSource(USE_FAVORITE_TOGGLE_HOOK);

    expect(source).toContain('subscribeFavoriteChanges');
    // Minimal, additive fix only — the public hook contract is unchanged.
    expect(source).toContain('handleToggleFavorite');
    expect(source).toContain('return { isFavorite, handleToggleFavorite }');
  });
});

describe('Phase 27.2 — Favorites content gate, not native-repaint workarounds', () => {
  it('keeps Favorites→Map as a push of the selected location', () => {
    const saved = readSource(SAVED_LOCATION_CARD);
    const top = readSource(TOP_SAVED_LOCATION_CARD);

    expect(saved).toContain("router.push(buildMapHref(location.id)");
    expect(top).toContain("router.push(buildMapHref(location.id)");
  });

  it('gates empty state through resolveFavoritesContentPresentation', () => {
    const screen = readSource(FAVORITES_SCREEN);

    expect(screen).toContain('resolveFavoritesContentPresentation');
    expect(screen).toContain("contentPresentation === 'populated'");
    expect(screen).toContain("contentPresentation === 'empty'");
    expect(screen).not.toContain(
      'const hasFavorites = favoriteLocations.length > 0',
    );
    expect(screen).not.toContain('useFocusEffect');
    expect(screen).not.toContain('collapsable={false}');
    expect(screen).not.toContain('removeClippedSubviews={false}');
    expect(screen).not.toContain('setTimeout');
    expect(screen).not.toContain('setInterval');
  });
});
