import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { formatMonth, toKey, todayKey } from '@/lib/dates';

export interface DayLook {
  bg?: string;
  fg?: string;
  dot?: string;
}

const WEEK_HEADER = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Month grid starting on Monday. `look` decides how each day is drawn. */
export function MonthCalendar({
  year,
  month,
  onChangeMonth,
  onPressDay,
  look,
}: {
  year: number;
  month: number;
  onChangeMonth: (delta: number) => void;
  onPressDay: (key: string) => void;
  look: (key: string) => DayLook;
}) {
  const c = useTheme();
  const today = todayKey();
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toKey(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.header}>
        <Text style={[styles.month, { color: c.text }]}>{formatMonth(year, month)}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton icon="left" label="Previous month" onPress={() => onChangeMonth(-1)} />
          <IconButton icon="right" label="Next month" onPress={() => onChangeMonth(1)} />
        </View>
      </View>
      <View style={styles.grid}>
        {WEEK_HEADER.map((d, i) => (
          <Text key={i} style={[styles.weekday, { color: c.faint }]}>
            {d}
          </Text>
        ))}
        {cells.map((key, i) => {
          if (!key) return <View key={i} style={styles.cell} />;
          const l = look(key);
          const isToday = key === today;
          return (
            <Pressable
              key={key}
              style={styles.cell}
              onPress={() => onPressDay(key)}
              accessibilityLabel={key}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.day,
                    {
                      backgroundColor: l.bg ?? 'transparent',
                      borderColor: isToday ? c.primary : 'transparent',
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: l.fg ?? c.text, fontWeight: isToday ? '800' : '600' },
                    ]}>
                    {Number(key.slice(8))}
                  </Text>
                  <View style={[styles.dot, { backgroundColor: l.dot ?? 'transparent' }]} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  day: {
    width: 42,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderCurve: 'continuous',
  },
  dayText: { fontSize: 15, fontVariant: ['tabular-nums'] },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
