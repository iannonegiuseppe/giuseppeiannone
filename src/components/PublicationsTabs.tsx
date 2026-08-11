"use client";

import { useState } from "react";
import type { ChiSonoPublicationsProps } from "@/components/ChiSonoPublications";
import styles from "./PublicationsVariants.module.scss";

// C — interactive category switch, one group visible at a time. See
// PublicationsVariants.module.scss's own top comment. Client component
// (useState for the active tab) — the only one of the four that needs
// to be; the others are plain server-rendered markup.
export function PublicationsTabs({ kicker, title, note, groups, headingId }: ChiSonoPublicationsProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group);
  const active = groups.find((group) => group.group === activeGroup) ?? groups[0];

  return (
    <section aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
          {title ? (
            <h2 id={headingId} className={styles.title}>
              {title}
            </h2>
          ) : null}
        </div>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>

      <div className={styles.tabsWrap}>
        <ul className={styles.tabList} role="tablist">
          {groups.map((group) => (
            <li key={group.group} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={group.group === active?.group}
                className={`${styles.tab} ${group.group === active?.group ? styles.tabActive : ""}`}
                onClick={() => setActiveGroup(group.group)}
              >
                {group.label}
                <span className={styles.tabCount}>{group.items.length}</span>
              </button>
            </li>
          ))}
        </ul>

        <ul className={styles.tabPanel} role="tabpanel">
          {(active?.items ?? []).map((item, index) => (
            <li key={index} className={styles.tabItem}>
              {item.authors ? <p className={styles.tabAuthors}>{item.authors}</p> : null}
              {item.title ? (
                <p className={styles.tabTitle}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.tabTitleLink}>
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
              ) : null}
              {item.source ? <p className={styles.tabSource}>{item.source}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
