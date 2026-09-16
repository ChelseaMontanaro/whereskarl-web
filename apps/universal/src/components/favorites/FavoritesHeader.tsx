import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function FavoritesHeader() {
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        Your saved Bay Area locations
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    width: '100%',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'left',
  },
});
