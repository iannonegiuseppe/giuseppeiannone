import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContactBlock } from "@/components/ContactBlock";
import { ShimmerText } from "@/components/ShimmerText";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { sanityFetch } from "@/sanity/client";
import { methodPath } from "@/sanity/paths";
import { contactSectionQuery, methodPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface MethodPhase {
  label?: string;
  heading?: string;
  p1?: string;
  p2?: string;
}

interface MethodSplitSide {
  label?: string;
  heading?: string;
  p1?: string;
  p2?: string;
  p3?: string;
}

interface MethodBand {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface MethodColumn {
  heading?: string;
  p?: string;
}

interface MethodPageData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  lead?: string;
  split?: { left?: MethodSplitSide; right?: MethodSplitSide };
  path?: {
    kicker?: string;
    heading?: string;
    phaseOne?: MethodPhase;
    phaseTwo?: MethodPhase;
    phaseThree?: MethodPhase;
    diary?: { heading?: string; p?: string; quote?: string };
    experiments?: { heading?: string; p1?: string; rhythmLeadIn?: string; rhythmBody?: string };
  };
  relationship?: { kicker?: string; epigraph?: string; p1?: string; p2?: string; p3?: string };
  approach?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    p1?: string;
    p2?: string;
    offset?: { heading?: string; p1?: string; p2?: string };
  };
  fitEnding?: { band1?: MethodBand; band2?: MethodBand };
  practical?: { col1?: MethodColumn; col2?: MethodColumn; col3?: MethodColumn; closingQuote?: string };
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

function getMethodPage(locale: string) {
  return sanityFetch<MethodPageData | null>(methodPageQuery, { locale }, ["methodPage"]);
}

// Copy-pasted from every other real page's own private helper (faq/
// page.tsx, contatti/page.tsx) rather than a new shared export — matching
// this codebase's own established convention.
function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

const CONTACT_PHOTO_URL = "/design-lab/photos/09.webp";
const CONTACT_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

// Splits `text` at the first occurrence of `emphasis` and wraps that span
// in the given render function — same indexOf-based mechanism every real
// page's own headingEmphasisWord/titleEmphasisWord split already uses
// (chi-sono, prezzi, contatti), not a second one.
function splitEmphasis(text: string, emphasis: string | undefined, render: (s: string) => React.ReactNode) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      {render(emphasis)}
      {text.slice(index + emphasis.length)}
    </>
  );
}

// Section 3's "Il ritmo." / "The rhythm." lead-in — same splitting
// mechanism as splitEmphasis above, reused rather than a second one, just
// rendering a <strong> instead of <ShimmerText>.
function splitLeadIn(text: string, leadIn: string | undefined) {
  return splitEmphasis(text, leadIn, (s) => <strong className={styles.leadIn}>{s}</strong>);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const [data, siteSettings] = await Promise.all([getMethodPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: methodPath("it"),
      en: methodPath("en"),
    },
  });
}

