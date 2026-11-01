import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Group, Row } from '@/components/group';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { RULES } from '@/lib/attendance';
import { WEEKDAYS_SHORT, addDays, formatShort, todayKey } from '@/lib/dates';
import {
  MAX_SUBJECTS,
  addSubject,
  cycleScheduleCount,
  deleteSubject,
  removeHolidays,
  renameSubject,
  resetAllData,
  useAppState,
} from '@/lib/store';
import type { ClassType, Subject, SubjectSchedule } from '@/lib/types';
import { colors, radius, spacing, type } from '@/theme';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const TYPES: ClassType[] = ['theory', 'practical'];

export default function SetupScreen() {
  const s = useAppState();
  const [confirm, setConfirm] = useState<string | null>(null);

  // Holidays grouped into runs of consecutive dates with the same name.
  const holidayRuns: { name: string; dates: string[] }[] = [];
  for (const date of Object.keys(s.holidays).sort()) {
    const last = holidayRuns[holidayRuns.length - 1];
    const name = s.holidays[date];
    if (last && last.name === name && addDays(last.dates[last.dates.length - 1], 1) === date) {
      last.dates.push(date);
    } else {
      holidayRuns.push({ name, dates: [date] });
    }
  }
  const today = todayKey();

  return (
    <Page>
      <ThemedText variant="footnote" style={{ paddingHorizontal: spacing.xs }}>
        Tap a weekday to add a class. Tap it again for two classes that day, and once more to clear it.
      </ThemedText>

      {s.subjects.map((subject) => (
        <SubjectSection
          key={subject.id}
          subject={subject}
          schedule={s.schedule[subject.id]}
          canDelete={s.subjects.length > 1}
          confirming={confirm === subject.id}
          onDelete={() => {
            if (confirm === subject.id) {
              deleteSubject(subject.id);
              setConfirm(null);
            } else {
              setConfirm(subject.id);
            }
          }}
        />
      ))}

      {s.subjects.length < MAX_SUBJECTS ? (
        <Button title="Add a subject" icon="plus" onPress={() => addSubject('')} />
      ) : null}

      <Group
        title="Holidays"
        aside={<Button title="Add" variant="plain" onPress={() => router.push('/holidays')} />}
        footer={holidayRuns.length === 0 ? 'Days marked as holiday are left out of your attendance.' : undefined}>
        {holidayRuns.length === 0 ? (
          <Row>
            <ThemedText variant="subhead">No holidays added</ThemedText>
          </Row>
        ) : (
          holidayRuns.map((run) => {
            const first = run.dates[0];
            const last = run.dates[run.dates.length - 1];
            const past = last < today;
            return (
              <Row key={first} style={styles.between}>
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText variant="body" style={past ? { color: colors.secondary } : undefined}>
                    {run.name || 'Holiday'}
                  </ThemedText>
                  <ThemedText variant="caption">
                    {run.dates.length === 1
                      ? formatShort(first)
                      : `${formatShort(first)} to ${formatShort(last)}, ${run.dates.length} days`}
                  </ThemedText>
                </View>
                <Pressable hitSlop={10} accessibilityRole="button" onPress={() => removeHolidays(run.dates)}>
                  <Text style={styles.link}>Remove</Text>
                </Pressable>
              </Row>
            );
          })
        )}
      </Group>

      <Group
        title="How it's counted"
        footer="Holidays and classes marked “No class” are not counted. A class you haven't marked doesn't count until you mark it.">
        {TYPES.map((t) => (
          <Row key={t} style={styles.between}>
            <ThemedText variant="body">{RULES[t].label}</ThemedText>
            <ThemedText variant="subhead">
              {RULES[t].min}% needed, {RULES[t].hours} {RULES[t].hours === 1 ? 'hour' : 'hours'} a class
            </ThemedText>
          </Row>
        ))}
      </Group>

      <Group title="Data" footer="Everything is saved on this phone only. Nothing is uploaded.">
        <Row
          onPress={() => {
            if (confirm === 'reset') {
              resetAllData();
              setConfirm(null);
            } else {
              setConfirm('reset');
            }
          }}>
          <ThemedText variant="body" style={{ color: colors.short, fontWeight: confirm === 'reset' ? '600' : '400' }}>
            {confirm === 'reset' ? 'Tap again to erase all attendance' : 'Reset all data'}
          </ThemedText>
        </Row>
      </Group>
    </Page>
  );
}

function SubjectSection({
  subject,
  schedule,
  canDelete,
  confirming,
  onDelete,
}: {
  subject: Subject;
  schedule?: SubjectSchedule;
  canDelete: boolean;
  confirming: boolean;
  onDelete: () => void;
}) {
  const hours = (t: ClassType) =>
    (schedule?.[t] ?? []).reduce((a, b) => a + b, 0) * RULES[t].hours;
  const theory = hours('theory');
  const practical = hours('practical');

  return (
    <Group
      footer={
        theory + practical === 0
          ? 'No classes added yet.'
          : `${theory} theory ${theory === 1 ? 'hour' : 'hours'} and ${practical} practical ${practical === 1 ? 'hour' : 'hours'} a week.`
      }>
      <Row style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: spacing.smd }}>
        <View style={[styles.swatch, { backgroundColor: subject.color }]} />
        <TextInput
          value={subject.name}
          onChangeText={(t) => renameSubject(subject.id, t)}
          onEndEditing={() => {
            if (!subject.name.trim()) renameSubject(subject.id, 'Subject');
          }}
          placeholder="Subject name"
          placeholderTextColor={colors.tertiary}
          accessibilityLabel="Subject name"
          style={[type.headline, { flex: 1, paddingVertical: spacing.xs }]}
        />
      </Row>
      {TYPES.map((t) => (
        <Row key={t} style={{ gap: spacing.sm }}>
          <View style={styles.between}>
            <ThemedText variant="body">{RULES[t].label}</ThemedText>
            <ThemedText variant="caption">
              {RULES[t].hours} {RULES[t].hours === 1 ? 'hour' : 'hours'} each
            </ThemedText>
          </View>
          <View style={styles.week}>
            {WEEK_ORDER.map((wd) => {
              const n = schedule?.[t][wd] ?? 0;
              return (
                <Pressable
                  key={wd}
                  onPress={() => cycleScheduleCount(subject.id, t, wd)}
                  accessibilityRole="button"
                  accessibilityLabel={`${WEEKDAYS_SHORT[wd]} ${RULES[t].label}: ${n} classes`}
                  style={({ pressed }) => [
                    styles.day,
                    { backgroundColor: n ? colors.accent : pressed ? colors.pressed : colors.well },
                  ]}>
                  <Text style={[styles.dayText, { color: n ? colors.onAccent : colors.secondary }]}>
                    {WEEKDAYS_SHORT[wd]}
                  </Text>
                  {n === 2 ? <Text style={styles.double}>2</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Row>
      ))}
      {canDelete ? (
        <Row onPress={onDelete}>
          <ThemedText variant="body" style={{ color: colors.short, fontWeight: confirming ? '600' : '400' }}>
            {confirming ? `Tap again to delete ${subject.name || 'this subject'} and its attendance` : 'Delete subject'}
          </ThemedText>
        </Row>
      ) : null}
    </Group>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.smd },
  link: { fontSize: 15, fontWeight: '500', color: colors.accent },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  week: { flexDirection: 'row', gap: spacing.xs },
  day: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 13, fontWeight: '600' },
  double: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    fontWeight: '700',
    color: colors.onAccent,
  },
});
