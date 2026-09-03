import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AsymmetricOffsetBlock } from "@/components/AsymmetricOffsetBlock";
import { CenteredHero } from "@/components/CenteredHero";
import { CityWelcomeBlock } from "@/components/CityWelcomeBlock";
import { ContactBlock } from "@/components/ContactBlock";
import { PracticalClosing } from "@/components/PracticalClosing";
import { SplitBlock } from "@/components/SplitBlock";
import { StackedBands } from "@/components/StackedBands";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { sanityFetch } from "@/sanity/client";
import { CONTACT_PHOTO_URL, CONTACT_PHOTO_ALT } from "@/sanity/contactPhoto";
import { MID_PAGE_PHOTO_URL, MID_PAGE_PHOTO_ALT } from "@/sanity/midPagePhoto";
import { milanPath, pillarPath, type Locale } from "@/sanity/paths";
import { contactSectionQuery, milanPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale.
// psychologist-milan/page.tsx re-exports this route's default/
// generateMetadata but restates this const on its own — Next's
// segment-config extraction doesn't follow re-exports across files.
export const revalidate = 86400;

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

// CONTACT_PHOTO_URL/ALT: single-sourced (src/sanity/contactPhoto.ts).
// MID_PAGE_PHOTO_URL/ALT: single-sourced (src/sanity/midPagePhoto.ts) —
// deliberately a DIFFERENT photo from the contact-section one above (two
// identical portraits on one page reads as an error, per the original
// brief); see that module's own comment.

// No field for "in studio dal" exists anywhere in the schema (checked
// siteSettings, chiSonoSection, homePage) — only registrationNumber does
// (siteSettings.author.registrationNumber, already fetched below via
// getSiteSettings). The year is a literal, per this pass's own brief.
const PRACTISING_SINCE_YEAR = "2013";

function credentialLine(locale: Locale, registrationNumber: string | undefined) {
  if (!registrationNumber) return null;
  return locale === "en"
    ? `Registered with the Order of Psychologists of Lombardy, no. ${registrationNumber} · practising since ${PRACTISING_SINCE_YEAR}`
    : `Iscritto all'Albo degli Psicologi della Lombardia n. ${registrationNumber} · in studio dal ${PRACTISING_SINCE_YEAR}`;
}

// CityWelcomeBlock copy pass — page-local, literal (not Sanity-driven),
// matching this file's own established convention (CONTACT_PHOTO_URL/ALT
// above are the same shape) rather than adding a new schema field for a
// single mid-page section. Identical between Milan and Monza (verbatim,
// per brief). No list — CityWelcomeBlock.tsx's own top comment on why
// it was removed (the addresses/online-option/single-fee facts it named
// were already stated three times above this section on the page).
const CITY_WELCOME_COPY = {
  it: {
    kicker: "Il primo passo",
    heading: "Il primo colloquio serve a capire insieme cosa sta succedendo",
    headingEmphasisWord: "capire insieme",
    lead: "Dura quarantacinque minuti e non comporta impegno a proseguire. Le domande le faccio io — non serve arrivare preparato, e non serve sapere già da dove cominciare.",
    ctaLabel: "Scrivimi",
  },
  en: {
    kicker: "The first step",
    heading: "A first session is there to work out together what is going on",
    headingEmphasisWord: "together",
    lead: "It lasts forty-five minutes and commits you to nothing. I ask the questions — you do not need to arrive prepared, and you do not need to know where to begin.",
    ctaLabel: "Write to me",
  },
} as const;

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

  const [data, contactCopy, siteSettings, tDiplomi, tContactDialog] = await Promise.all([
    getMilanPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "Diplomi" }),
    getTranslations({ locale, namespace: "ContactDialog" }),
  ]);

  const contactSection = contactCopy?.contactSection;
  const midPageCredentialLine = credentialLine(typedLocale, siteSettings?.author?.registrationNumber);
  // Same convention as page.tsx's own WelcomeBlock wiring — closeLabel/
  // contactDialogHeading resolved server-side from the shared message
  // catalogs, not new page-local strings.
  const closeLabel = tDiplomi("closeLabel");
  const contactDialogHeading = tContactDialog("heading");
  const cityWelcomeCopy = CITY_WELCOME_COPY[typedLocale];

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

      {/* === 4. HOW TO CHOOSE — asymmetric offset. Its own offset column
          (the "if neither is convenient" closing argument) is retired —
          this block now renders its main column only; the mid-page
          section below carries its own, unrelated copy. === */}
      <AsymmetricOffsetBlock
        kicker={data?.asymmetric?.kicker ?? ""}
        heading={data?.asymmetric?.heading ?? ""}
        headingEmphasisWord={data?.asymmetric?.headingEmphasisWord}
        p1={data?.asymmetric?.p1 ?? ""}
        p2={data?.asymmetric?.p2 ?? ""}
      />

      {/* === 4b. Real Welcome-shaped mid-page section — same elements, same
          order, same components (Button/ContactFormDialog/ShimmerText/
          AnimatedDivider/SectionKicker), same card+photo proportions as
          the homepage's own WelcomeBlock. See CityWelcomeBlock.tsx's own
          top comment.

          themeDark wrapper — required, not decorative: this page carries
          data-light-hero on <main>, and mixins.upper-left-sheen has a
          guard that renders a magenta/black hazard pattern instead of the
          real glow whenever --tone-surface-scope inherits "light" from an
          ancestor (see _tokens.scss's own ".themeDark, :root[data-theme=
          dark]" rule and its "Sheen-guard fix" comment — the identical bug
          already hit once on /prezzi's own dark band). Caught live: the
          hazard pattern rendered on first screenshot before this wrapper
          was added. .themeDark resets --tone-surface-scope: dark, same
          fix as every other dark section already on this page
          (SplitBlock/StackedBands above). === */}
      <div className="themeDark">
        <CityWelcomeBlock
          kicker={cityWelcomeCopy.kicker}
          heading={cityWelcomeCopy.heading}
          headingEmphasisWord={cityWelcomeCopy.headingEmphasisWord}
          lead={cityWelcomeCopy.lead}
          ctaLabel={cityWelcomeCopy.ctaLabel}
          authorName={siteSettings?.author?.name ?? "Giuseppe Iannone"}
          credentialLine={midPageCredentialLine ?? undefined}
          photoUrl={MID_PAGE_PHOTO_URL}
          photoAlt={MID_PAGE_PHOTO_ALT}
          locale={typedLocale}
          closeLabel={closeLabel}
          contactDialogHeading={contactDialogHeading}
        />
      </div>

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
