import * as Haptics from 'expo-haptics';

/** Light tick when a mark is set. iOS only; Android and web stay silent. */
export function tick() {
  if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
}
