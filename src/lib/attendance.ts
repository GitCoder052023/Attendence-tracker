import { addDays, todayKey } from './dates';
import { classesForDay, isHoliday } from './store';
import type { AppState, ClassType } from './types';

export const RULES: Record<ClassType, { min: number; hours: number; label: string }> = {
  theory: { min: 75, hours: 1, label: 'Theory' },
  practical: { min: 80, hours: 2, label: 'Practical' },
};

const LOOKAHEAD_DAYS = 365;

export interface Projection {
  /** Number of timetable days (that have this subject's classes) involved. */
  days: number;
  /** Last of those days. */
  until?: string;
}

export interface Stat {
  attended: number;
  held: number;
  /** null until at least one class has been marked present or bunk. */
  percent: number | null;
  ok: boolean | null;
  /** Classes to attend in a row to get back to the minimum (0 when ok). */
  need: number;
  /** Classes that can be bunked while staying at or above the minimum. */
  canBunk: number;
  /** How the need / canBunk classes map onto upcoming timetable days; null if the timetable has none. */
  projection: Projection | null;
}

/** Upcoming days (from today) with unmarked classes of this subject and type, skipping holidays. */
function* upcomingDays(s: AppState, subjectId: string, type: ClassType, from: string) {
  for (let i = 0; i < LOOKAHEAD_DAYS; i++) {
    const date = addDays(from, i);
    if (isHoliday(s, date)) continue;
    const n = classesForDay(s, date).filter(
      (c) => c.subjectId === subjectId && c.type === type && !c.status,
    ).length;
    if (n > 0) yield { date, n };
  }
}

export function computeStat(
  s: AppState,
  subjectId: string,
  type: ClassType,
  today: string = todayKey(),
): Stat {
  let attended = 0;
  let held = 0;
  for (const [date, classes] of Object.entries(s.days)) {
    if (isHoliday(s, date)) continue;
    for (const c of classes) {
      if (c.subjectId !== subjectId || c.type !== type) continue;
      if (c.status === 'present') {
        attended++;
        held++;
      } else if (c.status === 'bunk') {
        held++;
      }
    }
  }

  const min = RULES[type].min;
  if (held === 0) {
    return { attended, held, percent: null, ok: null, need: 0, canBunk: 0, projection: null };
  }

  // Integer maths avoids floating point surprises right at the 75% / 80% line.
  const ok = 100 * attended >= min * held;
  const need = ok ? 0 : Math.ceil((min * held - 100 * attended) / (100 - min));
  const canBunk = ok ? Math.floor((100 * attended - min * held) / min) : 0;

  let projection: Projection | null = null;
  const days = upcomingDays(s, subjectId, type, today);
  if (!ok) {
    let total = 0;
    let count = 0;
    for (const d of days) {
      total += d.n;
      count++;
      if (total >= need) {
        projection = { days: count, until: d.date };
        break;
      }
    }
  } else {
    let total = 0;
    let count = 0;
    let any = false;
    for (const d of days) {
      any = true;
      if (total + d.n > canBunk) break;
      total += d.n;
      count++;
      projection = { days: count, until: d.date };
    }
    if (any && !projection) projection = { days: 0 };
  }

  return { attended, held, percent: (100 * attended) / held, ok, need, canBunk, projection };
}

/** The last `limit` counted marks (present or bunk) for a subject and type, oldest first. */
export function recentMarks(
  s: AppState,
  subjectId: string,
  type: ClassType,
  limit: number,
): ('present' | 'bunk')[] {
  const marks: ('present' | 'bunk')[] = [];
  for (const date of Object.keys(s.days).sort()) {
    if (isHoliday(s, date)) continue;
    for (const c of s.days[date]) {
      if (c.subjectId !== subjectId || c.type !== type) continue;
      if (c.status === 'present' || c.status === 'bunk') marks.push(c.status);
    }
  }
  return marks.slice(-limit);
}

/** Rounds down so 74.9% never shows as 75%. */
export function formatPercent(p: number): string {
  const floored = Math.floor(p * 10) / 10;
  return `${Number.isInteger(floored) ? floored : floored.toFixed(1)}%`;
}

export const plural = (n: number, word: string) =>
  `${n} ${n === 1 ? word : word.endsWith('s') ? `${word}es` : `${word}s`}`;
