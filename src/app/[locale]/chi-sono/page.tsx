import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AreaMosaic, type AreaMosaicItem } from "@/components/AreaMosaic";
import { ContactBlock } from "@/components/ContactBlock";
import { DiplomiSlider } from "@/components/DiplomiSlider";
import { PortraitHero } from "@/components/PortraitHero";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { sanityFetch } from "@/sanity/client";
import { resolveDiplomiLabItems } from "@/sanity/diplomi";
import { buildBreadcrumbListJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { aboutPath, type Locale } from "@/sanity/paths";
import portableTextStyles from "@/sanity/portableTextComponents.module.scss";
import {
  chiSonoDiplomiQuery,
  chiSonoMosaicQuery,
  chiSonoSectionQuery,
  contactSectionQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface WhatIWorkWithData {
  kicker?: string;
  heading?: string;
  intro?: string[];
  closingLine?: string;
}

interface HowIWorkPart {
  title?: string;
  body?: string[];
}

interface HowIWorkData {
  kicker?: string;
  heading?: string;
  intro?: string;
  parts?: HowIWorkPart[];
}

interface ChiSonoData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  heroStandfirst?: string;
  heroLocations?: string;
  whatIWorkWith?: WhatIWorkWithData;
  howIWork?: HowIWorkData;
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

function getMosaicItems(locale: string) {
  return sanityFetch<AreaMosaicItem[]>(chiSonoMosaicQuery, { locale }, ["pillarPage"]);
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

// Chi sono opening pass (pass 1 of 4) — replaces the page's old top
// (PillarHero + paragraphs[0]/[1] + pullQuote + trimmed paragraphs[4])
// with the new Hero / "Di cosa mi occupo" / "Come lavoro" sections. What
// used to render there is gone from THIS route, but chiSonoSection.
// paragraphs itself is untouched in the schema and still populated — the
// article footer's author bio (buildAuthorBio, blog/[slug]/page.tsx)
// reads it through its own independent query and keeps working
// unmodified. DiplomiSlider ("Quattordici anni di formazione", today's
// closest thing to "the timeline") and ContactBlock below are left
// exactly as they rendered before this pass — untouched, per instruction,
// reserved for a later pass.
export default async function ChiSonoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [chiSono, mosaicItems, diplomiData, contactCopy, siteSettings] = await Promise.all([
    sanityFetch<ChiSonoData | null>(chiSonoSectionQuery, { locale }, ["chiSonoSection"]),
    getMosaicItems(locale),
    sanityFetch<DiplomiData | null>(chiSonoDiplomiQuery, { locale }, ["homePage"]),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const siteUrl = getSiteUrl();
  const path = aboutPath(typedLocale);

  const trail = await getPillarTrail(typedLocale, chiSono?.title ?? "", path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const tDiplomi = await getTranslations({ locale, namespace: "Diplomi" });
  const tChiSono = await getTranslations({ locale, namespace: "ChiSono" });
  const diplomiLabItems = resolveDiplomiLabItems(diplomiData?.diplomi?.items);

  const contactSection = contactCopy?.contactSection;
  const contactPhotoUrl = "/design-lab/photos/09.webp";
  const contactPhotoAlt = "Giuseppe Iannone, ritratto.";

  const whatIWorkWith = chiSono?.whatIWorkWith;
  const howIWork = chiSono?.howIWork;
  const parts = howIWork?.parts ?? [];

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />

      <div className={styles.lightIsland}>
        {/* Section 1: Hero — contained, portrait to the side. Replaces
            the old full-bleed PillarHero. */}
        <PortraitHero
          trail={trail}
          kicker={chiSono?.kicker ?? ""}
          title={chiSono?.title ?? ""}
          titleEmphasisWord={chiSono?.titleEmphasisWord}
          standfirst={chiSono?.heroStandfirst}
          locationsLine={chiSono?.heroLocations}
          portrait={chiSono?.portrait as never}
        />

        {/* Section 2: "Di cosa mi occupo" — heading/intro in the
            container, then the full-bleed area mosaic, then the closing
            paragraph and the italic voice-shift line. */}
        {whatIWorkWith ? (
          <>
            <div className={styles.whatIWorkWith}>
              {whatIWorkWith.kicker ? (
                <p className={portableTextStyles.paragraph}>{whatIWorkWith.kicker}</p>
              ) : null}
              {whatIWorkWith.heading ? (
                <h2 className={styles.whatIWorkWithHeading}>{whatIWorkWith.heading}</h2>
              ) : null}
              {(whatIWorkWith.intro ?? []).slice(0, -1).map((paragraph, index) => (
                <p key={index} className={portableTextStyles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            <AreaMosaic
              items={mosaicItems}
              locale={typedLocale}
              subtopicCountLabel={(count) => tChiSono("subtopicCount", { count })}
            />

            <div className={styles.whatIWorkWithClosing}>
              {(whatIWorkWith.intro ?? []).slice(-1).map((paragraph, index) => (
                <p key={index} className={portableTextStyles.paragraph}>
                  {paragraph}
                </p>
              ))}
              {whatIWorkWith.closingLine ? (
                <p className={styles.closingLine}>{whatIWorkWith.closingLine}</p>
              ) : null}
            </div>
          </>
        ) : null}

        {/* Section 3: "Come lavoro" — sand surface, in the container.
            Numbered parts, chapter marks not an infographic; a part with
            no real content yet (the bracketed "Fra un incontro e
            l'altro" / "Between sessions") is simply absent from the
            array — see the population script's own comment. */}
        {howIWork && parts.length > 0 ? (
          <div className={styles.howIWork}>
            <div className={styles.howIWorkSurface}>
              {howIWork.kicker ? (
                <p className={portableTextStyles.paragraph}>{howIWork.kicker}</p>
              ) : null}
              {howIWork.heading ? <h2 className={styles.howIWorkHeading}>{howIWork.heading}</h2> : null}
              {howIWork.intro ? <p className={styles.howIWorkIntro}>{howIWork.intro}</p> : null}
              <div className={styles.parts}>
                {parts.map((part, index) => (
                  <div key={part.title ?? index} className={styles.part}>
                    <span className={styles.partNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      {part.title ? <h3 className={styles.partTitle}>{part.title}</h3> : null}
                      <div className={styles.partBody}>
                        {(part.body ?? []).map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Section 4: Qualifications — unchanged, DiplomiSlider verbatim. */}
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

        {/* Section 5: Contact — unchanged. */}
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
