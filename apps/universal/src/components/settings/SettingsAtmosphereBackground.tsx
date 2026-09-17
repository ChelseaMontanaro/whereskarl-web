import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { SettingsChrome } from '@/lib/settings/settingsChrome';
import {
  resolveSettingsAtmosphereContentPosition,
  resolveSettingsAtmosphereImageUrl,
} from '@/lib/settings/settingsAtmosphere';

/**
 * Phase 26 — full-view photographic Settings background.
 *
 * APPROVED ASSET: existing production hero `hero/marin-headlands/day.png`,
 * resolved through Home's frozen `heroCdnUrlForKey` helper. Page-level Bay
 * Area / Golden Gate / fog atmosphere only — never a specific Home Location.
 *
 * Overlay recipe is Settings-local and lighter than Favorites: Settings uses
 * dark type on light glass, so the photograph stays bright instead of being
 * graded into navy.
 */

const ATMOSPHERE_URL = resolveSettingsAtmosphereImageUrl();
const PHOTO_CONTENT_POSITION = resolveSettingsAtmosphereContentPosition();

function buildLightAtmosphereUri(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0.12"/>
            <stop offset="38%" stop-color="rgb(255,255,255)" stop-opacity="0.04"/>
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0.08"/>
          </linearGradient>
        </defs>
        <rect width="8" height="100" fill="url(#a)"/>
      </svg>`,
    )
  );
}

/** Soft light wash so dark footer type stays readable over the lower photo. */
const BOTTOM_WASH_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0"/>
          <stop offset="45%" stop-color="rgb(232,240,247)" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="rgb(232,240,247)" stop-opacity="0.42"/>
        </linearGradient>
      </defs>
      <rect width="8" height="100" fill="url(#w)"/>
    </svg>`,
  );

const ATMOSPHERE_URI = buildLightAtmosphereUri();

export function SettingsAtmosphereBackground() {
  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden>
      {ATMOSPHERE_URL ? (
        <Image
          source={{ uri: ATMOSPHERE_URL }}
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
        source={{ uri: BOTTOM_WASH_URI }}
        style={styles.bottomWash}
        contentFit="fill"
        accessibilityElementsHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SettingsChrome.fallbackAtmosphere,
  },
  image: {
    ...StyleSheet.absoluteFill,
    transform: [{ scale: 1.02 }],
  },
  gradientFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SettingsChrome.fallbackAtmosphere,
  },
  fullBleedOverlay: {
    ...StyleSheet.absoluteFill,
  },
  bottomWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
  },
});
