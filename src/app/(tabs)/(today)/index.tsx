import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, HeaderButton } from '@/components/button';
import { DayEditor } from '@/components/day-editor';
import { Page } from '@/components/page';
import { addDays, relativeLabel, todayKey } from '@/lib/dates';

export default function TodayScreen() {
  const [date, setDate] = useState(todayKey);
  const isToday = date === todayKey();

  return (
    <>
      <Stack.Screen
        options={{
          title: relativeLabel(date),
          headerLeft: isToday
            ? undefined
            : () => <Button title="Today" variant="plain" onPress={() => setDate(todayKey())} />,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <HeaderButton icon="left" label="Previous day" onPress={() => setDate((d) => addDays(d, -1))} />
              <HeaderButton icon="right" label="Next day" onPress={() => setDate((d) => addDays(d, 1))} />
            </View>
          ),
        }}
      />
      <Page>
        <DayEditor date={date} />
      </Page>
    </>
  );
}
