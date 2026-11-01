import type { TextStyle } from 'react-native';

// The app is light-only (app.json userInterfaceStyle: "light"), so tokens are plain values.
// Direction: a clinical paper ground, green-black ink, and one ballpoint-register blue for actions.

export const colors = {
  ground: '#F3F5F4',
  surface: '#FFFFFF',
  pressed: '#ECEFED',
  well: '#EEF1EF', // inset controls sitting on a surface
  ink: '#15201C',
  secondary: '#56615C',
  tertiary: '#6A7570', // ≥4.5:1 on white; placeholders too
  separator: '#E1E6E3',
  accent: '#2346B0',
  accentWash: '#E8EDFA',
  onAccent: '#FFFFFF',
  // Verdict colours: used only for the 75% / 80% verdict and the marks that drive it.
  good: '#1E7A4C',
  goodWash: '#DDF3E6',
  short: '#C0322B',
  shortWash: '#FDE9E7',
  notice: '#92400E',
  noticeWash: '#FFF4DC',
  holiday: '#2346B0',
  holidayWash: '#E8EDFA',
  markPresent: '#3E4C46', // register strip: ink at reduced weight so bunks stand out
} as const;

/** Subject identity swatches, muted so they read as labels rather than status. */
export const subjectColors = ['#2F5BD3', '#B07D12', '#B83B6B', '#0E7490', '#8B5E3C', '#4B5563'];

export const spacing = {
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  full: 9999,
} as const;

export const type = {
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  headline: { fontSize: 17, fontWeight: '600', color: colors.ink },
  body: { fontSize: 16, fontWeight: '400', color: colors.ink },
  subhead: { fontSize: 15, fontWeight: '400', color: colors.secondary },
  footnote: { fontSize: 13, fontWeight: '400', color: colors.secondary, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', color: colors.tertiary },
  figure: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
} as const satisfies Record<string, TextStyle>;

export const shadows = {
  floating: '0 6px 20px rgba(21, 32, 28, 0.12)',
} as const;
