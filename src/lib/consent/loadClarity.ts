// Microsoft Clarity — gated the same way as loadGoogleAnalytics.ts, same
// reason: the vendor's own snippet is an IIFE that self-executes the
// instant it's evaluated, with no consent check of its own — pasting it
// into the layout would mean the <script> tag (and the request to
// clarity.ms it makes) exists the moment the page loads, before any
// consent decision. This is a reimplementation of that snippet's exact
// logic (queue stub + async script injection), wrapped in a named
// function that only ever runs via
// runWhenConsented("analytics", loadClarity) in AnalyticsLoader.tsx.
//
// MASKING: Clarity's session recording defaults to "Balanced" mode, which
// does NOT mask page text or form input — on this site that would include
// whatever a visitor types into the contact form, often a description of
// symptoms. There is no snippet-level parameter for this; masking level
// (Balanced / Strict / full text-and-input masking) is a per-project
// setting in the Clarity dashboard, not something this loader — or any
// client-side code — can configure. See this pass's own report: this is
// NOT considered done until the dashboard setting is confirmed separately.
type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

// Direct instruction: no env var — same reasoning as
// loadGoogleAnalytics.ts's own GA_MEASUREMENT_ID constant. One Clarity
// account, one project ID, not a secret.
const CLARITY_PROJECT_ID = "y4ance64zs";

let loaded = false;

/** Only ever called via runWhenConsented("analytics", loadClarity). */
export function loadClarity(): void {
  if (loaded) return;
  loaded = true;

  if (!window.clarity) {
    const fn: ClarityFn = (...args: unknown[]) => {
      (fn.q = fn.q || []).push(args);
    };
    window.clarity = fn;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  const first = document.getElementsByTagName("script")[0];
  if (first?.parentNode) {
    first.parentNode.insertBefore(script, first);
  } else {
    document.head.appendChild(script);
  }

  // This project's own served snippet embeds "track":false — confirmed
  // live by downloading it directly, not assumed — meaning Clarity
  // itself withholds recording (and its persistent _clck/_clsk/CLID
  // cookies) until it separately receives consent, even after the script
  // above has loaded. Tried the vendor-agnostic route first (a Google
  // Consent Mode-shaped dataLayer push, since the snippet's own
  // handleConsentEvent checks an "ad_Storage" field) — that reached
  // gtag.js correctly (confirmed in dataLayer) but never reached Clarity.
  // clarity("consent") is Microsoft's own documented native command for
  // exactly this; queued the same way "stop" is below if the real script
  // hasn't finished loading yet.
  window.clarity("consent");
}

/** Clarity's own documented queue command to pause an in-progress
 * recording — called from AnalyticsLoader.tsx when consent for
 * "analytics" turns false (withdrawal, or switching to necessary-only)
 * AFTER Clarity was already loaded. Without this, an already-loaded
 * Clarity session would keep recording pointer movement/clicks/scroll
 * until the next full reload — the same "script can't be un-loaded"
 * limitation GA has, except GA's per-navigation trackPageView() re-checks
 * consent on every call and Clarity has no equivalent per-event hook to
 * gate, since it records continuously rather than firing discrete events.
 * This is the only way to actually stop it mid-session instead of just
 * preventing a future one from starting. */
export function stopClarity(): void {
  if (loaded) window.clarity?.("stop");
}

export function isClarityLoaded(): boolean {
  return loaded;
}
