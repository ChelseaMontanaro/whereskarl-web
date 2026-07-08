import { StyleSheet, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type LocationSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export function LocationSearchBar({
  value,
  onChangeText,
  placeholder = 'Search Bay Area locations',
  isDisabled = false,
}: LocationSearchBarProps) {
  return (
    <View style={styles.container}>
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
        style={[styles.input, isDisabled && styles.inputDisabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
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
  inputDisabled: {
    opacity: 0.6,
  },
});
