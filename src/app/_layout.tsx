import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { useTheme } from '@/constants/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, background: c.bg, card: c.card, primary: c.primary, text: c.text },
      }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="day/[date]" options={{ title: '', headerBackTitle: 'Back' }} />
        <Stack.Screen
          name="holidays"
          options={{ title: 'Add holidays', presentation: 'modal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
