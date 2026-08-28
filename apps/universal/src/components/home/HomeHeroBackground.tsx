import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
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

/** Full-bleed hero imagery + overlays — mirrors HomeDesktopBackground (mobile). */
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

      <View
        style={[
          styles.atmosphere,
          {
            backgroundColor: `rgba(3,11,20,${presentation.atmosphereTopOpacity * 0.5})`,
          },
        ]}
      />
      <View
        style={[
          styles.bottomLead,
          {
            backgroundColor: `rgba(0,0,0,${presentation.bottomGradientLeadOpacity * 0.3})`,
          },
        ]}
      />
      <View style={styles.bottomFade} />
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
  atmosphere: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  bottomLead: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
});
