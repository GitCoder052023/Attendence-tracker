import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MonthCalendar, type DayLook } from '@/components/month-calendar';
import { Card, Dot, PillButton, Screen } from '@/components/ui';
import { useTheme, type Theme } from '@/constants/theme';
import { toKey, todayKey } from '@/lib/dates';
import { classesForDay, useAppState } from '@/lib/store';
import type { AppState } from '@/lib/types';

type DayStatus = 'holiday' | 'present' | 'bunk' | 'unmarked' | 'upcoming' | 'none';

function dayStatus(s: AppState, key: string, today: string): DayStatus {
  if (key in s.holidays) return 'holiday';
  const classes = classesForDay(s, key);
  if (classes.length === 0) return 'none';
  if (key > today) return 'upcoming';
  if (classes.some((x) => x.status === 'bunk')) return 'bunk';
  if (classes.some((x) => !x.status)) return 'unmarked';
  if (classes.every((x) => x.status === 'cancelled')) return 'none';
  return 'present';
}

function lookFor(status: DayStatus, c: Theme): DayLook {
  switch (status) {
    case 'holiday':
      return { bg: c.holidaySoft, fg: c.holiday, dot: c.holiday };
    case 'present':
      return { dot: c.green };
    case 'bunk':
      return { dot: c.red };
    case 'unmarked':
      return { dot: c.amber };
    case 'upcoming':
      return { dot: c.faint };
    default:
      return { fg: c.muted };
  }
}

export default function CalendarScreen() {
  const s = useAppState();
  const c = useTheme();
  const today = todayKey();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const statuses = Array.from({ length: daysInMonth }, (_, i) =>
    dayStatus(s, toKey(new Date(cursor.year, cursor.month, i + 1)), today),
  );
  const count = (st: DayStatus) => statuses.filter((x) => x === st).length;
  const unmarked = count('unmarked');

  return (
    <Screen
      title="Calendar"
      subtitle="Tap a day to mark or edit it"
      right={
        <PillButton
          label="Holidays"
          icon="plus"
          tone="holiday"
          onPress={() => router.push('/holidays')}
          style={{ height: 36 }}
        />
      }>
      <Card>
        <MonthCalendar
          year={cursor.year}
          month={cursor.month}
          onChangeMonth={(delta) =>
            setCursor(({ year, month }) => {
              const d = new Date(year, month + delta, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
          onPressDay={(key) => router.push({ pathname: '/day/[date]', params: { date: key } })}
          look={(key) => lookFor(dayStatus(s, key, today), c)}
        />
        <View style={[styles.legend, { borderTopColor: c.border }]}>
          <Legend color={c.green} label="All attended" />
          <Legend color={c.red} label="Bunked" />
          <Legend color={c.amber} label="Not marked" />
          <Legend color={c.holiday} label="Holiday" />
        </View>
      </Card>

      {unmarked > 0 ? (
        <Card style={{ backgroundColor: c.amberSoft, borderColor: 'transparent' }}>
          <Text style={[styles.text, { color: c.text }]}>
            <Text style={{ fontWeight: '700', color: c.amber }}>
              {unmarked} {unmarked === 1 ? 'day' : 'days'} not marked
            </Text>{' '}
            this month. Unmarked classes are not counted until you mark them.
          </Text>
        </Card>
      ) : null}

      <View style={styles.stats}>
        <MiniStat value={count('present')} label="Full days" color={c.green} />
        <MiniStat value={count('bunk')} label="Bunk days" color={c.red} />
        <MiniStat value={count('holiday')} label="Holidays" color={c.holiday} />
      </View>
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const c = useTheme();
  return (
    <View style={styles.legendItem}>
      <Dot color={color} size={8} />
      <Text style={[styles.legendText, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

function MiniStat({ value, label, color }: { value: number; label: string; color: string }) {
  const c = useTheme();
  return (
    <Card style={{ flex: 1, gap: 2, paddingVertical: 14 }}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.legendText, { color: c.muted }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, fontWeight: '600' },
  text: { fontSize: 14, lineHeight: 20 },
  stats: { flexDirection: 'row', gap: 10 },
  statValue: { fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
