import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Native stack for one tab: large title that collapses on scroll, flat header on the paper ground. */
export function TabStack({ title }: { title: string }) {
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.ground },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.ink },
        contentStyle: { backgroundColor: colors.ground },
      }}>
      <Stack.Screen name="index" options={{ title }} />
    </Stack>
  );
}
