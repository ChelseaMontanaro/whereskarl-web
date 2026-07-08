import { StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export function HomeLocationBadge() {
  return <Text style={styles.badge}>Home</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
