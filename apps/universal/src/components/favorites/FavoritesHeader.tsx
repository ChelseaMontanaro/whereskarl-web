import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export function FavoritesHeader() {
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text style={styles.title} allowFontScaling={false}>
        Favorites
      </Text>
      <Text
        style={styles.subtitle}
        allowFontScaling={false}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
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
    fontFamily: Fonts?.serif,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Colors.textPrimary,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: Fonts?.serif,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: Colors.brandTaglineText,
    textAlign: 'left',
  },
});
