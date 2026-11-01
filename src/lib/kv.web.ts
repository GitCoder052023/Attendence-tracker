// Web fallback for kv.ts, used only for previewing the app in a browser.
const ls = () => (typeof window === 'undefined' ? null : window.localStorage);

export const kv = {
  get: (key: string): string | null => {
    try {
      return ls()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      ls()?.setItem(key, value);
    } catch {}
  },
  remove: (key: string) => {
    try {
      ls()?.removeItem(key);
    } catch {}
  },
};
