import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { colors, spacing } from '@/theme';

/** Scrollable screen body under a native stack header. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl * 2,
        gap: spacing.lg,
      }}>
      {children}
    </ScrollView>
  );
}
