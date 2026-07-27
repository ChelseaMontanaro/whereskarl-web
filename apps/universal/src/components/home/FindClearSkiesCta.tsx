import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { buildMapHref } from '@/lib/navigation';

type FindClearSkiesCtaProps = {
  locationId: string | null;
  isLoading: boolean;
  variant?: 'primary' | 'header';
};

export function FindClearSkiesCta({
  locationId,
  isLoading,
  variant = 'header',
}: FindClearSkiesCtaProps) {
  const href = buildMapHref(locationId);

  function handlePress() {
    router.push(href as '/map');
  }

  if (variant === 'header') {
    if (isLoading) {
      return (
        <Text style={styles.headerLoading} accessibilityState={{ busy: true }}>
          Finding clear skies…
        </Text>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Find Clear Skies"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.headerLabel}>Find Clear Skies</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Find Clear Skies"
      accessibilityState={{ disabled: isLoading }}
      disabled={isLoading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.primaryButton,
        isLoading && styles.primaryDisabled,
        pressed && !isLoading && styles.pressed,
      ]}>
      <Text style={styles.primaryLabel}>
        {isLoading ? 'Finding clear skies…' : 'Find Clear Skies'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minHeight: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(242, 163, 38, 0.35)',
    backgroundColor: 'rgba(242, 163, 38, 0.14)',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  headerLoading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgb(46, 31, 10)',
  },
  pressed: {
    opacity: 0.88,
  },
});
