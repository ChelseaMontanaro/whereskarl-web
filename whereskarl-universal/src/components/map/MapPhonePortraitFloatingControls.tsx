import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { Colors } from '@/constants/theme';

type MapPhonePortraitFloatingControlsProps = {
  onLocateMe?: () => void;
  onResetView?: () => void;
  onOpenLayers?: () => void;
};

export function MapPhonePortraitFloatingControls({
  onLocateMe,
  onResetView,
  onOpenLayers,
}: MapPhonePortraitFloatingControlsProps) {
  return (
    <View style={styles.root} pointerEvents="box-none">
      {onOpenLayers ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open map layers"
          onPress={onOpenLayers}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.icon}>☰</Text>
        </Pressable>
      ) : null}

      {onLocateMe ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Locate me"
          onPress={onLocateMe}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.icon}>⌖</Text>
        </Pressable>
      ) : null}

      {onResetView ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset map view"
          onPress={onResetView}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.icon}>◎</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 10,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(3, 11, 20, 0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  icon: {
    fontSize: 18,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.88,
  },
});
