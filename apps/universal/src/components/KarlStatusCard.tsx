import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type KarlStatusCardProps = {
  headline: string;
  subheadline: string;
  confidenceText?: string | null;
  isLoading?: boolean;
};

export function KarlStatusCard({
  headline,
  subheadline,
  confidenceText,
  isLoading = false,
}: KarlStatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {isLoading ? 'Reading Karl intelligence' : "Karl's current position"}
        </Text>
      </View>

      <Text style={[styles.headline, isLoading && styles.headlineLoading]}>
        {headline}
      </Text>

      <Text style={styles.subheadline}>{subheadline}</Text>

      {confidenceText ? (
        <Text style={styles.confidence}>{confidenceText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.78)',
  },
  headline: {
    fontFamily: Fonts?.serif,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 30,
    color: Colors.textPrimary,
    maxWidth: '90%',
  },
  headlineLoading: {
    opacity: 0.7,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
    maxWidth: '92%',
  },
  confidence: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
