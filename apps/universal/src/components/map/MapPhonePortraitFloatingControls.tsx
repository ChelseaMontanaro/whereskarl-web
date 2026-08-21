import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type MapPhonePortraitFloatingControlsProps = {
  onOpenLayers?: () => void;
  /** Optional native extras — hidden by default on phone to match Web. */
  onLocateMe?: () => void;
  onResetView?: () => void;
  showUtilityControls?: boolean;
};

/**
 * Compact floating map controls. Phone default is Layers-only (mobile Web).
 * Locate/reset remain available when explicitly enabled.
 */
export function MapPhonePortraitFloatingControls({
  onOpenLayers,
  onLocateMe,
  onResetView,
  showUtilityControls = false,
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

      {showUtilityControls && onLocateMe ? (
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

      {showUtilityControls && onResetView ? (
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
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(3, 11, 20, 0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  icon: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
  },
});
