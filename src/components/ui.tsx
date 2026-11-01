import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { radius, useTheme } from '@/constants/theme';

/** Scrollable tab screen with a large title header. */
export function Screen({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.screen,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
      ]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {subtitle ? <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text> : null}
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: ReactNode }) {
  const c = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.section, { color: c.muted }]}>{children.toUpperCase()}</Text>
      {right}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.6 : 1 },
      ]}>
      <Icon name={icon} size={16} color={c.text} />
    </Pressable>
  );
}

type Tone = 'primary' | 'green' | 'red' | 'holiday' | 'neutral';

export function PillButton({
  label,
  icon,
  onPress,
  tone = 'neutral',
  solid = false,
  disabled = false,
  style,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  tone?: Tone;
  solid?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const c = useTheme();
  const colors: Record<Tone, [string, string]> = {
    primary: [c.primary, c.primarySoft],
    green: [c.green, c.greenSoft],
    red: [c.red, c.redSoft],
    holiday: [c.holiday, c.holidaySoft],
    neutral: [c.text, c.cardAlt],
  };
  const [fg, soft] = colors[tone];
  const textColor = solid ? c.onPrimary : fg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: solid ? fg : soft, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={15} color={textColor} /> : null}
      <Text style={[styles.pillText, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 16, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6 },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
    borderCurve: 'continuous',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginHorizontal: 4,
  },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.pill,
  },
  pillText: { fontSize: 14, fontWeight: '600' },
});
