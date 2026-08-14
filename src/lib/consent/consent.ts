// Cookie consent — mechanism only. This pass builds the gate; no gated
// script (GA/GTM/Clarity/Bing/Meta Pixel) is wired to it yet. See this
// module's own exports for the shape a future integration must use.
//
// Framework-agnostic on purpose (no React import here) — a future
// non-React consumer (a plain <script>-tag loader, a server action) can
// call these functions directly. CookieConsentBanner.tsx is the only
// React-specific code, and it subscribes via useSyncExternalStore the
// same way LocaleSwitcher.tsx already does for its own client-only state.

export type ConsentCategory = "analytics" | "marketing";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

// Cookie policy's own table (§ "Come funziona il consenso") names this
// row "Preferenza cookie" / 6 mesi — that's the human-readable label, not
// a literal cookie name (spaces aren't valid in one). This is the real
// technical name; the 180-day max-age below is what "6 mesi" means here.
const COOKIE_NAME = "cookie_consent";
const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 6 months, matching the cookie policy

function readRawCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeRawCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

function deleteRawCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
      return {
        necessary: true,
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
      };
    }
  } catch {
    // Malformed cookie (hand-edited, truncated, old shape) — treat as
    // undecided rather than throwing. The banner reappears, which is the
    // safe failure direction here.
  }
  return null;
}

/** Reads the current stored choice, or `null` if the visitor hasn't
 * decided yet (or the cookie was deleted/expired). */
export function getConsent(): ConsentState | null {
  return parseConsent(readRawCookie(COOKIE_NAME));
}

/** True once the visitor has made an explicit choice — never inferred
 * from scrolling, clicking through, or simply not seeing the banner. */
export function hasDecided(): boolean {
  return getConsent() !== null;
}

/** Whether a specific category is currently granted. `false` for any
 * category before a decision exists — never assume consent by default. */
export function hasConsent(category: ConsentCategory): boolean {
  return getConsent()?.[category] ?? false;
}

const consentListeners = new Set<(state: ConsentState | null) => void>();

/** Subscribe to consent changes (grant, withdrawal, or reset). Returns an
 * unsubscribe function. This is the hook point for future analytics
 * integration — see `runWhenConsented` below for the intended shape. */
export function onConsentChange(
  listener: (state: ConsentState | null) => void,
): () => void {
  consentListeners.add(listener);
  return () => consentListeners.delete(listener);
}

function notifyConsentListeners(state: ConsentState | null): void {
  for (const listener of consentListeners) listener(state);
}

/** Records an explicit choice for analytics/marketing (necessary is
 * always granted, it isn't a real choice). Used by both "Accetta tutti"/
 * "Accept all" (`{ analytics: true, marketing: true }`) and "Solo
 * necessari"/"Necessary only" (`{ analytics: false, marketing: false }`)
 * — "Salva le preferenze"/"Save preferences" calls this with whatever the
 * toggles currently show. */
export function setConsent(choice: { analytics: boolean; marketing: boolean }): void {
  const state: ConsentState = {
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    decidedAt: new Date().toISOString(),
  };
  writeRawCookie(COOKIE_NAME, JSON.stringify(state), COOKIE_MAX_AGE_SECONDS);
  notifyConsentListeners(state);
}

/** Withdrawal — as easy to call as `setConsent` is to grant. Deletes the
 * stored choice outright (not "set everything to false") so the banner
 * correctly reappears as genuinely undecided, matching what deleting the
 * cookie by hand already does. */
export function withdrawConsent(): void {
  deleteRawCookie(COOKIE_NAME);
  notifyConsentListeners(null);
}

// --- Manager visibility (separate from the consent VALUE above) ----------
// Whether the banner/manager UI is currently forced open — distinct from
// "has the visitor decided yet," since the footer's "Preferenze cookie"/
// "Cookie preferences" link must reopen it even after a decision exists.
let managerOpen = false;
const managerListeners = new Set<(open: boolean) => void>();

export function isConsentManagerOpen(): boolean {
  return managerOpen;
}

export function onConsentManagerOpenChange(listener: (open: boolean) => void): () => void {
  managerListeners.add(listener);
  return () => managerListeners.delete(listener);
}

function setManagerOpen(open: boolean): void {
  managerOpen = open;
  for (const listener of managerListeners) listener(open);
}

/** Called by the footer's cookie-preferences link. Reopens the banner
 * with the stored choice already reflected in the toggles — the banner
 * component reads `getConsent()` itself when it opens. */
export function openConsentManager(): void {
  setManagerOpen(true);
}

export function closeConsentManager(): void {
  setManagerOpen(false);
}

/**
 * The integration point for future analytics work (GA/GTM/Clarity/Bing/
 * Meta Pixel — none wired yet). Calls `loader` immediately if the
 * category is already granted, and again the moment it's granted later —
 * never before. `loader` is expected to be the thing that actually
 * creates the <script> element / fires the network request; this
 * function is what stands between "consent granted" and that happening,
 * so a future caller should never bypass it and inject a script tag
 * conditionally-but-unconditionally-mounted instead (a script tag that
 * exists in the DOM with its own internal "if consented" check still
 * fires its network request the moment it mounts — the tag itself must
 * not exist until this fires the loader).
 *
 * Returns an unsubscribe function; the caller decides whether cleanup
 * matters for their use case (a script loader typically doesn't need
 * one — once injected, a script tag isn't meaningfully "un-loaded" by
 * removing the element).
 */
export function runWhenConsented(category: ConsentCategory, loader: () => void): () => void {
  if (hasConsent(category)) {
    loader();
    return () => {};
  }
  return onConsentChange((state) => {
    if (state?.[category]) loader();
  });
}
