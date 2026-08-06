import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactBlock } from "@/components/ContactBlock";
import { DiplomiSlider } from "@/components/DiplomiSlider";
import { PillarHero } from "@/components/PillarHero";
import { ReadingArea } from "@/components/ReadingArea";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { sanityFetch } from "@/sanity/client";
import { resolveDiplomiLabItems } from "@/sanity/diplomi";
import { buildBreadcrumbListJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { aboutPath } from "@/sanity/paths";
import portableTextStyles from "@/sanity/portableTextComponents.module.scss";
import {
  chiSonoDiplomiQuery,
  chiSonoSectionQuery,
  contactSectionQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface ChiSonoData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  paragraphs?: string[];
  pullQuote?: string;
  portrait?: { asset?: unknown; alt?: string };
  storyLink?: { current?: string };
  seo?: SeoFields;
}

interface DiplomiData {
  diplomi?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    intro?: string;
    alboLine?: string;
    items?: Parameters<typeof resolveDiplomiLabItems>[0];
  };
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

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// "Non sono un tuttologo — e lo considero un punto di forza." is the only
// clause of paragraph 5 NOT already on the homepage (its first two
// sentences are homePage.profilo's own third paragraph, word for word —
// see this route's own top comment on the overlap). Selects, doesn't
// rewrite — same technique the article route's own buildAuthorBio/
// firstSentence already uses in the opposite direction.
function lastSentence(paragraph: string): string {
  const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences[sentences.length - 1] ?? paragraph;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [chiSono, siteSettings] = await Promise.all([
    sanityFetch<ChiSonoData | null>(chiSonoSectionQuery, { locale }, ["chiSonoSection"]),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: locale as "it" | "en",
    title: chiSono?.title ?? "",
    seo: chiSono?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: aboutPath("it"),
      en: aboutPath("en"),
    },
  });
}

// Chi sono build pass — reads chiSonoSection directly, not the aboutPage
// document type. aboutPage (defineSimplePageType) is a generic title +
// Portable Text body + SEO shape with zero documents ever created against
// it — it has no portrait, no pull quote, no kicker, none of the
// individually-addressable fields this page's own layout needs, and using
// it would mean either inventing a document from scratch (with no real
// content to put in the body beyond what chiSonoSection already holds
// verbatim) or storing the SAME real client copy in two places. chiSonoSection
// already has real, finished content in exactly the shape this page uses.
//
// Overlap handling (explicit instruction: don't repeat homePage.profilo's
// three paragraphs verbatim) — checked directly, paragraph by paragraph:
// chiSonoSection.paragraphs[2] and [3] are profilo's paragraphs 1 and 2,
// word for word. paragraphs[4]'s first two sentences are profilo's
// paragraph 3, word for word; only its closing sentence ("Non sono un
// tuttologo...") isn't on the homepage. This page therefore renders only
// paragraphs[0] and [1] (the origin story — Siena, the panic attack,
// Amsterdam — which exists nowhere else on the site), the pull quote
// inline, and paragraphs[4] trimmed to its one non-duplicate sentence.
// paragraphs[2]/[3] are not rendered here at all.
export default async function ChiSonoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [chiSono, diplomiData, contactCopy, siteSettings] = await Promise.all([
    sanityFetch<ChiSonoData | null>(chiSonoSectionQuery, { locale }, ["chiSonoSection"]),
    sanityFetch<DiplomiData | null>(chiSonoDiplomiQuery, { locale }, ["homePage"]),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const siteUrl = getSiteUrl();
  const path = aboutPath(typedLocale);

  const trail = await getPillarTrail(typedLocale, chiSono?.title ?? "", path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const tDiplomi = await getTranslations({ locale, namespace: "Diplomi" });
  const diplomiLabItems = resolveDiplomiLabItems(diplomiData?.diplomi?.items);

  const contactSection = contactCopy?.contactSection;
  const contactPhotoUrl = "/design-lab/photos/09.webp";
  const contactPhotoAlt = "Giuseppe Iannone, ritratto.";

  const paragraphs = chiSono?.paragraphs ?? [];
  const closingSentence = paragraphs[4] ? lastSentence(paragraphs[4]) : undefined;

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />

      {/* Section 1: Hero — reuses PillarHero as-is. No facts strip on this
          route (see page.module.scss's own comment on .heroViewport for
          the flex-sibling question); no standfirst (chiSonoSection has no
          field for one — see PillarHero.tsx's own comment on why that
          prop is now optional). */}
      <div className={styles.heroViewport}>
        <PillarHero
          trail={trail}
          heroKicker={chiSono?.kicker ?? ""}
          title={chiSono?.title ?? ""}
          titleEmphasisWord={chiSono?.titleEmphasisWord}
          heroImage={chiSono?.portrait as never}
        />
      </div>

      <div className={styles.lightIsland}>
        {/* Section 2: Body — reuses ReadingArea. chiSonoSection stores
            plain prose, not Portable Text, so there's no PortableText call
            here — just plain <p>/<blockquote> tags carrying
            portableTextComponents.module.scss's own .paragraph/.blockquote
            classes (the same rhythm pillar/article body copy already
            uses, borrowed directly rather than re-declared). No headings
            at all (see this route's own report on the TOC-minimum
            question) — ReadingArea's own hasToc check collapses the TOC
            gutter accordingly. */}
        <ReadingArea headings={[]}>
          {paragraphs[0] ? <p className={portableTextStyles.paragraph}>{paragraphs[0]}</p> : null}
          {paragraphs[1] ? <p className={portableTextStyles.paragraph}>{paragraphs[1]}</p> : null}
          {chiSono?.pullQuote ? (
            <blockquote className={portableTextStyles.blockquote}>{chiSono.pullQuote}</blockquote>
          ) : null}
          {closingSentence ? <p className={portableTextStyles.paragraph}>{closingSentence}</p> : null}
        </ReadingArea>

        {/* Section 3: Qualifications — reuses DiplomiSlider verbatim,
            reading the SAME homePage.diplomi data the homepage itself
            shows (not new content — the qualification list itself isn't
            part of the paragraph-overlap concern). scan/scanRedacted gate
            now lives in src/sanity/diplomi.ts's resolveDiplomiLabItems,
            shared with the homepage instead of duplicated. */}
        <section className={styles.qualifications} aria-labelledby="chi-sono-diplomi-heading">
          <DiplomiSlider
            headingId="chi-sono-diplomi-heading"
            kicker={diplomiData?.diplomi?.kicker ?? ""}
            heading={diplomiData?.diplomi?.heading ?? ""}
            headingEmphasisWord={diplomiData?.diplomi?.headingEmphasisWord}
            intro={diplomiData?.diplomi?.intro}
            alboLine={diplomiData?.diplomi?.alboLine}
            closeLabel={tDiplomi("closeLabel")}
            items={diplomiLabItems}
          />
        </section>

        {/* Section 4: Contact — reuses ContactBlock, same props shape as
            the pillar/article routes. No related-articles section (owner
            call: a bio page listing blog posts read as odd — flagged in
            this pass's own earlier report, not built here). No
            PillarRecognition (built for symptom quotes, not biographical
            content). */}
        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={typedLocale}
          photoUrl={contactPhotoUrl}
          photoAlt={contactPhotoAlt}
        />
      </div>
    </main>
  );
}
