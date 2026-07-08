import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'rgb(3, 11, 20)' },
        }}
      />
    </>
  );
}
