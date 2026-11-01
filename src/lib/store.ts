import { useSyncExternalStore } from 'react';

import { subjectColors } from '@/theme';

import { weekday } from './dates';
import { kv } from './kv';
import type { AppState, ClassEntry, ClassStatus, ClassType, Subject, SubjectSchedule } from './types';

const STORAGE_KEY = 'attendance-state-v1';

export const SUBJECT_COLORS = subjectColors;
export const MAX_SUBJECTS = SUBJECT_COLORS.length;

const emptyWeek = () => [0, 0, 0, 0, 0, 0, 0];
const emptySchedule = (): SubjectSchedule => ({ theory: emptyWeek(), practical: emptyWeek() });
const newId = () => Math.random().toString(36).slice(2, 10);

function defaultState(): AppState {
  const subjects: Subject[] = ['Anatomy', 'Physiology', 'Biochemistry'].map((name, i) => ({
    id: newId(),
    name,
    color: SUBJECT_COLORS[i],
  }));
  return {
    version: 1,
    subjects,
    schedule: Object.fromEntries(subjects.map((s) => [s.id, emptySchedule()])),
    days: {},
    holidays: {},
  };
}

function load(): AppState {
  try {
    const raw = kv.get(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.version === 1 && Array.isArray(parsed.subjects)) {
        // Subjects saved with an older palette get the current swatch for their position.
        parsed.subjects = parsed.subjects.map((sub, i) =>
          SUBJECT_COLORS.includes(sub.color)
            ? sub
            : { ...sub, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] },
        );
        return parsed;
      }
    }
  } catch {}
  return defaultState();
}

let state: AppState = load();
const listeners = new Set<() => void>();

function setState(next: AppState) {
  state = next;
  kv.set(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// ---------- Derived helpers ----------

/** Classes the weekly timetable puts on a date. */
function scheduledClasses(s: AppState, date: string): ClassEntry[] {
  const wd = weekday(date);
  const list: ClassEntry[] = [];
  for (const subject of s.subjects) {
    const sched = s.schedule[subject.id];
    if (!sched) continue;
    for (const type of ['theory', 'practical'] as ClassType[]) {
      for (let i = 0; i < sched[type][wd]; i++) {
        list.push({ id: `${subject.id}-${type}-${i}`, subjectId: subject.id, type });
      }
    }
  }
  return list;
}

/** Classes on a date: what was saved for that day, otherwise what the timetable says. */
export function classesForDay(s: AppState, date: string): ClassEntry[] {
  return s.days[date] ?? scheduledClasses(s, date);
}

export function isHoliday(s: AppState, date: string): boolean {
  return date in s.holidays;
}

// ---------- Actions ----------

function updateDay(date: string, fn: (classes: ClassEntry[]) => ClassEntry[]) {
  const current = classesForDay(state, date);
  setState({ ...state, days: { ...state.days, [date]: fn(current) } });
}

/** Sets a class's status; choosing the status it already has clears it. */
export function setClassStatus(date: string, classId: string, status: ClassStatus) {
  updateDay(date, (classes) =>
    classes.map((c) =>
      c.id === classId ? { ...c, status: c.status === status ? undefined : status } : c,
    ),
  );
}

export function markWholeDay(date: string, status: ClassStatus, onlyUnmarked = false) {
  updateDay(date, (classes) =>
    classes.map((c) => (onlyUnmarked && c.status ? c : { ...c, status })),
  );
}

export function addExtraClass(date: string, subjectId: string, type: ClassType) {
  updateDay(date, (classes) => [
    ...classes,
    { id: `x-${newId()}`, subjectId, type, extra: true },
  ]);
}

export function removeClass(date: string, classId: string) {
  updateDay(date, (classes) => classes.filter((c) => c.id !== classId));
}

export function addHolidays(dates: string[], name: string) {
  const holidays = { ...state.holidays };
  for (const d of dates) holidays[d] = name.trim();
  setState({ ...state, holidays });
}

export function removeHolidays(dates: string[]) {
  const holidays = { ...state.holidays };
  for (const d of dates) delete holidays[d];
  setState({ ...state, holidays });
}

/** Cycles the number of classes on a weekday: 0 → 1 → 2 → 0. */
export function cycleScheduleCount(subjectId: string, type: ClassType, wd: number) {
  const sched = state.schedule[subjectId] ?? emptySchedule();
  const week = [...sched[type]];
  week[wd] = (week[wd] + 1) % 3;
  setState({
    ...state,
    schedule: { ...state.schedule, [subjectId]: { ...sched, [type]: week } },
  });
}

export function renameSubject(id: string, name: string) {
  setState({
    ...state,
    subjects: state.subjects.map((s) => (s.id === id ? { ...s, name } : s)),
  });
}

export function addSubject(name: string) {
  if (state.subjects.length >= MAX_SUBJECTS) return;
  const used = new Set(state.subjects.map((s) => s.color));
  const subject: Subject = {
    id: newId(),
    name: name.trim() || `Subject ${state.subjects.length + 1}`,
    color: SUBJECT_COLORS.find((c) => !used.has(c)) ?? SUBJECT_COLORS[0],
  };
  setState({
    ...state,
    subjects: [...state.subjects, subject],
    schedule: { ...state.schedule, [subject.id]: emptySchedule() },
  });
}

/** Removes a subject together with its timetable and every attendance record for it. */
export function deleteSubject(id: string) {
  const schedule = { ...state.schedule };
  delete schedule[id];
  const days: AppState['days'] = {};
  for (const [date, classes] of Object.entries(state.days)) {
    days[date] = classes.filter((c) => c.subjectId !== id);
  }
  setState({
    ...state,
    subjects: state.subjects.filter((s) => s.id !== id),
    schedule,
    days,
  });
}

export function resetAllData() {
  kv.remove(STORAGE_KEY);
  setState(defaultState());
}
