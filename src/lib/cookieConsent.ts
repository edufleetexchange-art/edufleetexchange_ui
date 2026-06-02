/**
 * Cookie consent helper. Persists user preferences in localStorage and exposes
 * a small read API for any code that wants to gate non-essential tracking on
 * consent (analytics, marketing).
 *
 * The CookiePolicy page writes preferences here; integration points (when we
 * wire up Google Analytics, ads tracking pixels, etc.) read via hasConsent().
 *
 * Essential cookies are always on (session/auth) and never gated by this helper.
 */

const STORAGE_KEY = 'cookiePreferences';

export interface CookiePreferences {
  essential: boolean;     // always true; here for completeness in the saved shape
  analytics: boolean;
  marketing: boolean;
}

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,   // opt-in
  marketing: false,   // opt-in
};

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      essential: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function setCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, essential: true }));
  } catch {
    /* localStorage may be disabled in private windows; silently no-op */
  }
}

export type ConsentCategory = 'analytics' | 'marketing';

/**
 * Use this anywhere you want to gate a non-essential cookie/script on user
 * consent. Example:
 *
 *   if (hasConsent('analytics')) loadGoogleAnalytics();
 */
export function hasConsent(category: ConsentCategory): boolean {
  const prefs = getCookiePreferences();
  return prefs[category] === true;
}
