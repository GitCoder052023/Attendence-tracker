import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Group, Row } from '@/components/group';
import { ThemedText } from '@/components/themed-text';
import { RULES } from '@/lib/attendance';
import { formatLong, todayKey } from '@/lib/dates';
import { tick } from '@/lib/haptics';
import {
  addExtraClass,
  addHolidays,
  classesForDay,
  markWholeDay,
  removeClass,
  removeHolidays,
  setClassStatus,
  useAppState,
} from '@/lib/store';
import type { ClassEntry, ClassStatus, ClassType, Subject } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

export function DayEditor({ date }: { date: string }) {
  const s = useAppState();
  const isFuture = date > todayKey();
  const classes = classesForDay(s, date);
  const hasTimetable = Object.values(s.schedule).some(
    (w) => w.theory.some(Boolean) || w.practical.some(Boolean),
  );
  const marked = classes.filter((x) => x.status).length;

  if (date in s.holidays) {
    return (
      <>
        <DateLine date={date} note="Holiday" noteColor={colors.holiday} />
        <Group footer="Classes on a holiday are not counted in your attendance.">
          <Row>
            <ThemedText variant="headline">{s.holidays[date] || 'Holiday'}</ThemedText>
          </Row>
        </Group>
        <Button title="Not a holiday" onPress={() => removeHolidays([date])} />
      </>
    );
  }

  if (!hasTimetable) {
    return (
      <>
        <DateLine date={date} />
        <Group footer="Add the weekdays each subject has theory and practical classes. They show up here every day after that.">
          <Row>
            <ThemedText variant="headline">Your timetable is empty</ThemedText>
          </Row>
        </Group>
        <Button title="Set up timetable" variant="primary" onPress={() => router.navigate('/setup')} />
      </>
    );
  }

  const groups = s.subjects
    .map((subject) => ({
      subject,
      items: classes
        .filter((x) => x.subjectId === subject.id)
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'theory' ? -1 : 1)),
    }))
    .filter((g) => g.items.length > 0);

  const note = isFuture
    ? 'Attendance opens on the day'
    : classes.length === 0
      ? 'No classes on the timetable'
      : marked === classes.length
        ? `All ${classes.length} marked`
        : `${marked} of ${classes.length} marked`;

  return (
    <>
      <DateLine
        date={date}
        note={note}
        noteColor={!isFuture && classes.length > 0 && marked === classes.length ? colors.good : undefined}
      />

      {!isFuture && classes.length > 0 && marked < classes.length ? (
        <Button
          title={marked === 0 ? 'Mark all present' : 'Mark the rest present'}
          icon="check"
          variant="primary"
          onPress={() => {
            tick();
            markWholeDay(date, 'present', true);
          }}
        />
      ) : null}

      {groups.map(({ subject, items }) => (
        <SubjectClasses key={subject.id} subject={subject} items={items} date={date} readOnly={isFuture} />
      ))}

      <MoreActions date={date} isFuture={isFuture} hasClasses={classes.length > 0} subjects={s.subjects} />
    </>
  );
}

