import { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConditionsStatusChip } from '@/components/favorites/ConditionsStatusChip';
import { FavoritesAtmosphereBackground } from '@/components/favorites/FavoritesAtmosphereBackground';
import { FavoritesEmptyState } from '@/components/favorites/FavoritesEmptyState';
import { FavoritesHeader } from '@/components/favorites/FavoritesHeader';
import { FavoritesSummaryRow } from '@/components/favorites/FavoritesSummaryRow';
import { FavoritesTipCard } from '@/components/favorites/FavoritesTipCard';
import { SavedLocationCard } from '@/components/favorites/SavedLocationCard';
import { TopSavedLocationCard } from '@/components/favorites/TopSavedLocationCard';
import { BOTTOM_NAV_SCROLL_INSET } from '@/constants/bottomNav';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import { useLocations } from '@/hooks/useLocations';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { resolveFavoritesContentPresentation } from '@/lib/favorites/favoritesDisplay';
import {
  resolveConditionsPresentation,
} from '@/lib/home/conditionsStatus';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsiveLayout();
  const {
    locations,
    isLoading,
    isRefreshing,
    hasLiveData,
    refresh,
  } = useLocations();
  const {
    favoriteIds,
    favoriteLocations,
    topSavedLocation,
    summary,
    isLoading: isLoadingFavorites,
    removeFavorite,
  } = useFavorites(locations);

  const conditionsPresentation = useMemo(
    () =>
      resolveConditionsPresentation({
        isLoading: isLoading || isLoadingFavorites,
        hasLoadedWeather: locations.length > 0,
        currentSource: hasLiveData ? 'live' : undefined,
      }),
    [hasLiveData, isLoading, isLoadingFavorites, locations.length],
  );

  const contentPresentation = resolveFavoritesContentPresentation({
    favoriteLocationsCount: favoriteLocations.length,
    favoriteIdsCount: favoriteIds.length,
    isLoadingFavoriteIds: isLoadingFavorites,
    catalogSize: locations.length,
    isLoadingCatalog: isLoading,
  });
  const showPopulated = contentPresentation === 'populated';
  const showEmpty = contentPresentation === 'empty';

  const statusBarInset = Math.max(insets.top, Spacing.sm);
  // Phase 25 §12: keep this restrained — only surface it while there is
  // something notable to communicate (loading/estimated/cached/unavailable),
  // so it never competes with the Favorites hierarchy during normal use.
  const showConditionsChip = conditionsPresentation !== 'live';
  const locationCountLabel =
    favoriteLocations.length === 1 ? '1 location' : `${favoriteLocations.length} locations`;

  return (
    <View style={styles.root}>
      <FavoritesAtmosphereBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: statusBarInset + Spacing.md,
            paddingBottom:
              BOTTOM_NAV_SCROLL_INSET +
              Math.max(insets.bottom, Spacing.sm) +
              (showEmpty ? Spacing.xl : 0),
            paddingHorizontal: horizontalPadding,
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.gold}
          />
        }>
        <FavoritesHeader />

        {showConditionsChip ? (
          <ConditionsStatusChip presentation={conditionsPresentation} />
        ) : null}

        {showPopulated ? (
          <>
            <FavoritesSummaryRow summary={summary} />

            {topSavedLocation ? (
              <TopSavedLocationCard
                location={topSavedLocation}
                onRemoveFavorite={removeFavorite}
              />
            ) : null}

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>All Favorites</Text>
                <Text style={styles.sectionCount}>{locationCountLabel}</Text>
              </View>
              <View style={styles.list}>
                {favoriteLocations.map((location) => (
                  <SavedLocationCard
                    key={location.id}
                    location={location}
                    onRemoveFavorite={removeFavorite}
                  />
                ))}
              </View>
            </View>
          </>
        ) : null}

        {showEmpty ? (
          <>
            <View style={styles.emptyWrap}>
              <FavoritesEmptyState />
            </View>
            {/* Phase 25 §2/§9: the Tip is optional empty-state support —
                a floating hint, not a full-width footer against the nav. */}
            <View style={styles.tipSlot}>
              <FavoritesTipCard />
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.md,
  },
  section: {
    marginTop: 4,
    gap: 8,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 240,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  list: {
    gap: 10,
  },
  tipSlot: {
    alignItems: 'stretch',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
