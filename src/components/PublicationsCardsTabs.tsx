"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { ChiSonoPublicationsProps, PublicationEntryData } from "@/components/ChiSonoPublications";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./PublicationsVariants.module.scss";

// Chosen variant — cards (from PublicationsCards.tsx) navigated by
// category (from PublicationsTabs.tsx), merged into one permanent
// block. Below lg, tabs become an accordion: same single-active-group
// state drives both, only the presentation differs — two DOM trees
// (.desktopNav / .mobileAccordion), CSS display toggles which is
// visible at which breakpoint, same dual-tree pattern the timeline's
// own pinned/fallback split already uses (never both mounted-and-
// visible at once, so no duplicate-content a11y issue).
//
// Both the desktop panel stack AND the mobile accordion keep every
// group's cards permanently in the DOM (see .tabPanelStack and
// .accordionPanelWrap in PublicationsVariants.module.scss) — the
// accordion because that's FaqAccordion.tsx's own established pattern
// (content stays crawlable regardless of open state), the desktop
// stack because overlapping panels are what let the outgoing and
// incoming cards cross-fade during a switch (each panel's own opacity
// transition).
//
// The stack's own height used to just be however tall CSS Grid's auto
// row-sizing made it (the tallest panel, always — see
// PublicationsVariants.module.scss's own .tabPanelStack comment for the
// bug that caused). It's now explicitly measured and set here instead:
// on every activeGroup change, read the newly-active panel's real
// content height (scrollHeight) and set it as the stack's own height,
// which .tabPanelStack's own `transition: height ...` then animates
// between the old and new value. useLayoutEffect (not useEffect) so the
// FIRST measurement — on mount — happens before paint, with nothing to
// visibly animate from.
function Card({ item }: { item: PublicationEntryData }) {
  return (
    <li className={styles.card}>
      {item.title ? (
        <p className={styles.cardTitle}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.cardTitleLink}>
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </p>
      ) : null}
      {item.authors ? <p className={styles.cardAuthors}>{item.authors}</p> : null}
      {item.source ? <p className={styles.cardSource}>{item.source}</p> : null}
    </li>
  );
}

export function PublicationsCardsTabs({ kicker, title, note, groups, headingId }: ChiSonoPublicationsProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group);
  const baseId = useId();
  const stackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef(new Map<string, HTMLUListElement>());

  useLayoutEffect(() => {
    const stack = stackRef.current;
    const activePanel = activeGroup ? panelRefs.current.get(activeGroup) : null;
    if (!stack || !activePanel) return;
    // getBoundingClientRect().height, not scrollHeight — a real bug,
    // caught live: scrollHeight is always a rounded integer, but this
    // grid's true rendered height is sub-pixel (e.g. 215.39px). Setting
    // the stack's height to the rounded-down integer left a ~0.4px
    // sliver of the last row — most of a 1px card border — outside
    // .tabPanelStack's own overflow: hidden clip, so the bottom border
    // read as faint or missing depending on which tab's height
    // happened to round short. getBoundingClientRect() returns the
    // actual float, so the stack's height always exactly matches.
    stack.style.height = `${activePanel.getBoundingClientRect().height}px`;

    // Re-measure on resize — text reflows at different widths change
    // the active panel's own natural height, and the stack's fixed
    // pixel height needs to track that or it'd clip/leave a gap.
    function handleResize() {
      if (stack && activePanel) {
        stack.style.height = `${activePanel.getBoundingClientRect().height}px`;
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeGroup]);

  return (
    <section aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          {kicker ? (
            <p className={styles.kicker}>
              <SectionKicker>{kicker}</SectionKicker>
            </p>
          ) : null}
          {title ? (
            <h2 id={headingId} className={styles.title}>
              {title}
            </h2>
          ) : null}
        </div>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>

      {/* Desktop (lg+): tab row, all three panels stacked in one grid
          cell (see .tabPanelStack's own comment) — only the active
          one visible/interactive, but all three sized-for. */}
      <div className={`${styles.cardsWrap} ${styles.desktopNav}`}>
        <ul className={styles.tabList} role="tablist">
          {groups.map((group) => {
            const isActive = group.group === activeGroup;
            return (
              <li key={group.group} role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${group.group}`}
                  aria-selected={isActive}
                  aria-controls={`${baseId}-panel-${group.group}`}
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  onClick={() => setActiveGroup(group.group)}
                >
                  <span className={styles.tabLabelStack}>
                    <span className={styles.tabLabelGhost} aria-hidden="true">
                      {group.label}
                    </span>
                    <span>{group.label}</span>
                  </span>
                  <span className={styles.tabCount}>{group.items.length}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div ref={stackRef} className={styles.tabPanelStack}>
          {groups.map((group) => {
            const isActive = group.group === activeGroup;
            return (
              <ul
                key={group.group}
                ref={(el) => {
                  if (el) panelRefs.current.set(group.group, el);
                  else panelRefs.current.delete(group.group);
                }}
                id={`${baseId}-panel-${group.group}`}
                role="tabpanel"
                aria-labelledby={`${baseId}-tab-${group.group}`}
                inert={!isActive}
                className={`${styles.cardsGrid} ${styles.tabCardPanel} ${isActive ? styles.tabCardPanelActive : ""}`}
              >
                {group.items.map((item, index) => (
                  <Card key={index} item={item} />
                ))}
              </ul>
            );
          })}
        </div>
      </div>

      {/* Below lg: accordion, FaqAccordion.tsx's own exact pattern —
          every panel always mounted, visually collapsed via
          grid-template-rows, exactly one open at a time (clicking the
          open row is a no-op, not a close-to-zero). */}
      <div className={`${styles.cardsWrap} ${styles.mobileAccordion}`}>
        {groups.map((group) => {
          const isOpen = group.group === activeGroup;
          const headerId = `${baseId}-header-${group.group}`;
          const panelId = `${baseId}-accpanel-${group.group}`;

          return (
            <div key={group.group} className={styles.accordionSection}>
              <h3 className={styles.accordionHeading}>
                <button
                  type="button"
                  id={headerId}
                  className={styles.accordionHeader}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setActiveGroup(group.group)}
                >
                  <span className={styles.accordionHeaderLeft}>
                    {group.label}
                    <span className={styles.tabCount}>{group.items.length}</span>
                  </span>
                  <span className={styles.accordionIcon} aria-hidden="true">
                    <span className={styles.accordionIconBarH} />
                    <span className={styles.accordionIconBarV} />
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className={styles.accordionPanelWrap}
                data-open={isOpen}
              >
                <div className={styles.accordionPanelInner}>
                  <ul className={`${styles.cardsGrid} ${styles.accordionPanel}`}>
                    {group.items.map((item, index) => (
                      <Card key={index} item={item} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
