import { Stack, useLocalSearchParams } from 'expo-router';

import { DayEditor } from '@/components/day-editor';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { isValidKey, relativeLabel } from '@/lib/dates';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

  if (!isValidKey(date)) {
    return (
      <Page>
        <ThemedText variant="body">This date doesn&apos;t exist. Go back and pick another day.</ThemedText>
      </Page>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: relativeLabel(date) }} />
      <Page>
        <DayEditor date={date} />
      </Page>
    </>
  );
}
