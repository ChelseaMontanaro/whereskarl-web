import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type KarlMapOverlayStateProps = {
  message: string;
  isLoading?: boolean;
};

export function KarlMapOverlayState({
  message,
  isLoading = false,
}: KarlMapOverlayStateProps) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.card}>
        {isLoading ? <ActivityIndicator color={Colors.gold} /> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(3, 11, 20, 0.42)',
  },
  card: {
    maxWidth: 320,
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
