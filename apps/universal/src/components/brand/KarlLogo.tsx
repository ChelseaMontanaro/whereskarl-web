import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { KARL_LOGO_IMAGE } from '@/lib/brand/karlLogo';

type KarlLogoProps = {
  size?: number;
};

export function KarlLogo({ size = 32 }: KarlLogoProps) {
  return (
    <View
      style={[styles.root, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Image
        source={KARL_LOGO_IMAGE}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityElementsHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
