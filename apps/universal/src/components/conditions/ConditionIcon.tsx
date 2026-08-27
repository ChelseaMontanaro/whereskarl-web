import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { getConditionIconDataUri } from '@/lib/map/conditionIcons';
import type { FogIntensity } from '@whereskarl/domain';

type ConditionIconProps = {
  intensity: FogIntensity;
  isNighttime?: boolean;
  size?: number;
};

/**
 * Condition artwork for native + web. expo-image is required on iOS/Android
 * because React Native Image does not render SVG data URIs.
 */
export function ConditionIcon({
  intensity,
  isNighttime = false,
  size = 22,
}: ConditionIconProps) {
  const uri = getConditionIconDataUri(intensity, { isNighttime });

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityElementsHidden>
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityElementsHidden
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
