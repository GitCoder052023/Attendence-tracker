// All dates are handled as local calendar days in the form YYYY-MM-DD.

export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function weekday(key: string): number {
  return fromKey(key).getDay();
}

export function isValidKey(key: string | undefined): key is string {
  return !!key && /^\d{4}-\d{2}-\d{2}$/.test(key) && toKey(fromKey(key)) === key;
}

/** "Sat, 1 Nov" */
export function formatShort(key: string): string {
  const d = fromKey(key);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "1 Nov" */
export function formatDayMonth(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "Saturday" */
export function formatWeekday(key: string): string {
  return WEEKDAYS_LONG[weekday(key)];
}

/** "1 November 2026" */
export function formatLong(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonth(year: number, month: number): string {
  return `${MONTHS_LONG[month]} ${year}`;
}

/** "Today", "Yesterday", "Tomorrow" or the weekday name. */
export function relativeLabel(key: string): string {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  if (key === addDays(today, 1)) return 'Tomorrow';
  return formatWeekday(key);
}

/** Keys from start to end inclusive (order of arguments doesn't matter). */
export function rangeKeys(a: string, b: string): string[] {
  const [start, end] = a <= b ? [a, b] : [b, a];
  const keys: string[] = [];
  for (let k = start; k <= end; k = addDays(k, 1)) keys.push(k);
  return keys;
}
