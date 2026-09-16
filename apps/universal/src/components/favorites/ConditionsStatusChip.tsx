import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import {
  conditionsStatusAccessibilityLabel,
  conditionsStatusLabel,
  type ConditionsPresentation,
} from '@/lib/home/conditionsStatus';

type ConditionsStatusChipProps = {
  presentation: ConditionsPresentation;
};

const PRESENTATION_COLORS: Record<ConditionsPresentation, string> = {
  loading: 'rgba(255, 255, 255, 0.45)',
  live: Colors.gold,
  estimated: 'rgba(255, 255, 255, 0.72)',
  cached: 'rgba(255, 255, 255, 0.72)',
  unavailable: 'rgba(255, 255, 255, 0.45)',
};

export function ConditionsStatusChip({
  presentation,
}: ConditionsStatusChipProps) {
  const label = conditionsStatusLabel(presentation);
  const dotColor = PRESENTATION_COLORS[presentation];

  return (
    <View
      style={styles.chip}
      accessibilityRole="text"
      accessibilityLabel={conditionsStatusAccessibilityLabel(presentation)}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.72)',
  },
});
