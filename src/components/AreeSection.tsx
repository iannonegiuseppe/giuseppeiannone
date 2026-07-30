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
import { areaPath, type Locale } from "@/sanity/paths";
import styles from "./AreeSection.module.scss";

export type AreaRow = {
  _id: string;
  title: string;
  descriptor: string;
  slug?: string;
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
// component still: no data resolution beyond title/descriptor/slug
// already projected by areasQuery, so no client-side interactivity is
// needed beyond CSS-only :hover/:focus-visible (no JS state at all) plus
// the existing RevealOnScroll reveal (see that file's own comment for the
// stagger mechanism reused here, not reinvented).
//
// Conditional interactivity, now two states per card (was three):
// - slug set -> real <a> (matches ChiSonoSection.tsx's own storyLink
//   pattern: plain <a>, not next/link, for a route that doesn't exist
//   yet; see areaPath's own comment in sanity/paths.ts). Full link
//   behavior: cursor, focus ring on the whole card, restrained hover.
// - no slug -> a fully plain, non-interactive card. The previous
//   "previewHover" demo state (faking a link's hover reaction on a
//   non-interactive row) is REMOVED, not carried over — it directly
//   contradicts this pass's own explicit requirement that non-interactive
//   cards must never imply clickability. The `areeSection.previewHover`
//   Sanity field itself still exists (out of scope to remove a schema
//   field in a component pass) but is no longer read here — see this
//   pass's own report and docs/pre-launch.md's updated entry.
export function AreeSection({
  kicker,
  title,
  intro,
  areas,
  locale,
}: {
  kicker: string;
  title: string;
  intro?: string;
  areas?: AreaRow[];
  locale: Locale;
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
          const isLink = Boolean(area.slug);
          const Icon = ICONS[index % ICONS.length]!;
          const number = String(index + 1).padStart(2, "0");

          const cardContent = (
            <>
              <span className={styles.areeCardTop}>
                <span className={styles.areeCardIcon}>
                  <Icon />
                </span>
                {/* Decorative position marker, not a heading — the card's
                    real accessible name is its title below (and, for
                    linked cards, the <a>'s own aria-label). */}
                <span className={styles.areeCardNumber} aria-hidden="true">
                  {number}
                </span>
              </span>
              <span className={styles.areeCardTitle}>{area.title}</span>
              <span className={styles.areeCardDescriptor}>{area.descriptor}</span>
            </>
          );

          return (
            <li key={area._id} className={styles.areeGridItem} role="listitem">
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
                {isLink ? (
                  <a
                    href={areaPath(locale, area.slug!)}
                    aria-label={area.title}
                    className={`${styles.areeCard} ${styles.areeCardLink}`}
                  >
                    {cardContent}
                  </a>
                ) : (
                  <div className={styles.areeCard}>{cardContent}</div>
                )}
              </RevealOnScroll>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
