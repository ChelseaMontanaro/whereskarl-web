import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { buildMapHref } from '@/lib/navigation';

type FindClearSkiesCtaProps = {
  locationId: string | null;
  isLoading: boolean;
  variant?: 'primary' | 'header';
};

/**
 * Mobile-web primary CTA fill:
 * bg-gradient-to-b from-[rgb(255_196_71)] via-karl-gold to-karl-gold-deep
 * karl-gold = rgb(242,163,38); karl-gold-deep = rgb(148,92,20)
 *
 * Fill only — never geometry. The 8pt-wide source is stretched to the button
 * width, so any corner radius here is scaled into an ellipse; the pill shape
 * comes from the image's own borderRadius instead.
 */
const PRIMARY_GRADIENT_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="52" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(255,196,71)"/>
          <stop offset="50%" stop-color="rgb(242,163,38)"/>
          <stop offset="100%" stop-color="rgb(148,92,20)"/>
        </linearGradient>
      </defs>
      <rect width="8" height="52" fill="url(#g)"/>
    </svg>`,
  );

export function FindClearSkiesCta({
  locationId,
  isLoading,
  variant = 'header',
}: FindClearSkiesCtaProps) {
  const href = buildMapHref(locationId);

  function handlePress() {
    router.push(href as '/map');
  }

  if (variant === 'header') {
    if (isLoading) {
      return (
        <Text style={styles.headerLoading} accessibilityState={{ busy: true }}>
          Finding clear skies…
        </Text>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Find Clear Skies"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.headerLabel}>Find Clear Skies</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Find Clear Skies"
      accessibilityState={{ disabled: isLoading }}
      disabled={isLoading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.primaryButton,
        isLoading && styles.primaryDisabled,
        pressed && !isLoading && styles.pressed,
      ]}>
      <Image
        source={{ uri: PRIMARY_GRADIENT_URI }}
        style={styles.primaryGradient}
        contentFit="fill"
        accessibilityElementsHidden
      />
      <View style={styles.primaryLabelWrap}>
        <Text style={styles.primaryLabel} allowFontScaling={false}>
          {isLoading ? 'Finding clear skies…' : 'Find Clear Skies'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minHeight: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(242, 163, 38, 0.35)',
    backgroundColor: 'rgba(242, 163, 38, 0.14)',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  headerLoading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButton: {
    alignSelf: 'stretch',
    minHeight: 52,
    borderRadius: Radius.pill,
    // Base fill under the gradient: keeps the shadow path solid and the pill
    // gold before the gradient decodes. `overflow: hidden` would clip the
    // shadow on iOS, so the gradient clips itself instead.
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Web: shadow-[0_10px_24px_rgba(0,0,0,0.28)]. CSS blur is ~2x the iOS
    // shadow radius, so 24px blur maps to shadowRadius 12.
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  primaryGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.pill,
  },
  primaryLabelWrap: {
    zIndex: 1,
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    // Web text-sm font-bold tracking-[0.12em]
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.68,
    textTransform: 'uppercase',
    color: 'rgb(46, 31, 10)',
  },
  pressed: {
    opacity: 0.88,
  },
});
