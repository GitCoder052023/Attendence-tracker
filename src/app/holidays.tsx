import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { Card, PillButton } from '@/components/ui';
import { radius, useTheme } from '@/constants/theme';
import { formatShort, rangeKeys } from '@/lib/dates';
import { addHolidays, useAppState } from '@/lib/store';

export default function AddHolidaysScreen() {
  const s = useAppState();
  const c = useTheme();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [start, setStart] = useState<string>();
  const [end, setEnd] = useState<string>();
  const [name, setName] = useState('');

  const selected = start ? rangeKeys(start, end ?? start) : [];
  const selectedSet = new Set(selected);

  const pick = (key: string) => {
    if (!start || end) {
      setStart(key);
      setEnd(undefined);
    } else {
      setEnd(key);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}>
      <Text style={[styles.hint, { color: c.muted }]}>
        Tap a date for one holiday, or tap the first and last date of a break (like a vacation).
      </Text>
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
          onPressDay={pick}
          look={(key) =>
            selectedSet.has(key)
              ? { bg: c.primary, fg: c.onPrimary }
              : key in s.holidays
                ? { bg: c.holidaySoft, fg: c.holiday }
                : {}
          }
        />
      </Card>

      <Card>
        <Text style={[styles.label, { color: c.text }]}>
          {selected.length === 0
            ? 'No dates selected'
            : selected.length === 1
              ? formatShort(selected[0])
              : `${formatShort(selected[0])} – ${formatShort(selected[selected.length - 1])} · ${selected.length} days`}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name (optional), e.g. Diwali break"
          placeholderTextColor={c.faint}
          style={[styles.input, { color: c.text, backgroundColor: c.cardAlt }]}
        />
        <PillButton
          label={selected.length > 1 ? `Add ${selected.length} holidays` : 'Add holiday'}
          tone="holiday"
          solid
          disabled={selected.length === 0}
          onPress={() => {
            addHolidays(selected, name);
            router.back();
          }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  hint: { fontSize: 14, lineHeight: 20, marginHorizontal: 4 },
  label: { fontSize: 16, fontWeight: '700' },
  input: { height: 46, borderRadius: radius.md, paddingHorizontal: 14, fontSize: 15 },
});
