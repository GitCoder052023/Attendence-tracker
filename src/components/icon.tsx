import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

// SF Symbols on iOS, Material Symbols on Android and web.
const ICONS = {
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  checkCircle: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  minus: { ios: 'minus', android: 'remove', web: 'remove' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  left: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  right: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  sun: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  shield: { ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  bunk: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
  book: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
  flask: { ios: 'testtube.2', android: 'science', web: 'science' },
  checklist: { ios: 'checklist', android: 'checklist', web: 'checklist' },
  percent: { ios: 'percent', android: 'percent', web: 'percent' },
  table: { ios: 'tablecells', android: 'table_view', web: 'table_view' },
} satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  color,
}: {
  name: IconName;
  size?: number;
  color: ColorValue;
}) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} weight="semibold" />;
}
