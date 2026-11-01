import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Group, Row } from '@/components/group';
import { MonthCalendar, type DayLook } from '@/components/month-calendar';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { toKey, todayKey } from '@/lib/dates';
import { classesForDay, useAppState } from '@/lib/store';
import type { AppState } from '@/lib/types';
import { colors, spacing } from '@/theme';

type DayStatus = 'holiday' | 'present' | 'bunk' | 'unmarked' | 'upcoming' | 'none';

/** First day anything was marked; days before it are before tracking began, not "unmarked". */
function trackingStart(s: AppState): string | undefined {
  return Object.keys(s.days).sort()[0];
}

function dayStatus(s: AppState, key: string, today: string, start: string | undefined): DayStatus {
  if (key in s.holidays) return 'holiday';
  const classes = classesForDay(s, key);
  if (classes.length === 0) return 'none';
  if (key > today) return 'upcoming';
  if (!start || key < start) return 'none';
  if (classes.some((x) => x.status === 'bunk')) return 'bunk';
  if (classes.some((x) => !x.status)) return 'unmarked';
  if (classes.every((x) => x.status === 'cancelled')) return 'none';
  return 'present';
}

const LOOKS: Record<DayStatus, DayLook> = {
  holiday: { fill: colors.holidayWash, ink: colors.holiday },
  present: { mark: colors.good },
  bunk: { mark: colors.short },
  unmarked: { mark: colors.notice, hollow: true },
  upcoming: { mark: colors.separator },
  none: { ink: colors.tertiary },
};

export default function CalendarScreen() {
  const s = useAppState();
  const today = todayKey();
  const start = trackingStart(s);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const statuses = Array.from({ length: daysInMonth }, (_, i) =>
    dayStatus(s, toKey(new Date(cursor.year, cursor.month, i + 1)), today, start),
  );
  const count = (st: DayStatus) => statuses.filter((x) => x === st).length;
  const unmarked = count('unmarked');

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button title="Add holidays" variant="plain" onPress={() => router.push('/holidays')} />
          ),
        }}
      />
      <Page>
        <Group
          footer={
            <View style={styles.legend}>
              <Legend color={colors.good} label="Attended" />
              <Legend color={colors.short} label="Bunked" />
              <Legend color={colors.notice} label="Unmarked" hollow />
              <Legend color={colors.holiday} label="Holiday" round />
            </View>
          }>
          <Row style={{ paddingVertical: spacing.sm }}>
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
              look={(key) => LOOKS[dayStatus(s, key, today, start)]}
            />
          </Row>
        </Group>

        {unmarked > 0 ? (
          <ThemedText variant="footnote" style={{ color: colors.notice, paddingHorizontal: spacing.xs }}>
            {unmarked} {unmarked === 1 ? 'day' : 'days'} this month not marked yet. Tap a day to fill it in;
            unmarked classes don&apos;t count.
          </ThemedText>
        ) : null}

        <Group title="This month">
          <Row style={styles.summary}>
            <Figure value={count('present')} label="All present" />
            <View style={styles.divider} />
            <Figure value={count('bunk')} label="Had a bunk" />
            <View style={styles.divider} />
            <Figure value={count('holiday')} label="Holidays" />
          </Row>
        </Group>
      </Page>
    </>
  );
}

function Legend({ color, label, hollow, round }: { color: string; label: string; hollow?: boolean; round?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          round ? styles.legendDay : styles.legendMark,
          hollow || round ? { borderWidth: 1.5, borderColor: color } : { backgroundColor: color },
          round && { backgroundColor: colors.holidayWash },
        ]}
      />
      <ThemedText variant="caption">{label}</ThemedText>
    </View>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <ThemedText variant="title" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </ThemedText>
      <ThemedText variant="caption">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.smd, rowGap: spacing.xs, paddingHorizontal: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendMark: { width: 12, height: 4, borderRadius: 2 },
  legendDay: { width: 12, height: 12, borderRadius: 6 },
  summary: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.md, paddingVertical: spacing.md },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.separator },
});
