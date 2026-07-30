// Single shared IntersectionObserver (module-scope, lazily created), used
// by every decorative "animate only while onscreen" component (currently
// AnimatedDivider and ShimmerText) — a page with several such elements
// still costs exactly one observer, not one per instance. Extracted out
// of AnimatedDivider.tsx (where this pattern first lived) specifically so
// ShimmerText can reuse the SAME observer instance rather than each
// component file growing its own private copy of the same code.
let sharedObserver: IntersectionObserver | null = null;
const visibilityCallbacks = new WeakMap<Element, (inView: boolean) => void>();

function getSharedObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
      }
    },
    { threshold: 0.1 },
  );
  return sharedObserver;
}

// Registers el with the shared observer and calls callback(isIntersecting)
// on every enter/exit — a continuous toggle, not a one-shot reveal.
// Returns a cleanup function (unobserve + drop the callback).
export function observeVisibility(el: Element, callback: (inView: boolean) => void): () => void {
  const observer = getSharedObserver();
  visibilityCallbacks.set(el, callback);
  observer.observe(el);
  return () => {
    observer.unobserve(el);
    visibilityCallbacks.delete(el);
  };
}
