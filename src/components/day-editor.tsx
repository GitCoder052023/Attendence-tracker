import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Card, Dot, PillButton } from '@/components/ui';
import { radius, useTheme } from '@/constants/theme';
import { RULES } from '@/lib/attendance';
import { todayKey } from '@/lib/dates';
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

export function DayEditor({ date }: { date: string }) {
  const s = useAppState();
  const c = useTheme();
  const isFuture = date > todayKey();
  const classes = classesForDay(s, date);
  const hasTimetable = Object.values(s.schedule).some(
    (w) => w.theory.some(Boolean) || w.practical.some(Boolean),
  );

  if (date in s.holidays) {
    return (
      <Card style={styles.center}>
        <View style={[styles.bigIcon, { backgroundColor: c.holidaySoft }]}>
          <Icon name="sun" size={30} color={c.holiday} />
        </View>
        <Text style={[styles.bigTitle, { color: c.text }]}>{s.holidays[date] || 'Holiday'}</Text>
        <Text style={[styles.note, { color: c.muted }]}>
          No classes on this day, so it isn&apos;t counted in your attendance.
        </Text>
        <PillButton label="Not a holiday" onPress={() => removeHolidays([date])} />
      </Card>
    );
  }

  const marked = classes.filter((x) => x.status).length;
  const groups = s.subjects
    .map((subject) => ({
      subject,
      items: classes
        .filter((x) => x.subjectId === subject.id)
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'theory' ? -1 : 1)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <View style={{ gap: 14 }}>
      {!hasTimetable ? (
        <Card style={styles.center}>
          <View style={[styles.bigIcon, { backgroundColor: c.primarySoft }]}>
            <Icon name="calendar" size={28} color={c.primary} />
          </View>
          <Text style={[styles.bigTitle, { color: c.text }]}>Set up your timetable</Text>
          <Text style={[styles.note, { color: c.muted }]}>
            Add the days each subject has theory and practical classes. After that, your classes
            show up here every day.
          </Text>
          <PillButton
            label="Open timetable"
            tone="primary"
            solid
            onPress={() => router.navigate('/setup')}
          />
        </Card>
      ) : null}

      {classes.length > 0 && !isFuture ? (
        <Card>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, { color: c.text }]}>
              {classes.length} {classes.length === 1 ? 'class' : 'classes'}
            </Text>
            <Text style={[styles.small, { color: marked === classes.length ? c.green : c.muted }]}>
              {marked === classes.length ? 'All marked' : `${marked} of ${classes.length} marked`}
            </Text>
          </View>
          <View style={styles.actions}>
            <PillButton
              label="All present"
              icon="check"
              tone="green"
              style={styles.flex}
              onPress={() => markWholeDay(date, 'present')}
            />
            <PillButton
              label="Bunk day"
              icon="bunk"
              tone="red"
              style={styles.flex}
              onPress={() => markWholeDay(date, 'bunk')}
            />
          </View>
          <PillButton label="Mark as holiday" icon="sun" tone="holiday" onPress={() => addHolidays([date], '')} />
        </Card>
      ) : null}

      {isFuture ? (
        <Card>
          <View style={styles.inline}>
            <Icon name="lock" size={14} color={c.muted} />
            <Text style={[styles.small, { color: c.muted, flex: 1 }]}>
              Attendance can be marked on the day. You can still mark this day as a holiday.
            </Text>
          </View>
          <PillButton label="Mark as holiday" icon="sun" tone="holiday" onPress={() => addHolidays([date], '')} />
        </Card>
      ) : null}

      {hasTimetable && classes.length === 0 ? (
        <Card style={styles.center}>
          <Text style={[styles.bigTitle, { color: c.text }]}>No classes</Text>
          <Text style={[styles.note, { color: c.muted }]}>
            Nothing on the timetable for this day.
          </Text>
        </Card>
      ) : null}

      {groups.map(({ subject, items }) => (
        <SubjectClasses
          key={subject.id}
          subject={subject}
          items={items}
          date={date}
          readOnly={isFuture}
        />
      ))}

      {!isFuture && hasTimetable && s.subjects.length > 0 ? <AddExtraClass date={date} subjects={s.subjects} /> : null}
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
  const c = useTheme();
  const countOf = (type: ClassType) => items.filter((x) => x.type === type).length;
  const seen: Record<ClassType, number> = { theory: 0, practical: 0 };

  return (
    <Card>
      <View style={styles.inline}>
        <Dot color={subject.color} size={12} />
        <Text style={[styles.cardTitle, { color: c.text }]}>{subject.name}</Text>
      </View>
      {items.map((item) => {
        seen[item.type]++;
        const rule = RULES[item.type];
        const label =
          countOf(item.type) > 1 ? `${rule.label} ${seen[item.type]}` : rule.label;
        return (
          <View key={item.id} style={{ gap: 8 }}>
            <View style={styles.rowBetween}>
              <View style={styles.inline}>
                <Icon name={item.type === 'theory' ? 'book' : 'flask'} size={15} color={c.muted} />
                <Text style={[styles.classLabel, { color: c.text }]}>{label}</Text>
                <Text style={[styles.small, { color: c.muted }]}>
                  · {rule.hours} {rule.hours === 1 ? 'hr' : 'hrs'}
                </Text>
                {item.extra ? (
                  <View style={[styles.tag, { backgroundColor: c.primarySoft }]}>
                    <Text style={[styles.tagText, { color: c.primary }]}>Extra</Text>
                  </View>
                ) : null}
              </View>
              {item.extra && !readOnly ? (
                <Pressable
                  hitSlop={10}
                  accessibilityLabel="Remove extra class"
                  onPress={() => removeClass(date, item.id)}>
                  <Icon name="close" size={16} color={c.faint} />
                </Pressable>
              ) : null}
            </View>
            {readOnly ? null : (
              <StatusSegment
                value={item.status}
                onChange={(status) => setClassStatus(date, item.id, status)}
              />
            )}
          </View>
        );
      })}
    </Card>
  );
}

