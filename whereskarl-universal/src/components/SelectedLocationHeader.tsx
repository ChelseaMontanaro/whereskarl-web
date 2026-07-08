import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type SelectedLocationHeaderProps = {
  name: string;
  region?: string | null;
  distanceText?: string | null;
  isHomeLocation?: boolean;
  onBack?: () => void;
  isLoading?: boolean;
};

export function SelectedLocationHeader({
  name,
  region,
  distanceText,
  isHomeLocation = false,
  onBack,
  isLoading = false,
}: SelectedLocationHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.titleBlock}>
        {isHomeLocation ? <HomeLocationBadge /> : null}
        <Text style={styles.eyebrow}>
          {isLoading ? 'Loading location' : region ?? 'Bay Area location'}
        </Text>
        <Text style={styles.name}>{isLoading ? 'Reading conditions…' : name}</Text>
        {distanceText ? <Text style={styles.distance}>{distanceText}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonPressed: {
    opacity: 0.86,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  titleBlock: {
    gap: Spacing.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  name: {
    fontFamily: Fonts?.serif,
    fontSize: 30,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  distance: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
