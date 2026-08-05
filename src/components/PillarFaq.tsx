import { getTranslations } from "next-intl/server";
import { FaqAccordion, type FaqAccordionPair } from "./FaqAccordion";
import { buildFaqPageJsonLd, plainTextFromPortableText } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import styles from "./PillarFaq.module.scss";

export interface PillarFaqItem {
  _id: string;
  question: string;
  answer: unknown;
}

// Dedicated top-level field (pillarPage.faqItems), not fished out of Body
// — see pillarPage.ts's own field description for why. FAQPage JSON-LD is
// built from the SAME items passed to the visible accordion, so the two
// can never drift (same pattern the homepage's own FaqSection.tsx already
// uses for its own faqItem references).
export async function PillarFaq({
  locale,
  items,
}: {
  locale: string;
  items?: PillarFaqItem[];
}) {
  const faqItems = items ?? [];
  if (faqItems.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "PillarPage" });

  const pairs: FaqAccordionPair[] = faqItems.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  const faqPageJsonLd = buildFaqPageJsonLd(
    faqItems.map((item) => ({
      question: item.question,
      answerText: plainTextFromPortableText(item.answer),
    })),
  );

  return (
    <div className={styles.faqSection}>
      <JsonLdScript data={faqPageJsonLd} />
      <div className={styles.faqInner}>
        <h2 className={styles.faqHeading}>{t("faqHeading")}</h2>
        <FaqAccordion pairs={pairs} />
      </div>
    </div>
  );
}
