# Design

Light mode only (`app.json` → `userInterfaceStyle: "light"`). All tokens live in `src/theme/index.ts`;
screens use the primitives in `src/components/` and never hardcode colours or font sizes.

## Direction

An attendance register for a first-year MBBS student. The look borrows from that world rather than from
app templates:

- **Clinical paper ground** (`ground #F3F5F4`) with plain white surfaces. No borders, no card shadows.
- **Green-black ink** (`ink #15201C`) for text.
- **One accent:** ballpoint-register blue (`accent #2346B0`), used for actions and selection only.
- **Verdict colours are reserved.** `good #1E7A4C` and `short #C0322B` only ever mean "at or above the
  75% / 80% minimum" and "below it" (plus the present/bunk marks that drive them). `notice #92400E` means
  "no margin left" or "not marked".
- **Register strip.** Each theory/practical row on the Attendance tab shows one cell per marked class,
  filled for present and hollow red for a bunk, like the P/A grid in a college register. This is the
  app's one signature element; keep other decoration out.

## Structure

- Native stack headers with large titles on every tab (`components/tab-stack.tsx`). No hand-built headers.
- Content is inset-grouped lists (`Group` + `Row`) split by hairlines, not stacks of cards.
- One primary button per screen at most (e.g. "Mark all present"). Other actions are text rows.
- Sentence case everywhere. No all-caps labels, no `A · B · C` meta strings, no emoji.
- System font (SF / Roboto), tabular figures for every number that updates.

## Skills used

Installed in `.claude/skills/`: `frontend-design` (Anthropic), `expo-design-system`, `expo-native-ui`,
`expo-animation` (Expo). The anti-slop review also followed the `design-taste-frontend` skill's
app-screen rules. Re-run the greps in `.claude/skills/expo-design-system/references/native-slop.md`
after UI changes.
