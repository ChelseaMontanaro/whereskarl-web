import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';

/**
 * Phase 25 visual-parity correction — the approved mockup's empty state
 * reads as content sitting directly in the atmospheric backdrop, not a
 * boxed placeholder. The outer bordered/filled container from the prior
 * pass has been removed; the heart ring is now a single restrained outline
 * (no filled circle behind it) and the CTA is a filled blue button (per
 * the approved mockup) instead of the gold-outline treatment.
 */
export function FavoritesEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.heartBadge} accessibilityElementsHidden>
        <Text style={styles.heartGlyph}>♡</Text>
      </View>
      <Text style={styles.title}>No favorites yet</Text>
      <Text style={styles.description}>
        Save your favorite Bay Area locations to quickly check conditions and
        find the best days to get outside.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Explore the map"
        onPress={() => router.push('/map')}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonLabel}>Explore the Map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
  },
  heartBadge: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heartGlyph: {
    fontSize: 34,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    marginTop: Spacing.xs + 2,
    borderRadius: 14,
    backgroundColor: '#0A84FF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
