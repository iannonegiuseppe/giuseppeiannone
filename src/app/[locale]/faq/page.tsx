import type { Metadata } from "next";
import type { Image as SanityImage } from "sanity";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactBlock } from "@/components/ContactBlock";
import { LightPortraitHero } from "@/components/LightPortraitHero";
import { sanityFetch } from "@/sanity/client";
import { CONTACT_PHOTO_URL, CONTACT_PHOTO_ALT } from "@/sanity/contactPhoto";
import { buildFaqPageJsonLd, plainTextFromPortableText } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { faqPath } from "@/sanity/paths";
import { contactSectionQuery, faqPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import { FaqExplorer, type FaqExplorerSection } from "./FaqExplorer";
import styles from "./faq.module.scss";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale.
export const revalidate = 86400;

interface FaqItemData {
  _id: string;
  question: string;
  answer: unknown;
}

interface FaqPageData {
  title?: string;
  titleEmphasisWord?: string;
  intro?: unknown;
  photo?: (SanityImage & { alt?: string }) | undefined;
  sections?: Array<{
    _key: string;
    title: string;
    description: string;
    items: FaqItemData[];
  }>;
  seo?: SeoFields;
}

interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getFaqPage(locale: string) {
  return sanityFetch<FaqPageData | null>(faqPageQuery, { locale }, ["faqPage"]);
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// /faq build pass — canonical/hreflang built the Prezzi/Chi-sono way:
// fixed, hardcoded from faqPath() directly, never derived from an
// `alternates` GROQ projection (see CLAUDE.md's own "Singleton page
// routes" section for the full reasoning this repeats).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const [data, siteSettings] = await Promise.all([getFaqPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: faqPath("it"),
      en: faqPath("en"),
    },
  });
}

// CONTACT_PHOTO_URL/ALT: single-sourced (src/sanity/contactPhoto.ts).

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [data, contactCopy, siteSettings] = await Promise.all([
    getFaqPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const t = await getTranslations({ locale, namespace: "FaqPage" });

  const sections: FaqExplorerSection[] = (data?.sections ?? []).map((section) => ({
    _key: section._key,
    title: section.title,
    description: section.description,
    items: section.items.map((item) => ({ question: item.question, answer: item.answer })),
  }));

  const contactSection = contactCopy?.contactSection;

  // Content-load pass: this page's 42/45 questions are now a genuinely
  // separate, differently-worded set from the pillar/subtopic pages'
  // own FAQ items (see this pass's own report — that's the whole reason
  // a parallel faqItem-faq-{it,en}-N set exists rather than repointing
  // the shared ones), so nothing is duplicated across two URLs anymore.
  // Built from the exact SAME `sections` data FaqExplorer renders (flattened
  // across all ten), the same discipline PillarFaq.tsx already uses, so the
  // visible accordion and this markup cannot drift apart.
  const faqPageJsonLd = buildFaqPageJsonLd(
    sections.flatMap((section) =>
      section.items.map((item) => ({
        question: item.question,
        answerText: plainTextFromPortableText(item.answer),
      })),
    ),
  );

  return (
    <main>
      <LightPortraitHero
        kicker={t("kicker")}
        heading={data?.title ?? "FAQ"}
        headingEmphasisWord={data?.titleEmphasisWord}
        headingEmphasisAnimated
        intro={data?.intro ? plainTextFromPortableText(data.intro) : undefined}
        photo={data?.photo}
        photoScale={0.85}
        priority
        mobileFullBleed
      />
      <JsonLdScript data={faqPageJsonLd} />
      <div className={styles.body}>
        <FaqExplorer sections={sections} />
      </div>
      <ContactBlock
        kicker={contactSection?.kicker ?? ""}
        heading={contactSection?.heading ?? ""}
        headingEmphasisWord={contactSection?.headingEmphasisWord}
        photoCaption={contactSection?.photoCaption ?? ""}
        googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
        googleProfileUrl={siteSettings?.googleProfileUrl}
        locale={typedLocale}
        photoUrl={CONTACT_PHOTO_URL}
        photoAlt={CONTACT_PHOTO_ALT}
      />
    </main>
  );
}
