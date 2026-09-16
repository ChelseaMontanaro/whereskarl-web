import { StyleSheet, Text, View } from 'react-native';

import {
  FAVORITES_HINT_BORDER,
  FAVORITES_HINT_FILL,
} from '@/components/favorites/favoritesChrome';
import { Colors, Radius, Spacing } from '@/constants/theme';

/**
 * Empty-state Tip — a small atmospheric hint, not a content card or footer.
 */
export function FavoritesTipCard() {
  return (
    <View style={styles.wrap} accessibilityLabel="Tip">
      <Text style={styles.icon} accessibilityElementsHidden>
        💡
      </Text>
      <View style={styles.copy}>
        <Text style={styles.label}>Tip</Text>
        <Text style={styles.text}>
          Tap the heart on any location in the map or location card to add it
          to your favorites.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FAVORITES_HINT_BORDER,
    backgroundColor: FAVORITES_HINT_FILL,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    fontSize: 14,
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  text: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.68)',
  },
});
