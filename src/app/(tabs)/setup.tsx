import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, Dot, PillButton, Screen, SectionTitle } from '@/components/ui';
import { radius, useTheme } from '@/constants/theme';
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

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

export default function SetupScreen() {
  const s = useAppState();
  const c = useTheme();
  const [confirm, setConfirm] = useState<string | null>(null);

  // Holidays grouped into runs of consecutive dates with the same name.
  const groups: { name: string; dates: string[] }[] = [];
  for (const date of Object.keys(s.holidays).sort()) {
    const last = groups[groups.length - 1];
    const name = s.holidays[date];
    if (last && last.name === name && addDays(last.dates[last.dates.length - 1], 1) === date) {
      last.dates.push(date);
    } else {
      groups.push({ name, dates: [date] });
    }
  }
  const today = todayKey();

  return (
    <Screen title="Timetable" subtitle="Subjects, weekly classes & holidays">
      <Text style={[styles.hint, { color: c.muted }]}>
        Tap a day to add a class. Tap again for 2 classes that day, once more to clear.
      </Text>

      {s.subjects.map((subject) => (
        <SubjectCard
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
        <PillButton label="Add subject" icon="plus" onPress={() => addSubject('')} />
      ) : null}

      <SectionTitle
        right={
          <Pressable onPress={() => router.push('/holidays')} hitSlop={8}>
            <Text style={[styles.link, { color: c.primary }]}>Add</Text>
          </Pressable>
        }>
        Holidays
      </SectionTitle>
      <Card style={{ gap: 0, paddingVertical: 6 }}>
        {groups.length === 0 ? (
          <Text style={[styles.body, { color: c.muted, paddingVertical: 10 }]}>
            No holidays yet. Days marked as holiday are left out of your attendance.
          </Text>
        ) : (
          groups.map((g, i) => {
            const first = g.dates[0];
            const last = g.dates[g.dates.length - 1];
            const past = last < today;
            return (
              <View
                key={first}
                style={[
                  styles.holidayRow,
                  { borderTopColor: c.border, borderTopWidth: i ? StyleSheet.hairlineWidth : 0 },
                ]}>
                <Icon name="sun" size={16} color={past ? c.faint : c.holiday} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.body, { color: past ? c.muted : c.text, fontWeight: '600' }]}>
                    {g.name || 'Holiday'}
                  </Text>
                  <Text style={[styles.small, { color: c.muted }]}>
                    {g.dates.length === 1
                      ? formatShort(first)
                      : `${formatShort(first)} – ${formatShort(last)} · ${g.dates.length} days`}
                  </Text>
                </View>
                <Pressable
                  hitSlop={10}
                  accessibilityLabel="Remove holiday"
                  onPress={() => removeHolidays(g.dates)}>
                  <Icon name="close" size={16} color={c.faint} />
                </Pressable>
              </View>
            );
          })
        )}
      </Card>

      <SectionTitle>How it&apos;s counted</SectionTitle>
      <Card style={{ gap: 8 }}>
        {(['theory', 'practical'] as ClassType[]).map((t) => (
          <View key={t} style={styles.ruleRow}>
            <Text style={[styles.body, { color: c.text, fontWeight: '600' }]}>{RULES[t].label}</Text>
            <Text style={[styles.body, { color: c.muted }]}>
              {RULES[t].hours} hr{RULES[t].hours > 1 ? 's' : ''} per class · min {RULES[t].min}%
            </Text>
          </View>
        ))}
        <Text style={[styles.small, { color: c.muted, lineHeight: 18 }]}>
          Holidays and classes marked “No class” are not counted. Unmarked classes are not
          counted until you mark them.
        </Text>
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Card>
        <Text style={[styles.small, { color: c.muted }]}>
          Everything is saved only on this phone. Nothing is uploaded.
        </Text>
        <PillButton
          label={confirm === 'reset' ? 'Tap again to erase everything' : 'Reset all data'}
          icon="trash"
          tone="red"
          solid={confirm === 'reset'}
          onPress={() => {
            if (confirm === 'reset') {
              resetAllData();
              setConfirm(null);
            } else {
              setConfirm('reset');
            }
          }}
        />
      </Card>
    </Screen>
  );
}

function SubjectCard({
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
  const c = useTheme();
  const sum = (w?: number[]) => (w ?? []).reduce((a, b) => a + b, 0);
  const theory = sum(schedule?.theory);
  const practical = sum(schedule?.practical);

  return (
    <Card>
      <View style={styles.inline}>
        <Dot color={subject.color} size={12} />
        <TextInput
          value={subject.name}
          onChangeText={(t) => renameSubject(subject.id, t)}
          onEndEditing={() => {
            if (!subject.name.trim()) renameSubject(subject.id, 'Subject');
          }}
          placeholder="Subject name"
          placeholderTextColor={c.faint}
          style={[styles.nameInput, { color: c.text }]}
        />
        {canDelete ? (
          confirming ? (
            <PillButton label="Delete?" tone="red" solid onPress={onDelete} style={{ height: 30 }} />
          ) : (
            <Pressable hitSlop={10} onPress={onDelete} accessibilityLabel="Delete subject">
              <Icon name="trash" size={17} color={c.faint} />
            </Pressable>
          )
        ) : null}
      </View>
      {confirming ? (
        <Text style={[styles.small, { color: c.red }]}>
          This also deletes all attendance marked for this subject.
        </Text>
      ) : null}

      {(['theory', 'practical'] as ClassType[]).map((type) => (
        <View key={type} style={{ gap: 8 }}>
          <Text style={[styles.typeLabel, { color: c.muted }]}>
            {RULES[type].label.toUpperCase()} · {RULES[type].hours} HR
            {RULES[type].hours > 1 ? 'S' : ''} EACH
          </Text>
          <View style={styles.week}>
            {WEEK_ORDER.map((wd) => {
              const n = schedule?.[type][wd] ?? 0;
              return (
                <Pressable
                  key={wd}
                  onPress={() => cycleScheduleCount(subject.id, type, wd)}
                  accessibilityLabel={`${WEEKDAYS_SHORT[wd]} ${RULES[type].label}: ${n} classes`}
                  style={({ pressed }) => [
                    styles.dayChip,
                    {
                      backgroundColor: n ? subject.color : c.cardAlt,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <Text style={[styles.dayChipText, { color: n ? '#FFFFFF' : c.muted }]}>
                    {WEEKDAYS_SHORT[wd]}
                  </Text>
                  <Text style={[styles.dayChipCount, { color: n ? '#FFFFFF' : 'transparent' }]}>
                    {n === 2 ? '×2' : '•'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={[styles.small, { color: c.muted }]}>
        {theory + practical === 0
          ? 'No classes added yet'
          : `Every week: ${theory} theory (${theory * RULES.theory.hours} hrs) · ${practical} practical (${practical * RULES.practical.hours} hrs)`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, lineHeight: 20, marginHorizontal: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameInput: { flex: 1, fontSize: 19, fontWeight: '700', paddingVertical: 4 },
  typeLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  week: { flexDirection: 'row', gap: 6 },
  dayChip: {
    flex: 1,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  dayChipText: { fontSize: 12, fontWeight: '700' },
  dayChipCount: { fontSize: 11, fontWeight: '800', marginTop: 1 },
  body: { fontSize: 15 },
  small: { fontSize: 13 },
  link: { fontSize: 15, fontWeight: '600' },
  holidayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
