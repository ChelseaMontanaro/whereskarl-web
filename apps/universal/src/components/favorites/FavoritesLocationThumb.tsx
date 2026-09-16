import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { contentPositionFromFocalPoint } from '@/lib/location/locationCircularImage';
import type { FocalPoint } from '@whereskarl/schemas';

type FavoritesLocationThumbProps = {
  imageUrl?: string | null;
  focalPoint?: FocalPoint | null;
  locationName: string;
  size?: number;
};

/**
 * Favorites-local location thumb. Uses only the location's own canonical
 * `imageUrl` + `focalPoint`. Missing or failed loads use a non-photographic
 * initial — never the page atmosphere photo, never another location's image.
 */
export function FavoritesLocationThumb({
  imageUrl,
  focalPoint,
  locationName,
  size = 44,
}: FavoritesLocationThumbProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedUrl =
    typeof imageUrl === 'string' && imageUrl.trim().length > 0
      ? imageUrl.trim()
      : null;
  const showImage = Boolean(resolvedUrl) && !loadFailed;
  const initial = locationName.trim().charAt(0).toUpperCase() || '·';

  useEffect(() => {
    setLoadFailed(false);
  }, [resolvedUrl]);

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: Radius.sm },
      ]}
      accessibilityLabel={
        showImage ? locationName : `${locationName} image unavailable`
      }>
      {showImage ? (
        <Image
          source={{ uri: resolvedUrl! }}
          style={styles.image}
          contentFit="cover"
          contentPosition={contentPositionFromFocalPoint(focalPoint)}
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <Text style={styles.initial} accessibilityElementsHidden>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.72)',
  },
});
