import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type KarlLogoProps = {
  size?: number;
};

export function KarlLogo({ size = 32 }: KarlLogoProps) {
  return (
    <View
      style={[styles.root, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text style={[styles.cloud, { fontSize: size * 0.62 }]}>☁</Text>
      <View style={[styles.waves, { width: size * 0.72 }]}>
        <View style={styles.wave} />
        <View style={[styles.wave, styles.waveMid]} />
        <View style={[styles.wave, styles.waveBack]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloud: {
    lineHeight: undefined,
    color: Colors.textPrimary,
    marginBottom: -2,
  },
  waves: {
    height: 6,
    justifyContent: 'flex-end',
    gap: 2,
  },
  wave: {
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.gold,
    opacity: 0.9,
  },
  waveMid: {
    width: '78%',
    alignSelf: 'center',
    opacity: 0.65,
  },
  waveBack: {
    width: '56%',
    alignSelf: 'center',
    opacity: 0.4,
  },
});