function StatusSegment({
  value,
  onChange,
}: {
  value?: ClassStatus;
  onChange: (s: ClassStatus) => void;
}) {
  const c = useTheme();
  const options: { key: ClassStatus; label: string; icon: IconName; color: string }[] = [
    { key: 'present', label: 'Present', icon: 'check', color: c.green },
    { key: 'bunk', label: 'Bunk', icon: 'close', color: c.red },
    { key: 'cancelled', label: 'No class', icon: 'minus', color: c.muted },
  ];
  return (
    <View style={[styles.segment, { backgroundColor: c.cardAlt }]}>
      {options.map((o) => {
        const active = value === o.key;
        const fg = active ? '#FFFFFF' : c.muted;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.segmentItem,
              { backgroundColor: active ? o.color : 'transparent', opacity: pressed ? 0.7 : 1 },
            ]}>
            <Icon name={o.icon} size={14} color={fg} />
            <Text style={[styles.segmentText, { color: fg }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AddExtraClass({ date, subjects }: { date: string; subjects: Subject[] }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0].id);
  const [type, setType] = useState<ClassType>('theory');

  if (!open) {
    return <PillButton label="Add extra class" icon="plus" onPress={() => setOpen(true)} />;
  }

  return (
    <Card>
      <Text style={[styles.cardTitle, { color: c.text }]}>Add an extra class</Text>
      <View style={styles.wrap}>
        {subjects.map((sub) => (
          <Chip
            key={sub.id}
            label={sub.name}
            dot={sub.color}
            active={subjectId === sub.id}
            onPress={() => setSubjectId(sub.id)}
          />
        ))}
      </View>
      <View style={styles.wrap}>
        {(['theory', 'practical'] as ClassType[]).map((t) => (
          <Chip
            key={t}
            label={`${RULES[t].label} · ${RULES[t].hours} hr${RULES[t].hours > 1 ? 's' : ''}`}
            active={type === t}
            onPress={() => setType(t)}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <PillButton label="Cancel" style={styles.flex} onPress={() => setOpen(false)} />
        <PillButton
          label="Add class"
          tone="primary"
          solid
          style={styles.flex}
          onPress={() => {
            addExtraClass(date, subjectId, type);
            setOpen(false);
          }}
        />
      </View>
    </Card>
  );
}

export function Chip({
  label,
  active,
  onPress,
  dot,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  dot?: string;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? c.primarySoft : c.cardAlt,
          borderColor: active ? c.primary : 'transparent',
        },
      ]}>
      {dot ? <Dot color={dot} size={8} /> : null}
      <Text style={[styles.chipText, { color: active ? c.primary : c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', paddingVertical: 24 },
  bigIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  note: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 300 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  small: { fontSize: 13, fontWeight: '500' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classLabel: { fontSize: 15, fontWeight: '600' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  tagText: { fontSize: 11, fontWeight: '700' },
  segment: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 38,
    borderRadius: 9,
  },
  segmentText: { fontSize: 14, fontWeight: '600' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
});
