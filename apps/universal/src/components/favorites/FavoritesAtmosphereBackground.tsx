import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import {
  resolveFavoritesAtmosphereContentPosition,
  resolveFavoritesAtmosphereImageUrl,
} from '@/lib/favorites/favoritesAtmosphere';

/**
 * Phase 25 — full-view photographic Favorites background.
 *
 * APPROVED ASSET: the existing production hero `hero/marin-headlands/day.png`,
 * resolved through Home's frozen `heroCdnUrlForKey` helper. Page-level Bay
 * Area / Golden Gate / fog atmosphere only — never a specific saved location.
 *
 * Presentation matches `HomeHeroBackground` technique (read-only reference):
 * full-bleed `expo-image` with `contentFit="cover"`, slight overscan, and
 * the same soft SVG overlay recipe Home uses for mixed-bay daytime on this
 * exact marin-headlands asset. Overlays are photo-first: they keep header
 * and cards readable without flattening the photograph into navy.
 */

const MARIN_HEADLANDS_DAY_URL = resolveFavoritesAtmosphereImageUrl();
const PHOTO_CONTENT_POSITION = resolveFavoritesAtmosphereContentPosition();

/**
 * HomeHeroBackground mixed-bay day atmosphere, including the native
 * soft-light compensation multipliers (top×0.25, bottom×0.17).
 */
function buildAtmosphereUri(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(3,11,20)" stop-opacity="0.05"/>
            <stop offset="42%" stop-color="rgb(3,11,20)" stop-opacity="0.02"/>
            <stop offset="100%" stop-color="rgb(3,11,20)" stop-opacity="0.0714"/>
          </linearGradient>
        </defs>
        <rect width="8" height="100" fill="url(#a)"/>
      </svg>`,
    )
  );
}

function buildBottomLeadUri(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0.04"/>
            <stop offset="32%" stop-color="rgb(0,0,0)" stop-opacity="0.1"/>
            <stop offset="62%" stop-color="rgb(0,0,0)" stop-opacity="0.0768"/>
            <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.216"/>
          </linearGradient>
        </defs>
        <rect width="8" height="100" fill="url(#b)"/>
      </svg>`,
    )
  );
}

/** Home: h-2/5 from-black/42 via-black/16 to-transparent */
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

const ATMOSPHERE_URI = buildAtmosphereUri();
const BOTTOM_LEAD_URI = buildBottomLeadUri();

export function FavoritesAtmosphereBackground() {
  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden>
      {MARIN_HEADLANDS_DAY_URL ? (
        <Image
          source={{ uri: MARIN_HEADLANDS_DAY_URL }}
          style={styles.image}
          contentFit="cover"
          contentPosition={PHOTO_CONTENT_POSITION}
          accessibilityElementsHidden
        />
      ) : (
        <View style={styles.gradientFallback} />
      )}
      <Image
        source={{ uri: ATMOSPHERE_URI }}
        style={styles.fullBleedOverlay}
        contentFit="fill"
        accessibilityElementsHidden
      />
      <Image
        source={{ uri: BOTTOM_LEAD_URI }}
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