function DateLine({ date, note, noteColor }: { date: string; note?: string; noteColor?: string }) {
  return (
    <View style={{ gap: 2, paddingHorizontal: spacing.xs }}>
      <ThemedText variant="subhead">{formatLong(date)}</ThemedText>
      {note ? (
        <ThemedText variant="headline" style={noteColor ? { color: noteColor } : undefined}>
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

function SubjectClasses({
  subject,
  items,
  date,
  readOnly,
}: {
  subject: Subject;
  items: ClassEntry[];
  date: string;
  readOnly: boolean;
}) {
  const countOf = (t: ClassType) => items.filter((x) => x.type === t).length;
  const seen: Record<ClassType, number> = { theory: 0, practical: 0 };

  return (
    <Group title={subject.name} swatch={subject.color}>
      {items.map((item) => {
        seen[item.type]++;
        const rule = RULES[item.type];
        const name = countOf(item.type) > 1 ? `${rule.label} ${seen[item.type]}` : rule.label;
        return (
          <Row key={item.id} style={styles.classRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText variant="body" numberOfLines={1}>
                {name}
              </ThemedText>
              <View style={styles.inline}>
                <ThemedText variant="caption">
                  {rule.hours} {rule.hours === 1 ? 'hour' : 'hours'}
                  {item.extra ? ', extra' : ''}
                </ThemedText>
                {item.extra && !readOnly ? (
                  <Pressable
                    hitSlop={10}
                    accessibilityLabel="Remove extra class"
                    onPress={() => removeClass(date, item.id)}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            {readOnly ? null : (
              <MarkControl
                value={item.status}
                onChange={(status) => {
                  tick();
                  setClassStatus(date, item.id, status);
                }}
              />
            )}
          </Row>
        );
      })}
    </Group>
  );
}

const MARKS: { key: ClassStatus; label: string; fill: string }[] = [
  { key: 'present', label: 'Present', fill: colors.good },
  { key: 'bunk', label: 'Bunk', fill: colors.short },
  { key: 'cancelled', label: 'No class', fill: colors.secondary },
];

function MarkControl({ value, onChange }: { value?: ClassStatus; onChange: (s: ClassStatus) => void }) {
  return (
    <View style={styles.marks}>
      {MARKS.map((m) => {
        const active = value === m.key;
        return (
          <Pressable
            key={m.key}
            onPress={() => onChange(m.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.mark,
              active && { backgroundColor: m.fill },
              pressed && !active && { backgroundColor: colors.pressed },
            ]}>
            <Text style={[styles.markText, active && { color: colors.onAccent }]}>{m.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MoreActions({
  date,
  isFuture,
  hasClasses,
  subjects,
}: {
  date: string;
  isFuture: boolean;
  hasClasses: boolean;
  subjects: Subject[];
}) {
  const [adding, setAdding] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id);
  const [classType, setClassType] = useState<ClassType>('theory');

  if (adding && subjectId) {
    return (
      <Group title="Extra class">
        <Row style={{ gap: spacing.smd }}>
          <View style={styles.chips}>
            {subjects.map((sub) => (
              <Chip key={sub.id} label={sub.name} active={subjectId === sub.id} onPress={() => setSubjectId(sub.id)} />
            ))}
          </View>
          <View style={styles.chips}>
            {(['theory', 'practical'] as ClassType[]).map((t) => (
              <Chip
                key={t}
                label={`${RULES[t].label}, ${RULES[t].hours} ${RULES[t].hours === 1 ? 'hr' : 'hrs'}`}
                active={classType === t}
                onPress={() => setClassType(t)}
              />
            ))}
          </View>
          <View style={styles.inline}>
            <Button title="Cancel" style={{ flex: 1 }} onPress={() => setAdding(false)} />
            <Button
              title="Add class"
              variant="primary"
              style={{ flex: 1 }}
              onPress={() => {
                addExtraClass(date, subjectId, classType);
                setAdding(false);
              }}
            />
          </View>
        </Row>
      </Group>
    );
  }

  return (
    <Group title={!isFuture && hasClasses ? 'Whole day' : undefined}>
      {!isFuture && hasClasses ? (
        <ActionRow
          label="Bunk the whole day"
          color={colors.short}
          onPress={() => {
            tick();
            markWholeDay(date, 'bunk');
          }}
        />
      ) : null}
      {!isFuture ? <ActionRow label="Add an extra class" onPress={() => setAdding(true)} /> : null}
      <ActionRow label="Mark as holiday" onPress={() => addHolidays([date], '')} />
    </Group>
  );
}

function ActionRow({ label, onPress, color = colors.accent }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Row onPress={onPress}>
      <ThemedText variant="body" style={{ color }}>
        {label}
      </ThemedText>
    </Row>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, { backgroundColor: active ? colors.accentWash : colors.well }]}>
      <Text style={[styles.chipText, { color: active ? colors.accent : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  classRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: spacing.smd },
  remove: { fontSize: 12, fontWeight: '600', color: colors.accent },
  marks: {
    flexDirection: 'row',
    backgroundColor: colors.well,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    padding: 2,
  },
  mark: {
    minWidth: 62,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 13, fontWeight: '600', color: colors.secondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    height: 34,
    paddingHorizontal: spacing.smd,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
});
