import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { DayEditor } from '@/components/day-editor';
import { useTheme } from '@/constants/theme';
import { formatLong, isValidKey, relativeLabel } from '@/lib/dates';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const c = useTheme();

  if (!isValidKey(date)) {
    return <Text style={{ color: c.text, padding: 20 }}>Invalid date.</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: relativeLabel(date) }} />
      <ScrollView
        style={{ backgroundColor: c.bg }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        <Text style={[styles.date, { color: c.muted }]}>{formatLong(date)}</Text>
        <DayEditor date={date} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  date: { fontSize: 15, fontWeight: '600', marginLeft: 4 },
});
