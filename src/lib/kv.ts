import Storage from 'expo-sqlite/kv-store';

// On-device key-value storage backed by SQLite. Web uses kv.web.ts instead.
export const kv = {
  get: (key: string) => Storage.getItemSync(key),
  set: (key: string, value: string) => Storage.setItemSync(key, value),
  remove: (key: string) => {
    Storage.removeItemSync(key);
  },
};
