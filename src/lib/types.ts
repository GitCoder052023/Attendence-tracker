export type ClassType = 'theory' | 'practical';

/** present = attended, bunk = missed, cancelled = class didn't happen (not counted). */
export type ClassStatus = 'present' | 'bunk' | 'cancelled';

export interface Subject {
  id: string;
  name: string;
  color: string;
}

/** Number of classes per weekday, index 0 = Sunday … 6 = Saturday. */
export type WeekCounts = number[];

export interface SubjectSchedule {
  theory: WeekCounts;
  practical: WeekCounts;
}

export interface ClassEntry {
  id: string;
  subjectId: string;
  type: ClassType;
  status?: ClassStatus;
  /** Added by hand for this one day, not part of the weekly timetable. */
  extra?: boolean;
}

export interface AppState {
  version: 1;
  subjects: Subject[];
  schedule: Record<string, SubjectSchedule>;
  /** Classes of a day, saved once anything on that day is marked. Keyed by YYYY-MM-DD. */
  days: Record<string, ClassEntry[]>;
  /** Holiday dates (YYYY-MM-DD) → optional name. */
  holidays: Record<string, string>;
}
