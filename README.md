# Attendance Tracker

A simple attendance tracker for medical college students, built with Expo and Expo Router.
All data stays on the phone (SQLite key-value store via `expo-sqlite/kv-store`). Light mode only; see [DESIGN.md](DESIGN.md) for the visual system.

## What it does

- **Timetable** – set, per subject, which weekdays have theory (1 hr) and practical (2 hrs) classes.
  Add holidays (single days or a whole break).
- **Today** – mark each class as Present, Bunk or No class. One-tap "All present", "Bunk day" and
  "Mark as holiday". Add extra classes for a day.
- **Attendance** – per subject, theory and practical counted separately:
  - Theory needs 75%, practical needs 80%. Green when at or above, red when below.
  - Below the minimum: how many classes in a row you must attend, and roughly by which day.
  - Above the minimum: how many classes you can still bunk, and how many timetable days that covers.
- **Calendar** – month view of attended, bunked, unmarked and holiday days; tap any day to edit it.

Holidays and "No class" are never counted. Unmarked classes are not counted until marked.
Attendance can only be marked for today or past days; holidays can be set for any date.

## Run it

```bash
npm install
npx expo start
```

Then open it in Expo Go or a development build. Lint and typecheck:

```bash
npx expo lint
npx tsc --noEmit
```
