import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/constants/theme';

// Web has no system tab bar, so draw a simple bottom bar for browser previews.
export default function WebTabLayout() {
  const c = useTheme();
  return (
    <Tabs>
      <TabSlot />
      <TabList style={[styles.bar, { backgroundColor: c.card, borderTopColor: c.border }]}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="checkCircle" label="Today" />
        </TabTrigger>
        <TabTrigger name="overview" href="/overview" asChild>
          <TabButton icon="shield" label="Attendance" />
        </TabTrigger>
        <TabTrigger name="calendar" href="/calendar" asChild>
          <TabButton icon="calendar" label="Calendar" />
        </TabTrigger>
        <TabTrigger name="setup" href="/setup" asChild>
          <TabButton icon="book" label="Timetable" />
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
  const c = useTheme();
  const color = isFocused ? c.primary : c.muted;
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.button}>
      <Icon name={icon} size={20} color={color} />
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: 12,
  },
  button: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
