export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = window.localStorage.getItem(`queueless_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[storage] Error reading key "${key}":`, e);
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`queueless_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] Error setting key "${key}":`, e);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`queueless_${key}`);
    } catch (e) {
      console.warn(`[storage] Error removing key "${key}":`, e);
    }
  },
};
