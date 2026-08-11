import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import { imageDimensions, urlFor } from "@/sanity/image";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./ChiSonoBodyBlocks.module.scss";

export interface ChiSonoBodyBlockData {
  kicker?: string;
  heading?: string;
  headingEmphasisWord?: string;
  body?: string[];
  quote?: string;
  image?: (SanityImage & { alt?: string }) | undefined;
}

// Substring-match emphasis, same technique as PillarHero.tsx's own
// renderEmphasis — duplicated per this codebase's established convention.
function renderEmphasis(text: string | undefined, emphasisWord: string | undefined) {
  if (!text) return null;
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={styles.headingEmphasis}>{emphasisWord}</em>
      {after}
    </>
  );
}

// Chi sono full rebuild — block 7, the two alternating image/text blocks.
// Replaces the standalone pull-quote section entirely (see
// chiSonoSection.ts's own bodyBlocks field comment). Both blocks share
// this one component; the second mirrors the first via the `mirror` prop
// (CSS `order` swap, see .block below) rather than a second markup path.
export function ChiSonoBodyBlocks({ blocks }: { blocks: ChiSonoBodyBlockData[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className={styles.wrap}>
      {blocks.map((block, index) => {
        const dims = block.image ? imageDimensions(block.image) : null;
        const requestWidth = dims ? Math.min(dims.width, 1400) : undefined;
        const mirror = index % 2 === 1;

        return (
          <div key={index} className={`${styles.block} ${mirror ? styles.blockMirror : ""}`}>
            <div className={styles.imageCol}>
              {block.image && dims && requestWidth ? (
                <Image
                  src={urlFor(block.image).width(requestWidth).url()}
                  alt={block.image.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={styles.image}
                />
              ) : null}
              {block.quote ? (
                <>
                  <span className={styles.imageScrim} aria-hidden="true" />
                  <p className={styles.imageQuote}>{block.quote}</p>
                </>
              ) : null}
            </div>
            <div className={styles.textCol}>
              {block.kicker ? (
                <p className={styles.kicker}>
                  <SectionKicker>{block.kicker}</SectionKicker>
                </p>
              ) : null}
              {block.heading ? (
                <h2 className={styles.heading}>{renderEmphasis(block.heading, block.headingEmphasisWord)}</h2>
              ) : null}
              {(block.body ?? []).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className={styles.body}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
