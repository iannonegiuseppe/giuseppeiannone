import type { CSSProperties } from "react";
import {
  AnsiaIcon,
  DepressioneIcon,
  PanicoIcon,
  RelazionaliIcon,
  SessualiIcon,
  StressIcon,
} from "./icons/aree";
import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./AreeSection.module.scss";

// Area-fold pass — `_key` (Sanity array-item key), not `_id`: these rows
// now live inside homePage.aree.items, an array field, not their own
// `area` documents (see that type's own schema comment). `slug` dropped
// entirely — see this pass's own report for why (empty on all 12 source
// documents, backed by no route, and a future individual-area page will
// almost certainly be a pillarPage reference, an architecturally
// different mechanism this field never fed anyway).
export type AreaRow = {
  _key: string;
  title: string;
  descriptor: string;
};

// Card-grid rebuild pass: fixed icon per grid POSITION (order 1-6), not
// editor-driven — a structural/visual choice, same reasoning as the
// item-number badge below (both derived from array position, neither is
// content). If Sanity's own area order ever changes, the icon set moves
// with it positionally rather than by area identity — acceptable since
// today's six areas and their order are stable, established facts (see
// this pass's own report).
const ICONS = [AnsiaIcon, PanicoIcon, DepressioneIcon, SessualiIcon, StressIcon, RelazionaliIcon];

// Card-grid rebuild pass: supersedes the previous typographic-list
// version entirely (hairline-divider rows -> six equal cards). Server
// component still: no data resolution beyond title/descriptor already
// projected by homePage's own fetch, so no client-side interactivity is
// needed beyond CSS-only :hover/:focus-visible (no JS state at all) plus
// the existing RevealOnScroll reveal (see that file's own comment for the
// stagger mechanism reused here, not reinvented).
//
// Area-fold pass — every card is now always the plain, non-interactive
// shape. The conditional link branch (slug set -> real <a>) is REMOVED,
// not kept dormant for later: `slug` no longer exists on this data at
// all (dropped from the schema — see AreaRow's own comment), and a
// future individual-area page will almost certainly be a pillarPage
// reference, an architecturally different mechanism from the bare
// areaPath()/slug string this branch used — reviving THIS branch
// wouldn't have saved that future work, so there's nothing to keep it
// ready for. The previous "previewHover" demo state (faking a link's
// hover reaction on a non-interactive row) was already removed in an
// earlier pass, for the same reason: non-interactive cards must never
// imply clickability.
export function AreeSection({
  kicker,
  title,
  intro,
  areas,
}: {
  kicker: string;
  title: string;
  intro?: string;
  areas?: AreaRow[];
}) {
  return (
    <section
      className={styles.areeSection}
      data-lab-section="aree"
      aria-labelledby="aree-heading"
    >
      <div className={styles.areeHeader}>
        <p className={styles.areeKicker}>
          <span className={styles.areeKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 id="aree-heading" className={styles.areeTitle}>
          {title}
        </h2>
        {intro ? <p className={styles.areeIntro}>{intro}</p> : null}
      </div>

      <ul className={styles.areeGrid} role="list">
        {areas?.map((area, index) => {
          const Icon = ICONS[index % ICONS.length]!;
          const number = String(index + 1).padStart(2, "0");

          return (
            <li key={area._key} className={styles.areeGridItem} role="listitem">
              {/* Deterministic stagger — array index, not Math.random()/
                  Date.now() (SSG hydration) — same --*-delay-index pattern
                  AnimatedDivider already uses for its own sweep stagger,
                  just consumed as a positive transition-delay here instead
                  of a negative animation-delay (see AreeSection.module.scss's
                  own .areeCardReveal comment). */}
              <RevealOnScroll
                className={styles.areeCardReveal}
                style={{ "--card-delay-index": index } as CSSProperties}
              >
                <div className={styles.areeCard}>
                  <span className={styles.areeCardTop}>
                    <span className={styles.areeCardIcon}>
                      <Icon />
                    </span>
                    {/* Decorative position marker, not a heading — the
                        card's real accessible name is its title below. */}
                    <span className={styles.areeCardNumber} aria-hidden="true">
                      {number}
                    </span>
                  </span>
                  <span className={styles.areeCardTitle}>{area.title}</span>
                  <span className={styles.areeCardDescriptor}>{area.descriptor}</span>
                </div>
              </RevealOnScroll>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
