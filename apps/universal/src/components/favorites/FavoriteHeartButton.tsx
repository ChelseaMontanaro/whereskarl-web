import { Pressable, StyleSheet, Text } from 'react-native';

import { Radius } from '@/constants/theme';

type FavoriteHeartButtonProps = {
  locationName: string;
  /** Phase 25 direct-unfavorite (§7/§8): every consumer today renders this
   * only for locations already in the favorites collection, so the control
   * always removes rather than toggling both directions. */
  onRemove: () => void;
  size?: 'sm' | 'md';
};

/**
 * Direct-unfavorite control for the Favorites screen. Glyph matches Map, but
 * favorite-state color is the approved mockup red — Favorites-local only.
 */
export function FavoriteHeartButton({
  locationName,
  onRemove,
  size = 'md',
}: FavoriteHeartButtonProps) {
  const isSmall = size === 'sm';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove ${locationName} from favorites`}
      hitSlop={8}
      onPress={onRemove}
      style={({ pressed }) => [
        styles.button,
        isSmall ? styles.buttonSm : styles.buttonMd,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.glyph, isSmall ? styles.glyphSm : styles.glyphMd]}>
        ♥
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  buttonMd: {
    width: 40,
    height: 40,
  },
  buttonSm: {
    width: 32,
    height: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  glyph: {
    color: '#FF375F',
  },
  glyphMd: {
    fontSize: 18,
  },
  glyphSm: {
    fontSize: 15,
  },
});
