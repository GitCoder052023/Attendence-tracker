import { useState } from 'react';
import { View } from 'react-native';

import { DayEditor } from '@/components/day-editor';
import { IconButton, PillButton, Screen } from '@/components/ui';
import { addDays, formatLong, relativeLabel, todayKey } from '@/lib/dates';

export default function TodayScreen() {
  const [date, setDate] = useState(todayKey);
  const isToday = date === todayKey();

  return (
    <Screen
      title={relativeLabel(date)}
      subtitle={formatLong(date)}
      right={
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {isToday ? null : (
            <PillButton label="Today" tone="primary" onPress={() => setDate(todayKey())} style={{ height: 36 }} />
          )}
          <IconButton icon="left" label="Previous day" onPress={() => setDate((d) => addDays(d, -1))} />
          <IconButton icon="right" label="Next day" onPress={() => setDate((d) => addDays(d, 1))} />
        </View>
      }>
      <DayEditor date={date} />
    </Screen>
  );
}
