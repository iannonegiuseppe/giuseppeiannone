import type { LibriChapter, ResolvedCoverImage } from "@/app/[locale]/libri/page";
import { BookCover } from "@/components/BookCover";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import styles from "./LibriIndexSection.module.scss";

// Splices ShimmerText around the first occurrence of emphasisWord in the
// heading — same substring-splice technique every other emphasis-word
// render in this codebase already uses (see pricePage/page.tsx's own
// renderBlockBody for the identical pattern).
function renderHeading(title: string, emphasisWord: string | undefined) {
  const index = emphasisWord ? title.indexOf(emphasisWord) : -1;
  if (!emphasisWord || index === -1) return title;
  return (
    <>
      {title.slice(0, index)}
      <ShimmerText>{emphasisWord}</ShimmerText>
      {title.slice(index + emphasisWord.length)}
    </>
  );
}

export function LibriIndexSection({
  kicker,
  title,
  titleEmphasisWord,
  lead,
  chapters,
  coverTitle,
  coverKicker,
  byline,
  metaLine,
  coverImage,
}: {
  kicker: string;
  title: string;
  titleEmphasisWord?: string;
  lead: string;
  chapters: LibriChapter[];
  coverTitle: string;
  coverKicker: string;
  byline: string;
  metaLine: string;
  coverImage: ResolvedCoverImage | null;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <RevealOnScroll className={styles.intro}>
          <p className={styles.kicker}>
            <SectionKicker>{kicker}</SectionKicker>
          </p>
          <h1 className={styles.heading}>{renderHeading(title, titleEmphasisWord)}</h1>
          <p className={styles.lead}>{lead}</p>
        </RevealOnScroll>

        <div className={styles.grid}>
          <RevealOnScroll className={styles.chapterListWrap}>
            <ol className={styles.chapterList}>
              {chapters.map((chapter, index) => (
                <li key={chapter.title} className={styles.chapterRow}>
                  <span className={styles.chapterNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                    <p className={styles.chapterDescription}>{chapter.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </RevealOnScroll>

          <RevealOnScroll className={styles.coverSidebar}>
            <BookCover
              title={coverTitle}
              label={coverKicker}
              byline={byline}
              tone="guide"
              imageUrl={coverImage?.url}
              imageAlt={coverImage?.alt}
              imageWidth={coverImage?.width}
              imageHeight={coverImage?.height}
            />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
