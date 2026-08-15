import type { ResolvedCoverImage } from "@/app/[locale]/libri/page";
import { BookCover } from "@/components/BookCover";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./LibriBookPromo.module.scss";

interface LibriBookCopy {
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  amazonUrl?: string;
}

// CTA link only renders when amazonUrl exists — same "don't render a
// link to nowhere" pattern siteSettings.googleProfileUrl already uses
// elsewhere (ContactBlock.tsx). Real placeholder content in the fields
// themselves ([Titolo del libro], etc.) stays visible either way — this
// pass isn't responsible for the placeholders resolving, only for not
// shipping a dead link.
//
// Real-cover pass — mirrored: cover now renders FIRST (left), text
// SECOND (right). DOM order swapped to match, not just a CSS `order`
// flip, so visual and reading order stay in sync (a screen reader user
// and a sighted user now encounter the cover before the text either
// way, matching the new layout — flipping only the CSS would have left
// them out of sync).
export function LibriBookPromo({
  copy,
  byline,
  coverImage,
}: {
  copy: LibriBookCopy;
  byline: string;
  coverImage: ResolvedCoverImage | null;
}) {
  return (
    <RevealOnScroll className={styles.wrap}>
      <BookCover
        className={styles.cover}
        title={copy.title}
        label={copy.kicker}
        byline={byline}
        tone="book"
        imageUrl={coverImage?.url}
        imageAlt={coverImage?.alt}
        imageWidth={coverImage?.width}
        imageHeight={coverImage?.height}
      />
      <div>
        <p className={styles.kicker}>
          <SectionKicker>{copy.kicker}</SectionKicker>
        </p>
        <h2 className={styles.heading}>{copy.title}</h2>
        <p className={styles.subtitle}>{copy.subtitle}</p>
        {/* copy.body is a plain Sanity string, not portable text — it
            can't hold paragraph structure on its own. Studio editors
            separate paragraphs with a blank line (see the schema
            field's own title); splitting on that here is what turns it
            into real <p> elements instead of one run-on block with the
            newlines silently collapsed by normal HTML whitespace
            handling. */}
        {copy.body
          .split(/\n{2,}/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((paragraph, i) => (
            <p key={i} className={styles.body}>
              {paragraph}
            </p>
          ))}
        {copy.amazonUrl ? (
          <div className={styles.ctaRow}>
            <a
              href={copy.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              {copy.ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </RevealOnScroll>
  );
}
