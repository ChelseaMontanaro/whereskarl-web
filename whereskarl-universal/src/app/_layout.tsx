import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AppShell } from '@/components/layout/AppShell';
import '@/global.css';

export default function RootLayout() {
  return (
    <AppShell>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'rgb(3, 11, 20)' },
          }}
        />
      </View>
    </AppShell>
  );
}
