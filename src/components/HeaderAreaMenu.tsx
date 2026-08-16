"use client";

import Link from "next/link";
import type { AreaGroup } from "@/sanity/areaTaxonomy";
import { useNavDropdownDisclosure } from "./useNavDropdownDisclosure";
import styles from "./HeaderInteractive.module.scss";

// Header nav restructure pass — "Aree"'s own panel: 7 pillars x 3-6
// subtopics (28 leaf links), grouped and columned. The flat single-list
// HeaderNavItemWithSubmenu.tsx can't express this (one <ul>, no group
// concept) — this is a SEPARATE component, not an extension of that one,
// because the only thing they'd share is the open/close mechanics (now
// factored into useNavDropdownDisclosure) and nothing about what's
// rendered inside. See useNavDropdownDisclosure.ts's own comment.
//
// Accessibility — "a panel that announces as an undifferentiated list of
// 28 is a failure even if it looks right": each pillar heading is a real
// <h3> (wrapping the link to that pillar's own page), not a styled <span>
// or an extra ARIA role. Screen readers navigate by heading (NVDA/JAWS/
// VoiceOver's own "next heading" command) independently of list structure,
// so a screen reader user gets "7 headings, each with its own list of
// links beneath it" — the same structure a sighted user sees — rather than
// one 28-item list with no internal landmarks. The panel itself carries
// aria-label (from the trigger's own label, "Aree"/"Aree") so it has an
// accessible name of its own the moment it opens, independent of the
// button's aria-controls relationship.
//
const COLUMN_COUNT = 3;

// Overflow-bug fix — this used to be CSS multi-column (column-count: 3,
// browser-balanced) specifically so an 8th pillar could rebalance itself
// with no code change. That balancing is exactly what broke: measured live
// (real DOM, real rects), the columns' own max-height (a fixed budget
// multi-column needs to know when to stop stacking one column and start
// the next) was tuned against an EARLIER, tighter version of this panel's
// padding — a later, unrelated pass (submenu spacing unification) made
// every group taller, and the same max-height could no longer balance all
// seven groups into three columns without breaking one — so the browser
// added a fourth column instead of violating break-inside: avoid-column,
// and that fourth column rendered outside the panel's own fixed 46rem
// width (nothing was clipping it: both the panel and the columns box had
// overflow: visible). Confirmed via getBoundingClientRect on every group:
// four distinct left-edge x-positions where three were expected, the
// fourth one past the panel's own right edge.
//
// The fix trades the "rebalances itself for free" property (which just
// caused this exact bug) for a deterministic one: groups are assigned to
// exactly COLUMN_COUNT columns here, in code, using each group's own
// subtopic count as a height proxy — no browser heuristic, no max-height
// budget to retune every time padding changes elsewhere, and by
// construction it can never produce a fourth column. Order is preserved
// (column 1's groups all precede column 2's, which all precede column
// 3's) so DOM/reading order still matches left-to-right visual order,
// same requirement the original comment already established. Uneven
// column heights are expected and fine (per spec) — a group is never
// split.
function splitIntoColumns(groups: AreaGroup[], columnCount: number): AreaGroup[][] {
  const weight = (group: AreaGroup) => 1 + group.subtopics.length; // 1 for the heading row, 1 per subtopic row
  const total = groups.reduce((sum, group) => sum + weight(group), 0);
  const target = total / columnCount;

  const columns: AreaGroup[][] = [];
  let current: AreaGroup[] = [];
  let currentWeight = 0;

  for (const group of groups) {
    const isLastColumn = columns.length === columnCount - 1;
    if (!isLastColumn && current.length > 0 && currentWeight + weight(group) > target) {
      columns.push(current);
      current = [];
      currentWeight = 0;
    }
    current.push(group);
    currentWeight += weight(group);
  }
  columns.push(current);
  while (columns.length < columnCount) columns.push([]);
  return columns;
}

export function HeaderAreaMenu({
  label,
  groups,
  isOpen,
  onOpenChange,
}: {
  label: string;
  groups: AreaGroup[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    rootRef,
    buttonRef,
    panelId,
    clearCloseTimer,
    handleMouseEnter,
    handleMouseLeave,
    handleButtonClick,
    handleKeyDown,
    handleFocusOut,
  } = useNavDropdownDisclosure(isOpen, onOpenChange);

  return (
    <div
      ref={rootRef}
      className={styles.headerAreaMenuWrap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={clearCloseTimer}
      onBlurCapture={handleFocusOut}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.headerNavButton}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleButtonClick}
      >
        {label}
        <span className={styles.headerNavChevron} data-open={isOpen ? "true" : undefined} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        className={styles.headerAreaPanel}
        data-open={isOpen ? "true" : undefined}
        aria-label={label}
      >
        <div className={styles.headerAreaColumns}>
          {splitIntoColumns(groups, COLUMN_COUNT).map((column, columnIndex) => (
            <div key={columnIndex} className={styles.headerAreaColumn}>
              {column.map((group) => (
                <div key={group.href} className={styles.headerAreaGroup}>
                  <h3 className={styles.headerAreaGroupHeading}>
                    <Link href={group.href} className={styles.headerAreaGroupLink}>
                      {group.title}
                    </Link>
                  </h3>
                  {group.subtopics.length > 0 ? (
                    <ul className={styles.headerAreaSubtopicList}>
                      {group.subtopics.map((subtopic) => (
                        <li key={subtopic.href}>
                          <Link
                            href={subtopic.href}
                            className={`${styles.headerSubmenuLink} ${styles.headerAreaSubtopicWeight}`}
                          >
                            {subtopic.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
