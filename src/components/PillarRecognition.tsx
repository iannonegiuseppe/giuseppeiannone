import { getTranslations } from "next-intl/server";
import { hrefFor, type Locale, type ReferencedDoc } from "@/sanity/paths";
import { RecognitionConstellation, type RecognitionRenderItem } from "./RecognitionConstellation";
import { RecognitionSubtopicList, type SubtopicListItem } from "./RecognitionSubtopicList";
import styles from "./PillarRecognition.module.scss";

export interface RecognitionItemData {
  _key: string;
  quote: string;
  label: string;
  subtopic?: ReferencedDoc;
}

export interface RecognitionData {
  items?: RecognitionItemData[];
  leadInOverride?: string;
}

// Emphasis-word selection — automatic, not authored. Picking the first
// word over N letters would land on articles/prepositions/auxiliaries
// ("anche", "quando", "about", "afraid") and read as a bug, so this
// instead excludes a per-locale function-word list, then picks the
// LONGEST remaining word (ties broken by first occurrence). Verified
// against all six quotes in both locales before wiring this in — every
// one of the twelve results is a genuine content word, never a function
// word (the hard constraint); a couple (IT "sentito", EN "aircraft") win
// a same-length tie rather than being the single most evocative word in
// their sentence, which is a real but minor limitation of a pure-length
// heuristic — reported, not hidden, but not a rule failure: it never
// crosses into picking a function word, so this stays automatic rather
// than becoming an authored field.
//
// IT tokenizes on whitespace AND apostrophe (elisions like "dell'attacco"
// / "l'idea" split into a bare stopword fragment + the real word, so
// "dell'"/"l'" don't need to be listed as literal tokens); EN keeps
// apostrophes intact (so contractions like "can't"/"I'm" survive as
// single tokens) and lists the contracted forms directly in its stopword
// set instead. Both strip surrounding punctuation and require length > 2
// (filters stray elision fragments and short pronouns/conjunctions that
// slipped past the explicit list). The returned word keeps its original
// casing/substring exactly as it appears in the quote, since rendering
// (RecognitionConstellation.tsx's own renderEmphasis) matches it back via
// indexOf — the same technique PillarHero.tsx/RecognitionSection.tsx
// already use for their own (authored) emphasis words.
const STOPWORDS_IT = new Set([
  "il", "lo", "la", "i", "gli", "le", "un", "uno", "una",
  "di", "a", "da", "in", "con", "su", "per", "tra", "fra",
  "del", "dello", "della", "dei", "degli", "delle",
  "al", "allo", "alla", "ai", "agli", "alle",
  "dal", "dallo", "dalla", "dai", "dagli", "dalle",
  "sul", "sullo", "sulla", "sui", "sugli", "sulle",
  "nel", "nello", "nella", "nei", "negli", "nelle",
  "e", "ma", "o", "che", "se", "anche", "quando", "mentre", "perché", "poiché",
  "non", "io", "tu", "lui", "lei", "noi", "voi", "loro",
  "mi", "ti", "si", "ci", "vi", "ne",
  "sono", "è", "ho", "hai", "ha", "abbiamo", "avete", "hanno",
  "sto", "stai", "sta", "stiamo", "state", "stanno",
  "più", "meno", "molto", "poco", "così", "ancora", "già", "sempre", "mai", "solo",
  "appena", "dell", "nell", "sull", "dall", "quest", "quell", "l",
  "poter", "avere",
]);

const STOPWORDS_EN = new Set([
  "a", "an", "the",
  "of", "in", "on", "at", "to", "from", "for", "with", "about", "near",
  "and", "but", "or", "so", "that", "even", "when", "while", "because",
  "i", "you", "he", "she", "it", "we", "they",
  "my", "your", "his", "her", "its", "our", "their",
  "me", "him", "us", "them",
  "am", "is", "are", "was", "were", "be", "being", "been",
  "do", "does", "did", "have", "has", "had",
  "can", "could", "will", "would", "shall", "should", "may", "might", "must",
  "not", "one", "there", "like",
  "can't", "won't", "isn't", "aren't", "wasn't", "weren't", "don't", "doesn't", "didn't",
  "i'm", "i've", "i'll", "i'd", "it's", "that's", "there's",
  "he's", "she's", "we're", "they're", "you're", "couldn't", "wouldn't", "shouldn't",
]);

function selectEmphasisWord(quote: string, locale: string): string | undefined {
  const stopwords = locale === "en" ? STOPWORDS_EN : STOPWORDS_IT;
  const splitPattern = locale === "en" ? /\s+/ : /[\s']+/;
  const rawTokens = quote.split(splitPattern);

  let best: string | undefined;
  for (const raw of rawTokens) {
    const trimmed = raw.replace(/^[.,;:!?"“”‘’']+|[.,;:!?"“”‘’']+$/g, "");
    if (trimmed.length <= 2) continue;
    if (stopwords.has(trimmed.toLowerCase())) continue;
    if (!best || trimmed.length > best.length) best = trimmed;
  }
  return best;
}

// Rebuild pass — RecognitionConstellation.tsx now forks the homepage's
// own RecognitionSection.tsx six-slot asymmetric composition (see that
// file's own comment for the reuse-vs-fork reasoning). This component's
// job is unchanged: build the render-item array (quotes, capped at six
// inside the constellation, not here) and the separate gold subtopic
// list (all thirteen, untouched by the cap).
export async function PillarRecognition({
  locale,
  recognition,
}: {
  locale: string;
  recognition?: RecognitionData;
}) {
  const items = recognition?.items ?? [];
  if (items.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "PillarPage" });
  const typedLocale = locale as Locale;

  // RecognitionRenderItem only needs key/quote/revealIndex — label
  // rendering was removed from the quotes in the previous pass and never
  // came back (see RecognitionConstellation.module.scss's own comment on
  // why reusing the homepage's per-fragment label caption would have
  // silently reversed that). revealIndex is stored order (0-5 once
  // capped), not re-derived per slot — it's what the stagger delay
  // multiplies against.
  const quoteItems: RecognitionRenderItem[] = items.map((item, index) => ({
    key: item._key,
    quote: item.quote,
    emphasisWord: selectEmphasisWord(item.quote, locale),
    revealIndex: index,
  }));

  // The label data that used to render under each quote builds this
  // separate directory list instead, in original stored order — all
  // thirteen, independent of the constellation's own six-item cap above.
  const subtopicItems: SubtopicListItem[] = items.map((item) => ({
    key: item._key,
    label: item.label,
    href: item.subtopic ? hrefFor(typedLocale, item.subtopic) : undefined,
  }));

  return (
    <div className={styles.recognition} data-sheen="upper-left">
      <div className={styles.header}>
        <p className={styles.kicker}>
          <span className={styles.kickerRule} aria-hidden="true" />
          {t("recognitionKicker")}
        </p>
        <p className={styles.leadIn}>{recognition?.leadInOverride ?? t("recognitionDisclaimer")}</p>
      </div>
      <RecognitionConstellation items={quoteItems} />
      <RecognitionSubtopicList kicker={t("recognitionListKicker")} items={subtopicItems} />
    </div>
  );
}
