import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export type MapScreenViewMode = 'list' | 'map';

type MapViewModeToggleProps = {
  mode: MapScreenViewMode;
  onModeChange: (mode: MapScreenViewMode) => void;
};

const OPTIONS: { id: MapScreenViewMode; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'map', label: 'Map' },
];

export function MapViewModeToggle({
  mode,
  onModeChange,
}: MapViewModeToggleProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {OPTIONS.map((option) => {
        const isActive = mode === option.id;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onModeChange(option.id)}
            style={({ pressed }) => [
              styles.segment,
              isActive && styles.segmentActive,
              pressed && styles.segmentPressed,
            ]}>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    padding: 3,
    gap: 2,
  },
  segment: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  segmentActive: {
    backgroundColor: 'rgba(242, 163, 38, 0.18)',
  },
  segmentPressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.gold,
  },
});
