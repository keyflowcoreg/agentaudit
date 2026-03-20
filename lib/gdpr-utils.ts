"use client";

// ---------------------------------------------------------------------------
// GDPR Consent Utilities
// ---------------------------------------------------------------------------

export const CONSENT_KEY = "cookie-consent";

export const COOKIE_CATEGORIES = [
  "necessary",
  "analytics",
  "marketing",
  "preferences",
] as const;

export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];

export interface ConsentState {
  necessary: boolean; // always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string; // ISO-8601
  version: number; // bump when policy changes
}

const CURRENT_VERSION = 1;

/** Default consent: only necessary cookies enabled. */
export function defaultConsent(): ConsentState {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
  };
}

/** Read stored consent. Returns `null` when no decision has been recorded. */
export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: ConsentState = JSON.parse(raw);
    // Invalidate stale versions so the banner re-appears after policy changes.
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist consent and dispatch a custom event so other components can react. */
export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const stamped: ConsentState = {
    ...state,
    necessary: true, // enforce: always on
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(stamped));
  window.dispatchEvent(
    new CustomEvent("consent-updated", { detail: stamped }),
  );
}

/** Check whether a specific category has been granted. */
export function hasConsent(category: CookieCategory | string): boolean {
  if (category === "necessary") return true;
  const consent = getConsent();
  if (!consent) return false;
  return Boolean(consent[category as keyof ConsentState]);
}

/**
 * Conditionally inject a `<script>` tag only when consent for the given
 * category has been granted.  Returns `true` if the script was injected,
 * `false` otherwise.
 *
 * Idempotent: calling with the same `src` twice will not create duplicates.
 */
export function loadScript(
  src: string,
  category: CookieCategory | string,
  attributes?: Record<string, string>,
): boolean {
  if (typeof window === "undefined") return false;
  if (!hasConsent(category)) return false;
  if (document.querySelector(`script[src="${src}"]`)) return true;

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  if (attributes) {
    Object.entries(attributes).forEach(([k, v]) => script.setAttribute(k, v));
  }
  document.head.appendChild(script);
  return true;
}

/** Remove consent entirely (e.g. "withdraw consent" flow). */
export function revokeConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent("consent-revoked"));
}
