import { useColorScheme } from 'react-native';

const light = {
  bg: '#F3F4F9',
  card: '#FFFFFF',
  cardAlt: '#F1F3F8',
  text: '#101828',
  muted: '#667085',
  faint: '#A3AAB8',
  border: '#E5E8F0',
  primary: '#4F46E5',
  primarySoft: '#ECEBFF',
  onPrimary: '#FFFFFF',
  green: '#15A34A',
  greenSoft: '#E3F6EA',
  red: '#E5484D',
  redSoft: '#FDECEC',
  amber: '#D97706',
  amberSoft: '#FDF2E1',
  holiday: '#0B8FD8',
  holidaySoft: '#E1F2FC',
  track: '#E9ECF3',
};

const dark: typeof light = {
  bg: '#0B0E16',
  card: '#151A26',
  cardAlt: '#1D2331',
  text: '#F2F4F8',
  muted: '#98A2B3',
  faint: '#5D6676',
  border: '#252C3B',
  primary: '#8B85FF',
  primarySoft: '#25234A',
  onPrimary: '#FFFFFF',
  green: '#3DD07A',
  greenSoft: '#13301F',
  red: '#FF6B6F',
  redSoft: '#3A1A1C',
  amber: '#F5A524',
  amberSoft: '#3A2A10',
  holiday: '#45B4F2',
  holidaySoft: '#10293A',
  track: '#262D3C',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
