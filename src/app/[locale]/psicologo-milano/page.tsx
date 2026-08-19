import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AsymmetricOffsetBlock } from "@/components/AsymmetricOffsetBlock";
import { CenteredHero } from "@/components/CenteredHero";
import { ContactBlock } from "@/components/ContactBlock";
import { PracticalClosing } from "@/components/PracticalClosing";
import { SplitBlock } from "@/components/SplitBlock";
import { StackedBands } from "@/components/StackedBands";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { sanityFetch } from "@/sanity/client";
import { milanPath, pillarPath, type Locale } from "@/sanity/paths";
import { contactSectionQuery, milanPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface AreaColumn {
  title?: string;
  body?: string;
  link?: { label?: string; slug?: string };
}

interface SplitSide {
  label?: string;
  heading?: string;
  p1?: string;
  p2?: string;
}

interface OffsetBlock {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface Band {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface PracticalColumn {
  heading?: string;
  p?: string;
}

interface MilanPageData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  lead?: string;
  sixAreas?: { kicker?: string; heading?: string; intro?: string; items?: AreaColumn[] };
  split?: { left?: SplitSide; right?: SplitSide };
  asymmetric?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    p1?: string;
    p2?: string;
    offset?: OffsetBlock;
  };
  twoBands?: { band1?: Band; band2?: Band };
  practical?: { col1?: PracticalColumn; col2?: PracticalColumn; col3?: PracticalColumn; closingQuote?: string };
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

function getMilanPage(locale: string) {
  return sanityFetch<MilanPageData | null>(milanPageQuery, { locale }, ["milanPage"]);
}

// Copy-pasted from every other real page's own private helper (metodo,
// faq, contatti) rather than a new shared export — matching this
// codebase's own established convention.
function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

const CONTACT_PHOTO_URL = "/design-lab/photos/09.webp";
const CONTACT_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [data, siteSettings] = await Promise.all([getMilanPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: milanPath("it"),
      en: milanPath("en"),
    },
  });
}

export default async function MilanoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [data, contactCopy, siteSettings] = await Promise.all([
    getMilanPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const contactSection = contactCopy?.contactSection;

  return (
    <main className={styles.page} data-light-hero>
      {/* === 1. HERO === */}
      <CenteredHero
        kicker={data?.kicker ?? ""}
        title={data?.title ?? ""}
        titleEmphasisWord={data?.titleEmphasisWord}
        lead={data?.lead ?? ""}
      />

      {/* === 2. SIX AREAS — page-local 3-column grid, not a shared
          component (used by this page only). "The path" treatment per
          the brief: two rows of three columns. === */}
      <section className={styles.sixAreasSection}>
        <div className={styles.sixAreasHeader}>
          <p className={styles.kicker}>
            <SectionKicker>{data?.sixAreas?.kicker ?? ""}</SectionKicker>
          </p>
          <h2 className={styles.h2}>{data?.sixAreas?.heading}</h2>
          <p className={styles.introP}>{data?.sixAreas?.intro}</p>
        </div>
        <div className={styles.sixAreasGrid}>
          {(data?.sixAreas?.items ?? []).map((item, i) => (
            <div key={i} className={styles.areaColumn}>
              <h3 className={styles.h3}>{item.title}</h3>
              <p className={styles.bodyP}>{item.body}</p>
              {item.link?.slug ? (
                <a href={pillarPath(typedLocale, item.link.slug)} className={styles.link}>
                  {item.link.label}
                  <span className={styles.linkGlyph} aria-hidden="true">
                    ⟶
                  </span>
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* === 3. THE SPLIT — two studios. themeDark: see SplitBlock's own
          file comment for the light-island mirror-image trap this avoids. === */}
      <div className="themeDark">
        <SplitBlock
          left={{
            label: data?.split?.left?.label ?? "",
            heading: data?.split?.left?.heading ?? "",
            p1: data?.split?.left?.p1 ?? "",
            p2: data?.split?.left?.p2 ?? "",
          }}
          right={{
            label: data?.split?.right?.label ?? "",
            heading: data?.split?.right?.heading ?? "",
            p1: data?.split?.right?.p1 ?? "",
            p2: data?.split?.right?.p2 ?? "",
          }}
        />
      </div>

      {/* === 4. HOW TO CHOOSE — asymmetric offset === */}
      <AsymmetricOffsetBlock
        kicker={data?.asymmetric?.kicker ?? ""}
        heading={data?.asymmetric?.heading ?? ""}
        headingEmphasisWord={data?.asymmetric?.headingEmphasisWord}
        p1={data?.asymmetric?.p1 ?? ""}
        p2={data?.asymmetric?.p2 ?? ""}
        offset={{
          heading: data?.asymmetric?.offset?.heading ?? "",
          p1: data?.asymmetric?.offset?.p1 ?? "",
          p2: data?.asymmetric?.offset?.p2 ?? "",
        }}
      />

      {/* === 5. ONLINE + FIRST MEETING — two stacked bands === */}
      <div className="themeDark">
        <StackedBands
          tone="surface"
          bands={[
            {
              heading: data?.twoBands?.band1?.heading ?? "",
              p1: data?.twoBands?.band1?.p1 ?? "",
              p2: data?.twoBands?.band1?.p2,
            },
            {
              heading: data?.twoBands?.band2?.heading ?? "",
              p1: data?.twoBands?.band2?.p1 ?? "",
              p2: data?.twoBands?.band2?.p2,
            },
          ]}
        />
      </div>

      {/* === 6. PRACTICAL + CLOSING QUOTE === */}
      <PracticalClosing
        columns={[
          { heading: data?.practical?.col1?.heading ?? "", body: data?.practical?.col1?.p ?? "" },
          { heading: data?.practical?.col2?.heading ?? "", body: data?.practical?.col2?.p ?? "" },
          { heading: data?.practical?.col3?.heading ?? "", body: data?.practical?.col3?.p ?? "" },
        ]}
        closingQuote={data?.practical?.closingQuote}
      />

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
