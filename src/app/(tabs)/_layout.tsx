import { NativeTabs } from 'expo-router/native-tabs';

import { colors } from '@/theme';

export default function TabLayout() {
  return (
    <NativeTabs tintColor={colors.accent}>
      <NativeTabs.Trigger name="(today)">
        <NativeTabs.Trigger.Icon sf="checklist" md="checklist" />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="overview">
        <NativeTabs.Trigger.Icon sf="percent" md="percent" />
        <NativeTabs.Trigger.Label>Attendance</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="setup">
        <NativeTabs.Trigger.Icon sf="tablecells" md="table_view" />
        <NativeTabs.Trigger.Label>Timetable</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
