import { Image, StyleSheet, View } from 'react-native';

import { getConditionIconDataUri } from '@/lib/map/conditionIcons';
import type { FogIntensity } from '@/lib/map/locationsDisplay';

type ConditionIconProps = {
  intensity: FogIntensity;
  isNighttime?: boolean;
  size?: number;
};

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
        resizeMode="contain"
        accessibilityElementsHidden
        alt=""
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
