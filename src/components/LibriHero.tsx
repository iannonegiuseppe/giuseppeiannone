import { ShimmerText } from "@/components/ShimmerText";
import { LibriHeroVisual } from "@/components/LibriHeroVisual";
import { SectionKicker } from "@/components/ui/SectionKicker";
import type { Locale } from "@/sanity/paths";
import styles from "./LibriHero.module.scss";

// Fixed, decorative copy — not CMS content (the words are aria-hidden
// flourish over the hero photograph, not part of the page's real
// information; the actual chapter list is real DOM text further down).
const HERO_WORDS: Record<Locale, string[]> = {
  it: ["Il corpo", "L'attesa", "Il respiro", "L'evitamento", "Il ritorno", "Il margine"],
  en: ["The body", "The waiting", "The breath", "Avoidance", "The return", "The room"],
};

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

export function LibriHero({
  locale,
  kicker,
  title,
  titleEmphasisWord,
  lead,
}: {
  locale: Locale;
  kicker: string;
  title: string;
  titleEmphasisWord?: string;
  lead: string;
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.stageFrame}>
        <LibriHeroVisual words={HERO_WORDS[locale]} />
      </div>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <SectionKicker>{kicker}</SectionKicker>
          </p>
          <h1 className={styles.heading}>{renderHeading(title, titleEmphasisWord)}</h1>
          <p className={styles.lead}>{lead}</p>
        </div>
      </div>
      {/* Portal target for LibriHeroVisual's floating word — see this
          class's own comment for why it needs to live at .hero's level,
          not nested inside .stageFrame. */}
      <div className={styles.wordsLayer} data-libri-words-layer="" />
    </section>
  );
}
