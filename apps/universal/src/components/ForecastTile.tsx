import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

/** App-local forecast tile model — not a backend contract type. */
export type ForecastHour = {
  hour: string;
  temperature: number;
  sunshineScore: number;
  iconName: string;
  status: string;
};

type ForecastTileProps = {
  forecast: ForecastHour;
};

export function ForecastTile({ forecast }: ForecastTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.hour}>{forecast.hour}</Text>
      <Text style={styles.icon}>{iconForName(forecast.iconName)}</Text>
      <Text style={styles.temperature}>{Math.round(forecast.temperature)}°</Text>
      <Text style={styles.score}>{Math.round(forecast.sunshineScore)}%</Text>
    </View>
  );
}

function iconForName(iconName: string): string {
  if (iconName.includes('fog') || iconName.includes('cloud')) {
    return '☁️';
  }

  if (iconName.includes('sun') || iconName.includes('clear')) {
    return '☀️';
  }

  return '🌤️';
}

const styles = StyleSheet.create({
  tile: {
    minWidth: 72,
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  hour: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  icon: {
    fontSize: 20,
  },
  temperature: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  score: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gold,
  },
});
