import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import {
  activeHeroImageUrl,
  selectHeroImageSource,
  type HeroPresentation,
} from '@/lib/home/heroPresentation';

type HomeHeroBackgroundProps = {
  presentation: HeroPresentation;
};

/**
 * Soft SVG fades ported from mobile-web HomeDesktopBackground (lg:hidden layers).
 * Hard-edged solid Views (esp. bottomLead height 55%) caused the physical gray band.
 */
/**
 * Web composites this navy gradient with `mix-blend-soft-light` (see
 * apps/web HomeDesktopBackground). expo-image exposes no blend mode, so native
 * was landing the same alphas as flat source-over navy. Soft light barely
 * touches shadows but is far gentler on mid and bright tones, whereas plain
 * alpha darkens everything proportionally — the gray veil and lost separation
 * seen on the physical iPhone.
 *
 * Measured against the soft-light result over the alphas this gradient actually
 * uses (0.07–0.19, from atmosphere opacity × web's 0.5 / 0.34), full alpha cost
 * up to 21.7 luminance points on bright tones and nothing in deep shadow.
 * Halving is the closest single scalar: error drops to −4.6…+0.5 points across
 * shadow-to-midtone, and −9.8 at near-white specular highlights.
 *
 * This corrects only the missing blend mode. Web additionally grades the photo
 * with `brightness(1.06) contrast(1.1) saturate(1.14)`, which native cannot
 * reproduce without the experimental SwiftUI filter path; that gap remains and
 * is deliberately not guessed at here.
 */
function buildAtmosphereUri(topOpacity: number, bottomOpacity: number): string {
  const top = topOpacity * 0.25;
  const bottom = bottomOpacity * 0.17;
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(3,11,20)" stop-opacity="${top}"/>
            <stop offset="42%" stop-color="rgb(3,11,20)" stop-opacity="0.02"/>
            <stop offset="100%" stop-color="rgb(3,11,20)" stop-opacity="${bottom}"/>
          </linearGradient>
        </defs>
        <rect width="8" height="100" fill="url(#a)"/>
      </svg>`,
    )
  );
}

/** CSS linear-gradient(0deg, …) — first stop at bottom; SVG mapped top→bottom. */
function buildBottomLeadUri(leadOpacity: number, midOpacity: number): string {
  const lead = leadOpacity * 0.3;
  const mid = midOpacity * 0.16;
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0.04"/>
            <stop offset="32%" stop-color="rgb(0,0,0)" stop-opacity="0.1"/>
            <stop offset="62%" stop-color="rgb(0,0,0)" stop-opacity="${mid}"/>
            <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="${lead}"/>
          </linearGradient>
        </defs>
        <rect width="8" height="100" fill="url(#b)"/>
      </svg>`,
    )
  );
}

/** Web: h-2/5 bg-gradient-to-t from-black/42 via-black/16 to-transparent */
const BOTTOM_FADE_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
          <stop offset="40%" stop-color="rgb(0,0,0)" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.42"/>
        </linearGradient>
      </defs>
      <rect width="8" height="100" fill="url(#f)"/>
    </svg>`,
  );

export function HomeHeroBackground({ presentation }: HomeHeroBackgroundProps) {
  const [remoteLoadFailed, setRemoteLoadFailed] = useState(false);
  const [fallbackLoadFailed, setFallbackLoadFailed] = useState(false);
  const imageSource = selectHeroImageSource({
    imageUrl: presentation.imageUrl,
    fallbackImageUrl: presentation.fallbackImageUrl,
    remoteLoadFailed,
    fallbackLoadFailed,
  });
  const heroImageUrl = activeHeroImageUrl(presentation, imageSource);

  const atmosphereUri = useMemo(
    () =>
      buildAtmosphereUri(
        presentation.atmosphereTopOpacity,
        presentation.atmosphereBottomOpacity,
      ),
    [presentation.atmosphereTopOpacity, presentation.atmosphereBottomOpacity],
  );

  const bottomLeadUri = useMemo(
    () =>
      buildBottomLeadUri(
        presentation.bottomGradientLeadOpacity,
        presentation.bottomGradientMidOpacity,
      ),
    [
      presentation.bottomGradientLeadOpacity,
      presentation.bottomGradientMidOpacity,
    ],
  );

  useEffect(() => {
    setRemoteLoadFailed(false);
    setFallbackLoadFailed(false);
  }, [presentation.stabilityKey]);

  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden>
      {heroImageUrl ? (
        <Image
          key={`${presentation.stabilityKey}|${imageSource}`}
          source={{ uri: heroImageUrl }}
          style={styles.image}
          contentFit="cover"
          onError={() => {
            if (imageSource === 'remote') {
              setRemoteLoadFailed(true);
              return;
            }
            setFallbackLoadFailed(true);
          }}
        />
      ) : (
        <View style={styles.gradientFallback} />
      )}

      <Image
        source={{ uri: atmosphereUri }}
        style={styles.fullBleedOverlay}
        contentFit="fill"
        accessibilityElementsHidden
      />
      <Image
        source={{ uri: bottomLeadUri }}
        style={styles.fullBleedOverlay}
        contentFit="fill"
        accessibilityElementsHidden
      />
      <Image
        source={{ uri: BOTTOM_FADE_URI }}
        style={styles.bottomFade}
        contentFit="fill"
        accessibilityElementsHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.navy,
  },
  image: {
    ...StyleSheet.absoluteFill,
    transform: [{ scale: 1.02 }],
  },
  gradientFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.navy,
  },
  fullBleedOverlay: {
    ...StyleSheet.absoluteFill,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
});
