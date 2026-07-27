import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type LocationSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  compact?: boolean;
  inline?: boolean;
};

type LocationSearchIconButtonProps = {
  onPress: () => void;
  isActive?: boolean;
  accessibilityLabel?: string;
};

export function LocationSearchIconButton({
  onPress,
  isActive = false,
  accessibilityLabel = 'Search locations',
}: LocationSearchIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        isActive && styles.iconButtonActive,
        pressed && styles.iconButtonPressed,
      ]}>
      <Text style={[styles.iconGlyph, isActive && styles.iconGlyphActive]}>
        ⌕
      </Text>
    </Pressable>
  );
}

export function LocationSearchBar({
  value,
  onChangeText,
  placeholder = 'Search Bay Area locations',
  isDisabled = false,
  compact = false,
  inline = false,
}: LocationSearchBarProps) {
  return (
    <View style={[styles.container, inline && styles.containerInline]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        editable={!isDisabled}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        accessibilityLabel="Search locations"
        style={[
          styles.input,
          compact && styles.inputCompact,
          inline && styles.inputInline,
          isDisabled && styles.inputDisabled,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  containerInline: {
    flex: 1,
    minWidth: 0,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
  },
  iconButtonActive: {
    borderColor: 'rgba(242, 163, 38, 0.4)',
    backgroundColor: 'rgba(242, 163, 38, 0.12)',
  },
  iconButtonPressed: {
    opacity: 0.86,
  },
  iconGlyph: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -1,
  },
  iconGlyphActive: {
    color: Colors.gold,
  },
  input: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  inputCompact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputInline: {
    paddingVertical: 7,
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.6,
  },
});
