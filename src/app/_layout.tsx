import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.ground,
    card: colors.ground,
    primary: colors.accent,
    text: colors.ink,
    border: colors.separator,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.ground },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.ink },
          contentStyle: { backgroundColor: colors.ground },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="day/[date]" options={{ title: '', headerBackTitle: 'Calendar' }} />
        <Stack.Screen name="holidays" options={{ title: 'Add holidays', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
