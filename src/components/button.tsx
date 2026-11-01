import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { colors, radius, spacing } from '@/theme';

const variants = {
  primary: { bg: colors.accent, fg: colors.onAccent },
  secondary: { bg: colors.well, fg: colors.ink },
  destructive: { bg: colors.shortWash, fg: colors.short },
  plain: { bg: 'transparent', fg: colors.accent },
} as const;

export function Button({
  title,
  icon,
  variant = 'secondary',
  disabled,
  onPress,
  style,
}: {
  title: string;
  icon?: IconName;
  variant?: keyof typeof variants;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, opacity: disabled ? 0.4 : pressed ? 0.65 : 1 },
        variant === 'plain' && styles.plain,
        style,
      ]}>
      {icon ? <Icon name={icon} size={16} color={v.fg} /> : null}
      <Text style={[styles.label, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

/** Icon-only button for stack header toolbars. */
export function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.5 : 1 }]}>
      <Icon name={icon} size={20} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  plain: { paddingHorizontal: spacing.sm, minHeight: 32 },
  label: { fontSize: 16, fontWeight: '600' },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
