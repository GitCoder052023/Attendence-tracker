import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeaderButton } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { formatMonth, toKey, todayKey } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';

export interface DayLook {
  /** Background fill, used for holidays and selections. */
  fill?: string;
  ink?: string;
  /** Small mark under the number. */
  mark?: string;
  /** Draw the mark hollow. */
  hollow?: boolean;
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
  const today = todayKey();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toKey(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.header}>
        <ThemedText variant="headline" style={{ flex: 1 }}>
          {formatMonth(year, month)}
        </ThemedText>
        <HeaderButton icon="left" label="Previous month" onPress={() => onChangeMonth(-1)} />
        <HeaderButton icon="right" label="Next month" onPress={() => onChangeMonth(1)} />
      </View>
      <View style={styles.grid}>
        {WEEK_HEADER.map((d, i) => (
          <Text key={i} style={styles.weekday}>
            {d}
          </Text>
        ))}
        {cells.map((key, i) => {
          if (!key) return <View key={i} style={styles.cell} />;
          const l = look(key);
          const isToday = key === today;
          const fill = l.fill ?? (isToday ? colors.ink : undefined);
          const ink = l.ink ?? (isToday && !l.fill ? colors.onAccent : colors.ink);
          return (
            <Pressable key={key} style={styles.cell} onPress={() => onPressDay(key)} accessibilityLabel={key}>
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.day,
                      fill ? { backgroundColor: fill } : pressed && { backgroundColor: colors.pressed },
                    ]}>
                    <Text style={[styles.dayText, { color: ink, fontWeight: isToday ? '700' : '500' }]}>
                      {Number(key.slice(8))}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.mark,
                      l.mark
                        ? l.hollow
                          ? { borderWidth: 1.5, borderColor: l.mark }
                          : { backgroundColor: l.mark }
                        : null,
                    ]}
                  />
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.xs },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.tertiary,
    marginBottom: spacing.xs,
  },
  cell: { width: `${100 / 7}%`, alignItems: 'center', gap: 3 },
  day: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 16, fontVariant: ['tabular-nums'] },
  mark: { width: 12, height: 4, borderRadius: 2 },
});
