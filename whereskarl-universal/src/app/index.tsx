import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClearSkiesScore } from '@/components/ClearSkiesScore';
import { KarlStatusCard } from '@/components/KarlStatusCard';
import { LocationCard } from '@/components/LocationCard';
import { Colors, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useHomeWeather } from '@/hooks/useHomeWeather';
import { useHomeLocation } from '@/hooks/useHomeLocation';
import {
  bestSunshineStatus,
  foggiestKarlLocation,
  heroConfidenceText,
  heroHeadline,
  heroSubheadline,
} from '@/lib/home/weatherDisplay';
import { getCloudSummary } from '@/lib/map/locationsDisplay';
import { useClearSkiesNav } from '@/providers/ClearSkiesNavProvider';

const PLACEHOLDER = {
  headline: 'Karl is draped across the Golden Gate',
  subheadline:
    'Fog is holding along the coast while inland pockets stay brighter through late morning.',
  confidenceText: 'Sample conditions while Karl intelligence loads',
  sunshineScore: 42,
  location: {
    name: 'Sausalito Waterfront',
    status: 'Patchy fog, limited sunshine',
    temperature: 58,
    distanceText: '4.2 mi',
    sunshineScore: 38,
  },
};

export default function HomeScreen() {
  const { isLoading, current, locations, bestSunshine, hasLiveData } =
    useHomeWeather();
  const { homeLocation } = useHomeLocation(locations);

  const { setClearSkiesNav } = useClearSkiesNav();

  const karlLocation = useMemo(
    () => foggiestKarlLocation(locations),
    [locations],
  );

  const hasLoadedWeather = hasLiveData && Boolean(current);
  const showLoading = isLoading && !hasLiveData;

  useEffect(() => {
    setClearSkiesNav({
      locationId: bestSunshine?.id ?? null,
      isLoading: showLoading,
    });
  }, [bestSunshine?.id, setClearSkiesNav, showLoading]);

  const headline = hasLoadedWeather
    ? heroHeadline({ current, karlLocation, hasLoadedWeather: true })
    : PLACEHOLDER.headline;

  const subheadline = hasLiveData
    ? heroSubheadline({
        current,
        karlLocation,
        hasLoadedWeather: Boolean(current),
      })
    : PLACEHOLDER.subheadline;

  const confidenceText = hasLiveData
    ? heroConfidenceText({ karlLocation, current })
    : PLACEHOLDER.confidenceText;

  const sunshineScore = current?.sunshineScore ?? PLACEHOLDER.sunshineScore;

  const featuredSpot = homeLocation
    ? {
        name: homeLocation.name,
        status: getCloudSummary(homeLocation),
        temperature: homeLocation.temperature,
        distanceText: homeLocation.distanceText,
        sunshineScore: homeLocation.sunshineScore,
        isHomeLocation: true,
        isPlaceholder: false,
      }
    : bestSunshine
      ? {
          name: bestSunshine.locationName,
          status: bestSunshineStatus(bestSunshine),
          temperature: bestSunshine.temperature,
          distanceText: bestSunshine.distanceText,
          sunshineScore: bestSunshine.sunshineScore,
          isHomeLocation: false,
          isPlaceholder: false,
        }
      : {
          ...PLACEHOLDER.location,
          isHomeLocation: false,
          isPlaceholder: true,
        };

  return (
    <View style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View style={styles.vignette} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.title}>Where&apos;s Karl?</Text>
            <Text style={styles.tagline}>Track Karl across the Bay</Text>
          </View>

          <View style={styles.content}>
            <KarlStatusCard
              headline={headline}
              subheadline={subheadline}
              confidenceText={confidenceText}
              isLoading={showLoading}
            />

            <ClearSkiesScore
              sunshineScore={sunshineScore}
              isLoading={showLoading && !current}
            />

            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Find brightest spot"
              onPress={() => router.push('/map')}>
              <Text style={styles.ctaLabel}>Find Brightest Spot</Text>
            </Pressable>

            <LocationCard
              name={featuredSpot.name}
              status={featuredSpot.status}
              temperature={featuredSpot.temperature}
              distanceText={featuredSpot.distanceText}
              sunshineScore={featuredSpot.sunshineScore}
              isHomeLocation={featuredSpot.isHomeLocation}
              isPlaceholder={featuredSpot.isPlaceholder}
              isLoading={
                showLoading && !homeLocation && !bestSunshine
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: '10%',
    right: '10%',
    height: 280,
    borderRadius: 200,
    backgroundColor: Colors.goldDeep,
    opacity: 0.22,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    right: -40,
    height: 240,
    borderRadius: 200,
    backgroundColor: Colors.navySoft,
    opacity: 0.9,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  hero: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts?.serif,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: Fonts?.serif,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: Colors.gold,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.lg,
  },
  ctaButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  ctaButtonPressed: {
    opacity: 0.88,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: Colors.navy,
  },
});
