/**
 * QueueLess Tab-Scoped Authentication Token Manager
 *
 * Security Rationale:
 * - Uses sessionStorage (tab-isolated, destroyed when tab/browser closes, survives F5 reload).
 * - Avoids persistent disk storage in localStorage to limit long-term credential exposure.
 * - In-memory cache provides synchronous, fast access across client requests.
 * - Never logged or exposed via NEXT_PUBLIC_* variables.
 * - Works synergistically with HttpOnly cookies as a cross-site Bearer fallback.
 */

const TOKEN_KEY = 'queueless_auth_token';

let inMemoryToken: string | null = null;

export const getAuthToken = (): string | null => {
  if (inMemoryToken) {
    return inMemoryToken;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = window.sessionStorage.getItem(TOKEN_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      // sessionStorage may be unavailable in private browsing or restricted iframes
    }
  }
  return null;
};

export const setAuthToken = (token: string | null | undefined): void => {
  inMemoryToken = token || null;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        window.sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        window.sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Ignore storage access errors
    }
  }
};

export const clearAuthToken = (): void => {
  setAuthToken(null);
};
