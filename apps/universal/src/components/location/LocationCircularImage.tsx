import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { contentPositionFromFocalPoint } from '@/lib/location/locationCircularImage';
import type { FocalPoint } from '@whereskarl/schemas';

export const LOCATION_CIRCULAR_IMAGE_SIZE = 64;

type LocationCircularImageProps = {
  /** Canonical backend hero CDN URL — never a frontend lookup table. */
  imageUrl?: string | null;
  /** Normalized 0–1 crop center from the backend scene catalog. */
  focalPoint?: FocalPoint | null;
  /** Accessible name for the location landmark image. */
  alt?: string;
  size?: number;
};

/**
 * Canonical circular renderer for location hero imagery (mobile Web parity).
 * Consumes backend `imageUrl` + `focalPoint` only; missing/failed loads use
 * the product “Location Image / Coming Soon” placeholder — never a weather icon.
 */
export function LocationCircularImage({
  imageUrl,
  focalPoint,
  alt = 'Location',
  size = LOCATION_CIRCULAR_IMAGE_SIZE,
}: LocationCircularImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedUrl =
    typeof imageUrl === 'string' && imageUrl.trim().length > 0
      ? imageUrl.trim()
      : null;
  const showImage = Boolean(resolvedUrl) && !loadFailed;

  useEffect(() => {
    setLoadFailed(false);
  }, [resolvedUrl]);

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityLabel={showImage ? alt : 'Location image coming soon'}
      testID={
        showImage ? 'location-circular-image' : 'location-image-placeholder'
      }>
      {showImage ? (
        <Image
          source={{ uri: resolvedUrl! }}
          style={styles.image}
          contentFit="cover"
          contentPosition={contentPositionFromFocalPoint(focalPoint)}
          accessibilityLabel={alt}
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <View style={styles.placeholder} accessibilityElementsHidden>
          <Text style={styles.placeholderTitle}>Location Image</Text>
          <Text style={styles.placeholderEyebrow}>Coming Soon</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  placeholderTitle: {
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 10,
    letterSpacing: -0.1,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  placeholderEyebrow: {
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.45)',
  },
});
