import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BestRightNowSection } from '@/components/home/BestRightNowSection';
import { DashboardGrid } from '@/components/home/DashboardGrid';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeHeroBackground } from '@/components/home/HomeHeroBackground';
import { IntelligenceNarrativeCard } from '@/components/home/IntelligenceNarrativeCard';
import { NextHourOutlookCard } from '@/components/home/NextHourOutlookCard';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeWeather } from '@/hooks/useHomeWeather';
import { resolveHeroPresentation } from '@/lib/home/heroPresentation';
import {
  bestRightNowItems,
  enrichBestRightNowItemsWithLocationWeather,
  foggiestKarlLocation,
  formatUpdatedAt,
  heroConfidenceText,
  heroHeadline,
  heroSubheadline,
  isNighttime,
  nextHourOutlookSummary,
  resolveKarlReadPresentation,
} from '@/lib/home/weatherDisplay';
import { useClearSkiesNav } from '@/providers/ClearSkiesNavProvider';

const BOTTOM_NAV_CONTENT_INSET = 88;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    isLoadingIntelligence,
    current,
    locations,
    bestSunshine,
    intelligence,
    hasLoadedCoreWeather,
  } = useHomeWeather();
  const { setClearSkiesNav } = useClearSkiesNav();

  const karlLocation = useMemo(
    () => foggiestKarlLocation(locations),
    [locations],
  );

  const isNightPresentation = useMemo(
    () => isNighttime(new Date().getHours()),
    [],
  );

  const heroPresentation = useMemo(
    () => resolveHeroPresentation(intelligence?.heroImagery),
    [intelligence?.heroImagery],
  );

  const bestRightNow = useMemo(
    () =>
      enrichBestRightNowItemsWithLocationWeather(
        bestRightNowItems(intelligence, bestSunshine),
        locations,
      ),
    [intelligence, bestSunshine, locations],
  );

  const karlReadPresentation = useMemo(
    () =>
      resolveKarlReadPresentation({
        intelligence,
        bestSunshine,
        locations,
        bestRightNow,
      }),
    [intelligence, bestSunshine, locations, bestRightNow],
  );

  const nextHourSummary = nextHourOutlookSummary(karlLocation?.prediction);
  const nextHourConfidence =
    karlLocation?.prediction?.predictionConfidenceLabel ?? null;

  const showLoading = isLoading && !hasLoadedCoreWeather;
  const isFindingClearSkies = isLoading && !bestSunshine;
  const clearSkiesLocationId = bestSunshine?.locationID ?? null;

  const headline = heroHeadline({
    current,
    karlLocation,
    intelligenceFocusLocationId: intelligence?.heroImagery?.focusLocationId,
    hasLoadedWeather: hasLoadedCoreWeather,
  });

  const subheadline = heroSubheadline({
    current,
    karlLocation,
    hasLoadedWeather: hasLoadedCoreWeather,
  });

  const confidenceText = heroConfidenceText({
    intelligence,
    karlLocation,
    current,
  });

  useEffect(() => {
    setClearSkiesNav({
      locationId: clearSkiesLocationId,
      isLoading: isFindingClearSkies,
    });
  }, [clearSkiesLocationId, isFindingClearSkies, setClearSkiesNav]);

  const statusBarInset = Math.max(insets.top, 8);

  return (
    <View style={styles.root}>
      <HomeHeroBackground presentation={heroPresentation} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            // Initial content clears the status bar; hero image remains full-bleed behind.
            paddingTop: statusBarInset,
            paddingBottom:
              BOTTOM_NAV_CONTENT_INSET + Math.max(insets.bottom, 8),
          },
        ]}
        showsVerticalScrollIndicator={false}
        // Avoid iOS automatically inset-adjusting in a way that fights full-bleed hero.
        contentInsetAdjustmentBehavior="never">
        <HomeHero
          headline={headline}
          subheadline={subheadline}
          confidenceText={confidenceText}
          isLoading={showLoading}
          clearSkiesLocationId={clearSkiesLocationId}
          isFindingClearSkies={isFindingClearSkies}
        />

        <View style={styles.content}>
          <DashboardGrid
            current={current}
            bestSunshine={bestSunshine}
            intelligence={intelligence}
            isLoading={!hasLoadedCoreWeather}
            isNightPresentation={isNightPresentation}
          />

          <View style={styles.insightStack}>
            <IntelligenceNarrativeCard
              intelligence={intelligence}
              karlReadPresentation={karlReadPresentation}
              isLoading={isLoadingIntelligence && !intelligence}
            />

            <BestRightNowSection
              items={bestRightNow}
              isNightPresentation={isNightPresentation}
            />

            <NextHourOutlookCard
              summary={nextHourSummary}
              confidenceLabel={nextHourConfidence}
              isLoading={!hasLoadedCoreWeather}
            />
          </View>

          {current ? (
            <Text style={styles.updated}>
              Updated {formatUpdatedAt(current.updatedAt)}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/*
        Full-bleed hero is intentional (image under status bar at rest).
        Once scrolled, glass cards colliding with the Dynamic Island is not.
        A short non-interactive top scrim — height = status-bar inset only —
        softens that collision without adding header chrome.
      */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.statusBarScrim, { height: statusBarInset }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginTop: -8,
    gap: 16,
  },
  insightStack: {
    gap: 16,
  },
  updated: {
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  statusBarScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    // Soft veil only — hero still reads through at rest; scrolled cards stay legible.
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
});
