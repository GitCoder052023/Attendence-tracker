import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { colors, spacing } from '@/theme';

// Web has no system tab bar, so draw a plain bottom bar for browser previews.
export default function WebTabLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.bar}>
        <TabTrigger name="(today)" href="/" asChild>
          <TabButton icon="checklist" label="Today" />
        </TabTrigger>
        <TabTrigger name="overview" href="/overview" asChild>
          <TabButton icon="percent" label="Attendance" />
        </TabTrigger>
        <TabTrigger name="calendar" href="/calendar" asChild>
          <TabButton icon="calendar" label="Calendar" />
        </TabTrigger>
        <TabTrigger name="setup" href="/setup" asChild>
          <TabButton icon="table" label="Timetable" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  icon,
  label,
  isFocused,
  onPress,
  onLongPress,
}: TabTriggerSlotProps & { icon: IconName; label: string }) {
  const color = isFocused ? colors.accent : colors.tertiary;
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.button}>
      <Icon name={icon} size={22} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.ground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    paddingTop: spacing.sm,
    paddingBottom: spacing.smd,
  },
  button: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
