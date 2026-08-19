import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AsymmetricOffsetBlock } from "@/components/AsymmetricOffsetBlock";
import { CenteredHero } from "@/components/CenteredHero";
import { ContactBlock } from "@/components/ContactBlock";
import { EpigraphBand } from "@/components/EpigraphBand";
import { PracticalClosing } from "@/components/PracticalClosing";
import { StackedBands } from "@/components/StackedBands";
import { sanityFetch } from "@/sanity/client";
import { onlineTherapyPath, pillarPath, type Locale } from "@/sanity/paths";
import { contactSectionQuery, onlineTherapyPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface OffsetBlock {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface AreaBandLink {
  label?: string;
  slug?: string;
}

interface AreaBand {
  heading?: string;
  p1?: string;
  p2?: string;
  links?: AreaBandLink[];
}

interface PlainBand {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface PracticalColumn {
  heading?: string;
  p?: string;
}

interface OnlineTherapyPageData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  lead?: string;
  languageEpigraph?: { kicker?: string; epigraph?: string; p1?: string; p2?: string; p3?: string };
  fourAreas?: { kicker?: string; heading?: string; bands?: AreaBand[] };
  timeZones?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    p1?: string;
    p2?: string;
    p3?: string;
    offset?: OffsetBlock;
  };
  howItWorks?: { band1?: PlainBand; band2?: PlainBand; band3?: PlainBand };
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

function getOnlineTherapyPage(locale: string) {
  return sanityFetch<OnlineTherapyPageData | null>(onlineTherapyPageQuery, { locale }, ["onlineTherapyPage"]);
}

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
  const [data, siteSettings] = await Promise.all([getOnlineTherapyPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: onlineTherapyPath("it"),
      en: onlineTherapyPath("en"),
    },
  });
}

function toBands(locale: Locale, bands: AreaBand[] | undefined) {
  return (bands ?? []).map((band) => ({
    heading: band.heading ?? "",
    p1: band.p1 ?? "",
    p2: band.p2,
    links: (band.links ?? [])
      .filter((link): link is { label: string; slug: string } => Boolean(link.label && link.slug))
      .map((link) => ({ label: link.label, href: pillarPath(locale, link.slug) })),
  }));
}

export default async function OnlineTherapyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [data, contactCopy, siteSettings] = await Promise.all([
    getOnlineTherapyPage(locale),
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

      {/* === 2. WHY IN YOUR OWN LANGUAGE — epigraph band === */}
      <div className="themeDark">
        <EpigraphBand
          kicker={data?.languageEpigraph?.kicker ?? ""}
          epigraph={data?.languageEpigraph?.epigraph ?? ""}
          paragraphs={[
            data?.languageEpigraph?.p1,
            data?.languageEpigraph?.p2,
            data?.languageEpigraph?.p3,
          ].filter((p): p is string => Boolean(p))}
        />
      </div>

      {/* === 3. WHAT PEOPLE ARRIVE WITH — stacked bands, with pillar links === */}
      <div className="themeDark">
        <StackedBands tone="surface" bands={toBands(typedLocale, data?.fourAreas?.bands)} />
      </div>

      {/* === 4. TIME ZONES — asymmetric offset, 3 main paragraphs === */}
      <AsymmetricOffsetBlock
        kicker={data?.timeZones?.kicker ?? ""}
        heading={data?.timeZones?.heading ?? ""}
        headingEmphasisWord={data?.timeZones?.headingEmphasisWord}
        p1={data?.timeZones?.p1 ?? ""}
        p2={data?.timeZones?.p2 ?? ""}
        p3={data?.timeZones?.p3}
        offset={{
          heading: data?.timeZones?.offset?.heading ?? "",
          p1: data?.timeZones?.offset?.p1 ?? "",
          p2: data?.timeZones?.offset?.p2 ?? "",
        }}
      />

      {/* === 5. HOW IT WORKS IN PRACTICE — three stacked bands, no links === */}
      <div className="themeDark">
        <StackedBands
          tone="surface"
          bands={[
            {
              heading: data?.howItWorks?.band1?.heading ?? "",
              p1: data?.howItWorks?.band1?.p1 ?? "",
              p2: data?.howItWorks?.band1?.p2,
            },
            {
              heading: data?.howItWorks?.band2?.heading ?? "",
              p1: data?.howItWorks?.band2?.p1 ?? "",
              p2: data?.howItWorks?.band2?.p2,
            },
            {
              heading: data?.howItWorks?.band3?.heading ?? "",
              p1: data?.howItWorks?.band3?.p1 ?? "",
              p2: data?.howItWorks?.band3?.p2,
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
