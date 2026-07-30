// Single shared IntersectionObserver PER THRESHOLD (module-scope, lazily
// created) — used by every decorative "animate only while onscreen"
// component (AnimatedDivider, ShimmerText — both the default 0.1) plus
// one-shot reveals (RevealOnScroll, ChiSonoBlock). A page with several
// elements at the SAME threshold still costs exactly one observer for
// that threshold, not one per instance. Extracted out of
// AnimatedDivider.tsx (where this pattern first lived) specifically so
// every later consumer reuses an existing observer instead of each
// component file growing its own private copy of the same code.
//
// Extended this pass (Chi sono reveal-parity fix): was a single module-
// scope observer hardcoded to threshold 0.1. Chi sono's own reveal needed
// to match Welcome's private observer's threshold (0.3) exactly, per
// that pass's own explicit "align every parameter, including threshold"
// instruction — a bare single-threshold singleton couldn't serve both
// needs at once (IntersectionObserver's threshold is fixed at
// construction). Keyed by threshold instead: every existing caller (none
// of which pass a threshold) still shares the SAME 0.1 instance,
// unchanged; a caller that legitimately needs a different threshold gets
// its own shared (not private) instance, reusable by any FUTURE consumer
// at that same threshold too — the same "extend the shared mechanism
// when a genuine new need appears" call already made repeatedly
// elsewhere in this codebase (e.g. light-island-surface's own token
// extensions).
const sharedObservers = new Map<number, IntersectionObserver>();
const visibilityCallbacks = new WeakMap<Element, (inView: boolean) => void>();

function getSharedObserver(threshold: number): IntersectionObserver {
  let observer = sharedObservers.get(threshold);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
        }
      },
      { threshold },
    );
    sharedObservers.set(threshold, observer);
  }
  return observer;
}

// Registers el with the shared observer for this threshold and calls
// callback(isIntersecting) on every enter/exit — a continuous toggle,
// not a one-shot reveal (callers wanting one-shot behaviour unregister
// themselves from inside their own callback, see RevealOnScroll.tsx/
// ChiSonoBlock.tsx). Returns a cleanup function (unobserve + drop the
// callback). threshold defaults to 0.1, unchanged from before this pass,
// so every existing caller is unaffected.
export function observeVisibility(
  el: Element,
  callback: (inView: boolean) => void,
  threshold = 0.1,
): () => void {
  const observer = getSharedObserver(threshold);
  visibilityCallbacks.set(el, callback);
  observer.observe(el);
  return () => {
    observer.unobserve(el);
    visibilityCallbacks.delete(el);
  };
}
