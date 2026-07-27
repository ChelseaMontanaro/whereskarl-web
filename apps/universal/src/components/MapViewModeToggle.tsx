import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export type MapScreenViewMode = 'list' | 'map';

type MapViewModeToggleProps = {
  mode: MapScreenViewMode;
  onModeChange: (mode: MapScreenViewMode) => void;
  compact?: boolean;
};

const OPTIONS: { id: MapScreenViewMode; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'map', label: 'Map' },
];

export function MapViewModeToggle({
  mode,
  onModeChange,
  compact = false,
}: MapViewModeToggleProps) {
  return (
    <View
      style={[styles.container, compact && styles.containerCompact]}
      accessibilityRole="tablist">
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
              compact && styles.segmentCompact,
              isActive && styles.segmentActive,
              pressed && styles.segmentPressed,
            ]}>
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                isActive && styles.labelActive,
              ]}>
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
  containerCompact: {
    padding: 2,
  },
  segment: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  segmentCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  labelCompact: {
    fontSize: 12,
  },
  labelActive: {
    color: Colors.gold,
  },
});
