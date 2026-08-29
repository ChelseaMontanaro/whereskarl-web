import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FindClearSkiesCta } from '@/components/home/FindClearSkiesCta';
import { Colors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

type HomeHeroProps = {
  headline: string;
  subheadline: string;
  confidenceText: string | null;
  isLoading: boolean;
  clearSkiesLocationId: string | null;
  isFindingClearSkies: boolean;
};

function HeroPositionBadge({ isLoading }: { isLoading: boolean }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel} allowFontScaling={false}>
        {isLoading ? "Reading Karl intelligence" : "Karl's current position"}
      </Text>
    </View>
  );
}

/**
 * Mobile-web HomeHero phone rule: min-h-[min(560px,70vh)].
 * Dimensions only — no device-model branching.
 */
export function resolveHeroMinHeight(windowHeight: number): number {
  return Math.min(560, Math.round(windowHeight * 0.7));
}

export function HomeHero({
  headline,
  subheadline,
  confidenceText,
  isLoading,
  clearSkiesLocationId,
  isFindingClearSkies,
}: HomeHeroProps) {
  const { height: windowHeight } = useWindowDimensions();

  return (
    <View
      style={[styles.section, { minHeight: resolveHeroMinHeight(windowHeight) }]}
      accessibilityLabel="Karl conditions hero">
      <View style={styles.brand}>
        <Text style={styles.title} allowFontScaling={false}>
          Where&apos;s Karl?
        </Text>
        <Text
          style={styles.tagline}
          allowFontScaling={false}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          Track Karl across the Bay
        </Text>
      </View>

      <View style={styles.copyBlock}>
        <HeroPositionBadge isLoading={isLoading} />
        <Text
          style={[styles.headline, isLoading && styles.loadingText]}
          allowFontScaling={false}>
          {headline}
        </Text>
        <Text style={styles.subheadline} allowFontScaling={false}>
          {subheadline}
        </Text>
        {confidenceText ? (
          <Text style={styles.confidence} allowFontScaling={false}>
            {confidenceText}
          </Text>
        ) : null}
        <View style={styles.ctaWrap}>
          <FindClearSkiesCta
            locationId={clearSkiesLocationId}
            isLoading={isFindingClearSkies}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  brand: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  title: {
    fontFamily: Fonts?.serif,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Colors.textPrimary,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.52)',
    textShadowOffset: { width: 0, height: 7 },
    textShadowRadius: 16,
  },
  tagline: {
    fontFamily: Fonts?.serif,
    // Web text-xs; keep one line on physical iPhone.
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    // Final optical calibration: reuses the exact canonical sun-icon color.
    // CLEAR_SUN_ONLY_ICON (lib/map/phonePortraitConditionIcons.ts — the sun
    // behind Clear Skies Score / Clearest Spot) draws its outer disc AND its
    // rays in `#F2A326`, with only a smaller `#F6C15A` inner highlight for
    // dimensionality. `#F2A326` is the icon's identifying color and is
    // `Colors.gold` (rgb(242,163,38)) verbatim — reused as-is, not derived.
    color: Colors.gold,
    textAlign: 'center',
  },
  copyBlock: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.78)',
  },
  headline: {
    marginTop: 16,
    maxWidth: 280,
    fontFamily: Fonts?.serif,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 30,
    color: 'rgba(255,255,255,0.98)',
    textShadowColor: 'rgba(0,0,0,0.56)',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 14,
  },
  loadingText: {
    opacity: 0.7,
  },
  subheadline: {
    marginTop: 12,
    maxWidth: 320,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.46)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  confidence: {
    marginTop: 14,
    maxWidth: 320,
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.48)',
  },
  ctaWrap: {
    marginTop: 24,
    marginBottom: 14,
  },
});
