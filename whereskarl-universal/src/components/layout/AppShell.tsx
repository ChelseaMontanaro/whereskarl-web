import { usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopTopNav } from '@/components/layout/DesktopTopNav';
import { ClearSkiesNavProvider } from '@/providers/ClearSkiesNavProvider';
import { Colors } from '@/constants/theme';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isMapRoute = pathname === '/map' || pathname.startsWith('/map/');

  return (
    <ClearSkiesNavProvider>
      <View style={styles.root}>
        <DesktopTopNav />
        <View style={[styles.main, isMapRoute && styles.mainMap]}>{children}</View>
        <BottomNav />
      </View>
    </ClearSkiesNavProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  main: {
    flex: 1,
    minHeight: 0,
  },
  mainMap: {
    paddingBottom: 0,
  },
});
