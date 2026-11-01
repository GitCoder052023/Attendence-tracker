import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { Button } from '@/components/button';
import { Group, Row } from '@/components/group';
import { MonthCalendar } from '@/components/month-calendar';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { formatShort, rangeKeys } from '@/lib/dates';
import { addHolidays, useAppState } from '@/lib/store';
import { colors, spacing, type } from '@/theme';

export default function AddHolidaysScreen() {
  const s = useAppState();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [start, setStart] = useState<string>();
  const [end, setEnd] = useState<string>();
  const [name, setName] = useState('');

  const selected = start ? rangeKeys(start, end ?? start) : [];
  const selectedSet = new Set(selected);
  const save = () => {
    addHolidays(selected, name);
    router.back();
  };

  const pick = (key: string) => {
    if (!start || end) {
      setStart(key);
      setEnd(undefined);
    } else {
      setEnd(key);
    }
  };

  const summary =
    selected.length === 0
      ? 'Tap a date for a single holiday, or tap the first and last day of a break.'
      : selected.length === 1
        ? `${formatShort(selected[0])}. Tap another date to make it a break.`
        : `${formatShort(selected[0])} to ${formatShort(selected[selected.length - 1])}, ${selected.length} days.`;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button title="Add" variant="plain" disabled={selected.length === 0} onPress={save} />
          ),
        }}
      />
      <Page>
        <Group footer={summary}>
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
              onPressDay={pick}
              look={(key) =>
                selectedSet.has(key)
                  ? { fill: colors.accent, ink: colors.onAccent }
                  : key in s.holidays
                    ? { fill: colors.holidayWash, ink: colors.holiday }
                    : {}
              }
            />
          </Row>
        </Group>

        <Group title="Name" footer="Optional. Shown in your holiday list.">
          <Row>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Diwali break"
              placeholderTextColor={colors.tertiary}
              returnKeyType="done"
              style={[type.body, { paddingVertical: spacing.xs }]}
            />
          </Row>
        </Group>

        {selected.length > 0 ? (
          <Button
            title={selected.length > 1 ? `Add ${selected.length} holidays` : 'Add holiday'}
            variant="primary"
            onPress={save}
          />
        ) : (
          <ThemedText variant="footnote" style={{ paddingHorizontal: spacing.md }}>
            Classes on holidays are left out of every percentage.
          </ThemedText>
        )}
      </Page>
    </>
  );
}
