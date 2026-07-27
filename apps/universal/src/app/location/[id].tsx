import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KarlReadCardFromLocation } from '@/components/KarlReadCard';
import { LocationConditionsHero } from '@/components/LocationConditionsHero';
import { LocationForecastPreview } from '@/components/LocationForecastPreview';
import { LocationMetricsRow } from '@/components/LocationMetricsRow';
import { SelectedLocationHeader } from '@/components/SelectedLocationHeader';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useHomeLocation } from '@/hooks/useHomeLocation';
import { useLocationDetail } from '@/hooks/useLocationDetail';
import {
  getLocationConfidenceCopy,
  getLocationForecastPreviewItems,
  getLocationMetrics,
} from '@/lib/location/detailDisplay';
import { getCloudSummary } from '@/lib/map/locationsDisplay';

const PLACEHOLDER_LOCATION = {
  name: 'Bay Area location',
  region: 'Bay Area',
  distanceText: '—',
  status: 'Sample conditions while live data loads',
  sunshineScore: 42,
  temperature: 58,
  fogScore: 58,
  cloudCover: 62,
  karlReason:
    'Karl is still gathering a read for this spot. Check back shortly for live intelligence.',
  primaryDrivers: ['Live API unavailable', 'Showing sample layout'],
  microclimateFactors: [] as string[],
  prediction: {},
  confidenceLabel: '',
  confidenceExplanation: '',
};

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    locationId,
    location,
    isLoading,
    isRefreshing,
    error,
    hasLiveData,
    refresh,
  } = useLocationDetail(id);
  const { homeLocationId, setHomeLocationId } = useHomeLocation([]);
  const [homeSavedMessage, setHomeSavedMessage] = useState<string | null>(null);

  const showInitialLoading = isLoading && !location;
  const isMissingLocation =
    !showInitialLoading && Boolean(locationId) && !location && !error;
  const isApiUnavailable = !hasLiveData && !isLoading && Boolean(error);

  const displayLocation = location ?? PLACEHOLDER_LOCATION;
  const metrics = useMemo(
    () => (location ? getLocationMetrics(location) : []),
    [location],
  );
  const forecastItems = useMemo(
    () => (location ? getLocationForecastPreviewItems(location) : []),
    [location],
  );
  const confidence = location
    ? getLocationConfidenceCopy(location)
    : { label: null, explanation: null };

  const isHomeLocation =
    Boolean(locationId) &&
    Boolean(homeLocationId) &&
    homeLocationId?.trim().toLowerCase() === locationId?.trim().toLowerCase();

  async function handleSetHomeLocation() {
    if (!location) {
      setHomeSavedMessage(
        'Home location can be saved once live conditions finish loading.',
      );
      return;
    }

    await setHomeLocationId(location.id);
    setHomeSavedMessage(`${location.name} is now your home location.`);
  }

  function handleViewOnMapPress() {
    if (!locationId) {
      return;
    }

    router.push({
      pathname: '/map',
      params: {
        view: 'map',
        selected: locationId,
      },
    });
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.vignette} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={Colors.gold}
            />
          }>
          <SelectedLocationHeader
            name={displayLocation.name}
            region={displayLocation.region ?? 'Bay Area'}
            distanceText={displayLocation.distanceText}
            isHomeLocation={isHomeLocation}
            onBack={() => router.back()}
            isLoading={showInitialLoading}
          />

          {showInitialLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={Colors.gold} />
              <Text style={styles.loadingText}>Loading live location details…</Text>
            </View>
          ) : null}

          {isMissingLocation ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Location not found</Text>
              <Text style={styles.stateBody}>
                That Bay Area spot isn&apos;t in the current live feed. Try
                returning to search and choosing another location.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.secondaryButtonLabel}>Back to search</Text>
              </Pressable>
            </View>
          ) : null}

          {isApiUnavailable && !location ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Live data unavailable</Text>
              <Text style={styles.stateBody}>
                Karl can&apos;t reach the weather service right now. Set
                EXPO_PUBLIC_API_URL or pull to refresh when the API is back.
              </Text>
            </View>
          ) : null}

          {!isMissingLocation ? (
            <>
              <LocationConditionsHero
                location={displayLocation}
                isLoading={showInitialLoading || isApiUnavailable}
              />

              {confidence.label || confidence.explanation ? (
                <View style={styles.confidenceCard}>
                  <Text style={styles.confidenceTitle}>Confidence</Text>
                  {confidence.label ? (
                    <Text style={styles.confidenceLabel}>{confidence.label}</Text>
                  ) : null}
                  {confidence.explanation ? (
                    <Text style={styles.confidenceExplanation}>
                      {confidence.explanation}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <LocationMetricsRow
                metrics={
                  metrics.length > 0
                    ? metrics
                    : [
                        {
                          label: 'Temperature',
                          value: `${Math.round(displayLocation.temperature)}°`,
                        },
                        {
                          label: 'Clear skies',
                          value: `${Math.round(displayLocation.sunshineScore)}%`,
                        },
                      ]
                }
                isLoading={showInitialLoading}
              />

              <KarlReadCardFromLocation
                karlReason={displayLocation.karlReason}
                status={displayLocation.status}
                primaryDrivers={displayLocation.primaryDrivers}
                microclimateFactors={displayLocation.microclimateFactors}
                isLoading={showInitialLoading}
              />

              <LocationForecastPreview
                items={forecastItems}
                isLoading={showInitialLoading}
              />

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View on map"
                  onPress={handleViewOnMapPress}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.secondaryButtonLabel}>View on Map</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Set as home location"
                  onPress={handleSetHomeLocation}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    isHomeLocation && styles.primaryButtonActive,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    style={[
                      styles.primaryButtonLabel,
                      isHomeLocation && styles.primaryButtonLabelActive,
                    ]}>
                    {isHomeLocation
                      ? 'Home Location Saved'
                      : 'Set as Home Location'}
                  </Text>
                </Pressable>
              </View>

              {homeSavedMessage ? (
                <Text style={styles.feedback}>{homeSavedMessage}</Text>
              ) : null}

              {location ? (
                <Text style={styles.footerNote}>
                  {getCloudSummary(location)}
                </Text>
              ) : null}
            </>
          ) : null}
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
    top: -100,
    left: '8%',
    right: '8%',
    height: 240,
    borderRadius: 200,
    backgroundColor: Colors.goldDeep,
    opacity: 0.18,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  loadingCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stateCard: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.lg,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stateBody: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  confidenceCard: {
    gap: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    padding: Spacing.md,
  },
  confidenceTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gold,
  },
  confidenceExplanation: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  primaryButtonActive: {
    backgroundColor: 'rgba(242, 163, 38, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(242, 163, 38, 0.45)',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
  primaryButtonLabelActive: {
    color: Colors.gold,
  },
  feedback: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gold,
    textAlign: 'center',
  },
  feedbackMuted: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
