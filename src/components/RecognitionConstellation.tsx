"use client";

import { useEffect, useRef, useState } from "react";
import { observeVisibility } from "./sharedViewportObserver";
import styles from "./RecognitionConstellation.module.scss";

export interface RecognitionRenderItem {
  key: string;
  quote: string;
  emphasisWord?: string;
  revealIndex: number;
}

// Substring-match technique, same as PillarHero.tsx's own renderEmphasis
// / RecognitionSection.tsx's own renderEmphasis — duplicated per this
// codebase's established convention for small single-purpose helpers
// rather than shared. The word itself is picked upstream (PillarRecognition.
// tsx's selectEmphasisWord, automatic, not authored — see that file's own
// comment); this only renders it. No separate animation: the returned
// <em> is a plain inline descendant of .quote, so it fades/drifts in
// together with the rest of the sentence under the SAME .pending/.revealed
// transition below — coloring it gold doesn't add a second animation, and
// reduced motion suppresses it for exactly the same reason the rest of
// the quote is suppressed (nothing item-specific to gate separately).
function renderQuoteWithEmphasis(quote: string, emphasisWord: string | undefined) {
  if (!emphasisWord) return quote;
  const index = quote.indexOf(emphasisWord);
  if (index === -1) return quote;
  const before = quote.slice(0, index);
  const after = quote.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={styles.emphasis}>{emphasisWord}</em>
      {after}
    </>
  );
}

// Rebuild — forks RecognitionSection.tsx's (homepage "Ti riconosci?")
// asymmetric six-slot composition rather than reusing it directly. That
// component is welded to its own data shape: a `tier` field
// (anchor/dominant/peripheral, schema-capped at exactly one anchor) that
// this schema doesn't have, and a label caption rendered above every
// non-anchor fragment — which would silently reintroduce the exact
// per-quote clutter the previous pass explicitly removed. What DOES
// carry over unchanged: the six fixed grid slots and their
// grid-column/grid-row/margin-top stagger values (RecognitionConstellation.
// module.scss's own comments cite the source), and the large/medium/small
// three-tier size hierarchy those slots were built for. Position in the
// (already-approved, stored-order-verified) six-item array drives both
// tier and slot directly — no CMS tier field to maintain.
const MAX_QUOTES = 6;
const SIZE_CLASS = ["large", "medium", "medium", "small", "small", "small"] as const;

function RecognitionItem({ item, slotIndex }: { item: RecognitionRenderItem; slotIndex: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"initial" | "pending" | "revealed">("initial");

  // Reveal mechanism UNCHANGED from the two-tier grid this replaces — same
  // per-item observeVisibility registration, same one-shot contract, same
  // opacity+drift-only transition (no blur — see the original build
  // report's throttled-CPU jank test). Only the markup/layout it's
  // attached to changed.
  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setState("pending");
    const unregister = observeVisibility(ref.current, (inView) => {
      if (!inView) return;
      setState("revealed");
      unregister();
    });

    return unregister;
  }, []);

  const className = [
    styles.item,
    styles[SIZE_CLASS[slotIndex] ?? "small"],
    styles[`slot${slotIndex}`],
    state === "pending" ? styles.pending : "",
    state === "revealed" ? styles.revealed : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = { "--reveal-index": item.revealIndex } as React.CSSProperties;

  return (
    <div ref={ref} className={className} style={style}>
      <p className={styles.quote}>{renderQuoteWithEmphasis(item.quote, item.emphasisWord)}</p>
    </div>
  );
}

// Cap enforced HERE, not in the CMS — Giuseppe can freely reorder all
// thirteen stored items without worrying about which six happen to
// render; this always takes the first six in whatever order they're
// currently stored in (the pillar page's own fetch already delivers them
// in stored order, no client-side sort).
export function RecognitionConstellation({ items }: { items: RecognitionRenderItem[] }) {
  const capped = items.slice(0, MAX_QUOTES);

  return (
    <div className={styles.constellation}>
      {capped.map((item, index) => (
        <RecognitionItem key={item.key} item={item} slotIndex={index} />
      ))}
    </div>
  );
}
