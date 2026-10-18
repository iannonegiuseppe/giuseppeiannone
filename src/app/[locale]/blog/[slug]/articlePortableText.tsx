import Image from "next/image";
import type { PortableTextComponents } from "next-sanity";
import { FaqAccordion, type FaqAccordionPair } from "@/components/FaqAccordion";
import { imageDimensions, urlFor } from "@/sanity/image";
import styles from "./article.module.scss";

// Reading-frame pass — a components map scoped to this one route only,
// deliberately separate from src/sanity/portableTextComponents.tsx (the
// pillar/subtopic pages' shared renderer): that file's CSS
// (portableTextComponents.module.scss) is shared by other real routes,
// and this pass's brief is explicit about not touching any route besides
// this one. h2/h3/blockquote/links/images get the reading-frame's own
// typography here; strong/em/paragraphs/lists use next-sanity's own
// default HTML output (<strong>/<em>/<p>/<ul>/<ol>/<li>), styled via plain
// element selectors scoped under .body in article.module.scss — no custom
// component needed for those, they're not the parts this pass changes.
//
// keyTakeaways/relatedTopics/ctaBlock/conditionCard/treatmentCard still
// have NO component registered here — a dataset query confirmed none of
// the 468 imported articles used any of them, so the gap was theoretical.
// faqBlock is the one that stopped being theoretical, and the outcome was
// not "unstyled" as assumed: next-sanity's PortableText renders NOTHING
// at all for a type with no component, so the content simply disappeared
// from the page. It has one now (below). Treat the remaining five as a
// live trap rather than an accepted limitation: the moment an editor
// inserts one, its content is gone with no error anywhere.
// headingIds: block._key -> slug id, from src/sanity/headings.ts's own
// extractHeadings/headingIdsByKey (the same shared utility pillarPage's
// TOC uses) — so the TOC pass's jump-links can never point at an id that
// doesn't exist on the rendered heading.
export function getArticlePortableTextComponents(
  headingIds?: Map<string, string>,
): PortableTextComponents {
  return {
    block: {
      h2: ({ children, value }) => (
        <h2 id={value._key ? headingIds?.get(value._key) : undefined} className={styles.h2}>
          {children}
        </h2>
      ),
      h3: ({ children, value }) => (
        <h3 id={value._key ? headingIds?.get(value._key) : undefined} className={styles.h3}>
          {children}
        </h3>
      ),
      normal: ({ children }) => <p className={styles.paragraph}>{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className={styles.blockquote}>{children}</blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className={styles.list}>{children}</ul>,
      number: ({ children }) => <ol className={styles.list}>{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className={styles.listItem}>{children}</li>,
      number: ({ children }) => <li className={styles.listItem}>{children}</li>,
    },
    marks: {
      strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
      em: ({ children }) => <em className={styles.em}>{children}</em>,
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
            className={styles.link}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      // Alt text (including the title-fallback ones flagged generatedAlt)
      // goes through <Image>'s own alt prop only — never rendered as a
      // visible caption underneath, per this pass's own instruction.
      image: ({ value }) => {
        const dims = imageDimensions(value) ?? { width: 4, height: 3 };
        // Never request wider than the source itself — the column is
        // 660px, but a narrower source (220x220 is the narrowest measured
        // in-body image in the imported set) must not be upscaled past its
        // own natural width. Sanity's image API will upscale on request,
        // which is exactly the blur this pass's own brief rules out.
        const requestWidth = Math.min(dims.width, 1320);
        return (
          <Image
            src={urlFor(value).width(requestWidth).url()}
            alt={value.alt ?? ""}
            width={dims.width}
            height={dims.height}
            sizes="(min-width: 64rem) 41.25rem, 100vw"
            className={styles.image}
          />
        );
      },
      // The gap the comment at the top of this file called "real only in
      // theory" stopped being theoretical: three hand-published posts had
      // their typed-out FAQ moved into a real faqBlock, and PortableText
      // renders NOTHING for a type with no component — which silently took
      // the answers off the live pages. Caught by checking the rendered
      // HTML after the content change, not by any test.
      //
      // Renders through FaqAccordion — the same component /faq, FaqSection
      // and PillarFaq already use — rather than a hand-rolled <details>:
      // one panel open at a time, CSS-animated open/close, and closed
      // panels collapsed rather than unmounted, so every answer stays in
      // the rendered HTML for crawlers and answer engines. items[] arrives
      // already dereferenced by bodyProjection in queries.ts.
      faqBlock: ({ value }) => {
        const items =
          (value as { items?: { _id: string; question: string; answer: unknown }[] }).items ?? [];
        if (items.length === 0) return null;

        const pairs: FaqAccordionPair[] = items.map((item) => ({
          question: item.question,
          answer: item.answer,
        }));

        return <FaqAccordion pairs={pairs} />;
      },
    },
  };
}