export default async function MetodoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [data, contactCopy, siteSettings] = await Promise.all([
    getMethodPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const contactSection = contactCopy?.contactSection;
  const title = data?.title ?? "";
  const titleNode = splitEmphasis(title, data?.titleEmphasisWord, (s) => <ShimmerText>{s}</ShimmerText>);

  const approachHeading = data?.approach?.heading ?? "";
  const approachHeadingNode = splitEmphasis(approachHeading, data?.approach?.headingEmphasisWord, (s) => (
    <ShimmerText>{s}</ShimmerText>
  ));

  const rhythmNode = splitLeadIn(data?.path?.experiments?.rhythmBody ?? "", data?.path?.experiments?.rhythmLeadIn);

  return (
    <main className={styles.page} data-light-hero>
      {/* === 1. HERO — light island, centred ================================ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>
            <SectionKicker>{data?.kicker ?? ""}</SectionKicker>
          </p>
          <h1 className={styles.heroTitle}>{titleNode}</h1>
          <p className={styles.heroLead}>{data?.lead}</p>
        </div>
      </section>

      {/* === 2. THE SPLIT — dark left / surface right, 50/50, zero gap ======
          "themeDark" (plain global class, src/styles/_tokens.scss) wraps
          the WHOLE grid as an ANCESTOR of both halves, never the same
          element as either half's own background — the documented
          light-island mirror-image trap (CLAUDE.md), same fix already
          proven on /prezzi's dark band and this project's own /contatti
          WhatsApp card. Both halves need it: the left's --color-bg fill
          and the right's --color-surface fill are themselves unaffected
          by light-island-surface (neither token is in its reassignment
          list), but BOTH halves' text (--color-text/--color-accent) IS
          reassigned by it, so both need the correction regardless of
          which one owns the "safe" background token. */}
      <div className="themeDark">
        <div className={styles.split}>
          <div className={styles.splitLeft} data-sheen="upper-left">
            <p className={styles.splitLabel}>{data?.split?.left?.label}</p>
            <h2 className={styles.splitHeading}>{data?.split?.left?.heading}</h2>
            <p className={styles.splitP}>{data?.split?.left?.p1}</p>
            <p className={styles.splitP}>{data?.split?.left?.p2}</p>
            <p className={styles.splitP}>{data?.split?.left?.p3}</p>
          </div>
          <div className={styles.splitRight} data-sheen="upper-left">
            <p className={styles.splitLabel}>{data?.split?.right?.label}</p>
            <h2 className={styles.splitHeading}>{data?.split?.right?.heading}</h2>
            <p className={styles.splitP}>{data?.split?.right?.p1}</p>
            <p className={styles.splitP}>{data?.split?.right?.p2}</p>
            <p className={styles.splitP}>{data?.split?.right?.p3}</p>
          </div>
        </div>
      </div>

      {/* === 3. THE PATH — light island, three columns + rule + two columns */}
      <section className={styles.pathSection}>
        <div className={styles.pathHeader}>
          <p className={styles.kicker}>
            <SectionKicker>{data?.path?.kicker ?? ""}</SectionKicker>
          </p>
          <h2 className={styles.h2}>{data?.path?.heading}</h2>
        </div>

        <div className={styles.pathColumns}>
          <div className={styles.pathColumnAccent}>
            <p className={styles.pathPhaseLabel}>{data?.path?.phaseOne?.label}</p>
            <h3 className={styles.h3}>{data?.path?.phaseOne?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.phaseOne?.p1}</p>
            <p className={styles.bodyP}>{data?.path?.phaseOne?.p2}</p>
          </div>
          <div className={styles.pathColumn}>
            <p className={styles.pathPhaseLabel}>{data?.path?.phaseTwo?.label}</p>
            <h3 className={styles.h3}>{data?.path?.phaseTwo?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.phaseTwo?.p1}</p>
            <p className={styles.bodyP}>{data?.path?.phaseTwo?.p2}</p>
          </div>
          <div className={styles.pathColumn}>
            <p className={styles.pathPhaseLabel}>{data?.path?.phaseThree?.label}</p>
            <h3 className={styles.h3}>{data?.path?.phaseThree?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.phaseThree?.p1}</p>
            <p className={styles.bodyP}>{data?.path?.phaseThree?.p2}</p>
          </div>
        </div>

        <div className={styles.pathRule} />

        <div className={styles.pathBelow}>
          <div>
            <h3 className={styles.h3}>{data?.path?.diary?.heading}</h3>
            <p className={styles.bodyPMarginBottom}>{data?.path?.diary?.p}</p>
            <div className={styles.quoteCard}>
              <p className={styles.quoteCardText}>{data?.path?.diary?.quote}</p>
            </div>
          </div>
          <div>
            <h3 className={styles.h3}>{data?.path?.experiments?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.experiments?.p1}</p>
            <p className={styles.rhythmP}>{rhythmNode}</p>
          </div>
        </div>
      </section>

      {/* === 4. THE RELATIONSHIP — dark, epigraph + single 720px column ===== */}
      <div className="themeDark">
        <section className={styles.relationshipSection} data-sheen="upper-left">
          <div className={styles.relationshipInner}>
            <p className={styles.kicker}>
              <SectionKicker>{data?.relationship?.kicker ?? ""}</SectionKicker>
            </p>
            <p className={styles.epigraph}>{data?.relationship?.epigraph}</p>
            <div className={styles.relationshipColumn}>
              <p className={styles.bodyP}>{data?.relationship?.p1}</p>
              <p className={styles.bodyP}>{data?.relationship?.p2}</p>
              <p className={styles.bodyP}>{data?.relationship?.p3}</p>
            </div>
          </div>
        </section>
      </div>

      {/* === 5. THE APPROACH — light island, asymmetric offset, no grid ===== */}
      <section className={styles.approachSection}>
        <div className={styles.approachInner}>
          <p className={styles.kicker}>
            <SectionKicker>{data?.approach?.kicker ?? ""}</SectionKicker>
          </p>
          <h2 className={styles.approachHeading}>{approachHeadingNode}</h2>
          <div className={styles.approachColumn}>
            <p className={styles.bodyP}>{data?.approach?.p1}</p>
            <p className={styles.bodyP}>{data?.approach?.p2}</p>
          </div>
          <div className={styles.approachOffset}>
            <h3 className={styles.h3}>{data?.approach?.offset?.heading}</h3>
            <p className={styles.bodyP}>{data?.approach?.offset?.p1}</p>
            <p className={styles.bodyP}>{data?.approach?.offset?.p2}</p>
          </div>
        </div>
      </section>

      {/* === 6. FIT AND ENDING — surface step, two stacked bands ============ */}
      <div className="themeDark">
        <section className={styles.fitEndingSection} data-sheen="upper-left">
          <div className={styles.fitEndingInner}>
            <div className={styles.fitEndingBand}>
              <h2 className={styles.h2}>{data?.fitEnding?.band1?.heading}</h2>
              <div className={styles.fitEndingProse}>
                <p className={styles.bodyP}>{data?.fitEnding?.band1?.p1}</p>
                <p className={styles.bodyP}>{data?.fitEnding?.band1?.p2}</p>
              </div>
            </div>
            <div className={`${styles.fitEndingBand} ${styles.fitEndingBandLast}`}>
              <h2 className={styles.h2}>{data?.fitEnding?.band2?.heading}</h2>
              <div className={styles.fitEndingProse}>
                <p className={styles.bodyP}>{data?.fitEnding?.band2?.p1}</p>
                <p className={styles.bodyP}>{data?.fitEnding?.band2?.p2}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* === 7. PRACTICAL AND CLOSING — light island ========================= */}
      <section className={styles.practicalSection}>
        <div className={styles.practicalColumns}>
          <div>
            <h3 className={styles.h3}>{data?.practical?.col1?.heading}</h3>
            <p className={styles.bodyP}>{data?.practical?.col1?.p}</p>
          </div>
          <div>
            <h3 className={styles.h3}>{data?.practical?.col2?.heading}</h3>
            <p className={styles.bodyP}>{data?.practical?.col2?.p}</p>
          </div>
          <div>
            <h3 className={styles.h3}>{data?.practical?.col3?.heading}</h3>
            <p className={styles.bodyP}>{data?.practical?.col3?.p}</p>
          </div>
        </div>
        <div className={styles.practicalRule} />
        <p className={styles.closingQuote}>{data?.practical?.closingQuote}</p>
      </section>

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
