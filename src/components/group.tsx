import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, radius, spacing } from '@/theme';

/** Inset-grouped section: optional header and footer, rows split by hairlines. */
export function Group({
  title,
  swatch,
  aside,
  footer,
  children,
}: {
  title?: string;
  /** Subject colour shown before the title. */
  swatch?: string;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={{ gap: spacing.sm }}>
      {title || aside ? (
        <View style={styles.header}>
          {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
          {title ? (
            <ThemedText variant="footnote" style={{ flex: 1 }}>
              {title}
            </ThemedText>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {aside}
        </View>
      ) : null}
      <View style={styles.surface}>
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? <View style={styles.separator} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {typeof footer === 'string' ? (
        <ThemedText variant="footnote" style={styles.footer}>
          {footer}
        </ThemedText>
      ) : (
        footer
      )}
    </View>
  );
}

/** A list row. Tappable rows highlight their background while pressed. */
export function Row({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  if (!onPress) return <View style={[styles.row, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  swatch: { width: 10, height: 10, borderRadius: 2, alignSelf: 'center' },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: spacing.md,
  },
  row: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: spacing.md },
});
