import type { PortableTextComponents } from "next-sanity";
import styles from "./blogIndex.module.scss";

export interface EditorialBlock {
  _type: string;
  _key: string;
  style?: string;
  [key: string]: unknown;
}

// Item 2 (round 4) — splits the flat editorial block array into two
// reading-order columns for the two-column layout, WITHOUT ever
// separating an h2 from its own paragraphs. Groups are formed by cutting
// at every h2 (each group = one heading + every block after it up to the
// next heading); groups themselves are never split — only whole groups
// move to column one or column two. That's what actually prevents an
// orphaned heading at the column break: there is no possible break point
// between a heading and its own content, only between one heading's
// group and the next. Reading order is DOWN column one, then down column
// two (not across) — with exactly 4 heading groups this puts headings
// 1-2 in column one, 3-4 in column two.
export function splitEditorialIntoColumns(blocks: EditorialBlock[]): {
  columnOne: EditorialBlock[];
  columnTwo: EditorialBlock[];
} {
  const groups: EditorialBlock[][] = [];
  for (const block of blocks) {
    if (block._type === "block" && block.style === "h2") {
      groups.push([block]);
    } else if (groups.length > 0) {
      groups[groups.length - 1]!.push(block);
    } else {
      // Content before the first heading (shouldn't happen given this
      // block's own copy always opens on an h2, but doesn't assume it).
      groups.push([block]);
    }
  }
  const splitIndex = Math.ceil(groups.length / 2);
  return {
    columnOne: groups.slice(0, splitIndex).flat(),
    columnTwo: groups.slice(splitIndex).flat(),
  };
}

// Blog index redesign pass — renders blogIndexSection.editorial, the
// narrow restricted array defined in blogIndexSection.ts's own schema
// (paragraphs/one heading level (h2)/lists/bold/italic/links only, no
// images, no custom content blocks — see that file's own comment for why).
export const blogEditorialPortableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.editorialParagraph}>{children}</p>,
    h2: ({ children }) => <h2 className={styles.editorialH2}>{children}</h2>,
  },
  list: {
    bullet: ({ children }) => <ul className={styles.editorialList}>{children}</ul>,
    number: ({ children }) => <ol className={styles.editorialList}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.editorialListItem}>{children}</li>,
    number: ({ children }) => <li className={styles.editorialListItem}>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className={styles.editorialStrong}>{children}</strong>,
    em: ({ children }) => <em className={styles.editorialEm}>{children}</em>,
    link: ({ value, children }) => {
      const href = (value?.href as string | undefined) ?? "#";
      const isExternal = /^https?:\/\//.test(href);
      const rel = isExternal
        ? ["noopener", value?.nofollow ? "nofollow" : null].filter(Boolean).join(" ")
        : undefined;
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={rel}
          className={styles.editorialLink}
        >
          {children}
        </a>
      );
    },
  },
};
