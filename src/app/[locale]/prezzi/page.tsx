import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortableText, type PortableTextComponents } from "next-sanity";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactBlock } from "@/components/ContactBlock";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { sanityFetch } from "@/sanity/client";
import { CONTACT_PHOTO_URL } from "@/sanity/contactPhoto";
import { buildBreadcrumbListJsonLd, buildPersonJsonLd, buildServiceJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { pillarPath, pricePath, type Locale } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { pricingOrPlaceholder } from "@/sanity/pricing";
import { contactSectionQuery, pricePageQuery, sedesQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale. pricing/
// page.tsx re-exports this route's default/generateMetadata but restates
// this const on its own — Next's segment-config extraction doesn't
// follow re-exports across files.
export const revalidate = 1800;

interface PillarLinkTarget {
  _id: string;
  slug?: string;
  title?: string;
}

interface PricePageServiceLink {
  label?: string;
  target?: PillarLinkTarget;
}

interface PricePageService {
  title?: string;
  paragraph1?: string;
  derivedNote?: string;
  linkPrefix?: string;
  links?: PricePageServiceLink[];
  linkSuffix?: string;
}

interface PricePageData {
  title?: string;
  body?: unknown;
  servicesHeading?: string;
  servicesIntro?: string;
  services?: {
    individual?: PricePageService;
    couple?: PricePageService;
    sexology?: PricePageService;
    online?: PricePageService;
  };
  darkBand?: {
    kicker?: string;
    heading?: string;
    emphasisWord?: string;
    column1?: {
      block1Heading?: string;
      block1Body?: string;
      block2Heading?: string;
      block2Body?: string;
    };
    column2?: {
      block1Heading?: string;
      block1Body?: string;
      block2Heading?: string;
      block2Body?: string;
    };
  };
  facts?: { label: string; value: string }[];
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

// Structured-data pass — same sede docs layout.tsx's own MedicalBusiness
// JSON-LD already reads (sedesQuery), reused here for Service.areaServed
// rather than a second, hand-typed location list. city is the only field
// this page needs from it ("Milano"/"Monza"/"Cernusco sul Naviglio"/
// "Online" — real values, fetched, not invented).
interface SedeAreaDoc {
  city: string;
}

function getPricePage(locale: string) {
  return sanityFetch<PricePageData | null>(pricePageQuery, { locale }, ["pricePage"]);
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

function getSedeAreas(locale: string) {
  return sanityFetch<SedeAreaDoc[]>(sedesQuery, { locale }, ["sede"]);
}

// Renders a service's link-bearing sentence — same substring-splice
// technique as every other emphasis-word render in this codebase, applied
// here to a whole list of real Sanity references instead of one word.
// Empty (no links, e.g. "online sessions") renders the prefix/suffix
// alone with nothing spliced in.
function renderServiceLinks(
  service: PricePageService | undefined,
  locale: Locale,
  className: string,
): ReactNode {
  if (!service?.linkPrefix && !service?.links?.length) return null;
  const links = service?.links ?? [];
  const joiner = locale === "en" ? "and" : "e";
  return (
    <p className={className}>
      {service?.linkPrefix}{" "}
      {links.map((link, index) => {
        if (!link.target?.slug) return null;
        const isLast = index === links.length - 1;
        const isFirst = index === 0;
        return (
          <span key={link.target._id}>
            {!isFirst && isLast ? ` ${joiner} ` : !isFirst ? ", " : ""}
            <Link href={pillarPath(locale, link.target.slug)}>{link.label}</Link>
          </span>
        );
      })}
      {service?.linkSuffix}
    </p>
  );
}

// Splices ShimmerText around the first occurrence of emphasisWord found in
// this block's own body text — same substring-splice technique as every
// other emphasis render in this codebase. The dark band's copy is now four
// separate body texts (was one column2 string), so this is checked
// per-block rather than against a single known field; whichever block's
// body contains the phrase gets the animated treatment, the other three
// render as plain text. Chose "Quello che paga è quello che legge qui" /
// "What you pay is what you read here" — echoed almost verbatim by column
// 1 block 1's own opening sentence in the new copy ("Quello che leggi qui
// è quello che paghi" / "What you read here is what you pay") — as the
// emphasis phrase, since no new phrase was specified for this pass; see
// this pass's own report.
function renderBlockBody(body: string | undefined, emphasisWord: string | undefined): ReactNode {
  if (!body) return null;
  const index = emphasisWord ? body.indexOf(emphasisWord) : -1;
  if (!emphasisWord || index === -1) return body;
  return (
    <>
      {body.slice(0, index)}
      <ShimmerText>{emphasisWord}</ShimmerText>
      {body.slice(index + emphasisWord.length)}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [data, siteSettings] = await Promise.all([getPricePage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: pricePath("it"),
      en: pricePath("en"),
    },
  });
}

// /prezzi port pass — the design-lab "C" proposal (fee spread, four
// service blocks, a dark two-column band, a facts card, ContactBlock),
// now real. No local Header here — this route sits inside the real
// [locale] tree, which already renders the site Header from its own
// layout.tsx; a second one would double it. No ProposalBanner (design-lab
// review tooling only). Visible breadcrumbs are dropped along with the
// old reading-page shell — the kicker+h1 header replaces them, matching
// /faq and /blog's own LightPortraitHero-style header, not the pillar/
// article route's own breadcrumb trail. BreadcrumbList JSON-LD is kept
// (structured-data only, no visible UI) so this isn't a pure SEO
// regression — see this pass's own report.
export default async function PricePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [data, contactCopy, siteSettings, sedeAreas] = await Promise.all([
    getPricePage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
    getSedeAreas(locale),
  ]);

  const t = await getTranslations({ locale, namespace: "PricePage" });
  const fees = pricingOrPlaceholder(siteSettings?.pricing, typedLocale);

  const siteUrl = getSiteUrl();
  const path = pricePath(typedLocale);
  const pageUrl = `${siteUrl}${path}`;
  const trail = await getPillarTrail(typedLocale, data?.title ?? "", path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  // Structured data — Service per session type. provider is a full,
  // embedded Person (buildPersonJsonLd, same fields/same source values as
  // layout.tsx's own sitewide Person), not an @id reference — see
  // buildServiceJsonLd's own comment for why. areaServed reuses the same
  // sede docs the sitewide MedicalBusiness node already reads. price/
  // priceCurrency are the RAW numbers from siteSettings.pricing, never
  // the display-formatted strings (those stay display-only, in `fees`
  // above) and never a literal.
  const phoneChannel = siteSettings?.contactChannels?.find((c) => c.type === "phone");
  const emailChannel = siteSettings?.contactChannels?.find((c) => c.type === "email");
  const providerJsonLd = siteSettings?.author?.name
    ? buildPersonJsonLd({
        author: siteSettings.author,
        siteUrl,
        socialLinks: siteSettings.socialLinks,
        telephone: phoneChannel?.value,
        email: emailChannel?.value,
      })
    : undefined;
  const areaServed = sedeAreas.map((sede) => ({ name: sede.city }));
  const pricing = siteSettings?.pricing;
  const currency = pricing?.currency ?? "EUR";

  const serviceJsonLdList =
    providerJsonLd && pricing
      ? [
          buildServiceJsonLd({
            name: data?.services?.individual?.title ?? "",
            description: data?.services?.individual?.paragraph1,
            url: pageUrl,
            provider: providerJsonLd,
            areaServed,
            offers: { price: pricing.individualFee, priceCurrency: currency },
          }),
          buildServiceJsonLd({
            name: data?.services?.couple?.title ?? "",
            description: data?.services?.couple?.paragraph1,
            url: pageUrl,
            provider: providerJsonLd,
            areaServed,
            offers: { price: pricing.coupleFee, priceCurrency: currency },
          }),
          buildServiceJsonLd({
            name: data?.services?.sexology?.title ?? "",
            description: data?.services?.sexology?.paragraph1,
            url: pageUrl,
            provider: providerJsonLd,
            areaServed,
            // Sexology consultation follows the individual-session rate —
            // same figure the visible page's own derived-note shows, not
            // a second literal.
            offers: { price: pricing.individualFee, priceCurrency: currency },
          }),
          buildServiceJsonLd({
            name: data?.services?.online?.title ?? "",
            description: data?.services?.online?.paragraph1,
            url: pageUrl,
            provider: providerJsonLd,
            areaServed,
            // Online carries no rate of its own — same as the individual
            // OR the couple session, per the visible page's own derived
            // note — so both real figures are offered, not one picked
            // arbitrarily.
            offers: [
              { price: pricing.individualFee, priceCurrency: currency },
              { price: pricing.coupleFee, priceCurrency: currency },
            ],
          }),
        ]
      : [];

  const bodyBlocks = Array.isArray(data?.body) ? (data.body as unknown[]) : [];
  const introFirst = bodyBlocks.slice(0, 1);
  const introRest = bodyBlocks.slice(1);
  // Override just the plain-paragraph renderer for this one spot — the
  // real portableTextComponents.tsx one renders var(--fs-body)-scale
  // article prose (its own .paragraph class), not this spread's own
  // larger --fs-body-lg display treatment. Keeping the rest of the real
  // component map (not a bespoke one) means a stray link/bold mark inside
  // these two paragraphs still renders correctly.
  const baseComponents = await getPortableTextComponents(locale);
  // getPortableTextComponents' own `block` is always the plain
  // {h2,h3,normal,blockquote} record its own source defines — the wider
  // union next-sanity's own PortableTextComponents type allows (a bare
  // component fn, a per-style record, ...) is real but never what this
  // helper actually returns, so the cast below reflects the real runtime
  // shape rather than fighting the union.
  const baseBlock = baseComponents.block as Record<string, PortableTextComponents["block"]>;
  const introComponents: PortableTextComponents = {
    ...baseComponents,
    block: {
      ...baseBlock,
      normal: ({ children }) => <p className={styles.prose}>{children}</p>,
    } as PortableTextComponents["block"],
  };

  const services = data?.services;
  const darkBand = data?.darkBand;
  const darkBandBlocks = darkBand
    ? [
        { column: 1 as const, key: "c1b1", heading: darkBand.column1?.block1Heading, body: darkBand.column1?.block1Body },
        { column: 1 as const, key: "c1b2", heading: darkBand.column1?.block2Heading, body: darkBand.column1?.block2Body },
        { column: 2 as const, key: "c2b1", heading: darkBand.column2?.block1Heading, body: darkBand.column2?.block1Body },
        { column: 2 as const, key: "c2b2", heading: darkBand.column2?.block2Heading, body: darkBand.column2?.block2Body },
      ]
    : [];

  const contactSection = contactCopy?.contactSection;
  const photoAlt = typedLocale === "en" ? "Giuseppe Iannone, portrait." : "Giuseppe Iannone, ritratto.";

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      {serviceJsonLdList.map((serviceJsonLd, index) => (
        <JsonLdScript key={index} data={serviceJsonLd} />
      ))}
      <main className={styles.page}>
        {/* data-light-hero — see this pass's own report for the
            measurement behind keeping it: the real site's header, unlike
            design-lab's own preview, resolves --color-bg from the real
            dark :root[data-theme="dark"] by default, so this marker is
            what keeps it in its light-glass (not dark-on-dark-invisible)
            state over this page's own light-island top. */}
        <header className={styles.header} data-light-hero>
          <p className={styles.kicker}>
            <SectionKicker>{t("kicker")}</SectionKicker>
          </p>
          <h1 className={styles.title}>{data?.title}</h1>
        </header>

        <div className={styles.spread}>
          <div className={styles.proseCol}>
            {introFirst.length > 0 ? (
              <PortableText value={introFirst as never} components={introComponents} />
            ) : null}

            <div className={styles.figures}>
              <div className={styles.figure}>
                <p className={styles.figureNumber}>{fees.individualFee}</p>
                <p className={styles.figureCaption}>
                  {services?.individual?.title}, {fees.individualDuration}
                </p>
              </div>
              <div className={styles.figure}>
                <p className={styles.figureNumber}>{fees.coupleFee}</p>
                <p className={styles.figureCaption}>
                  {services?.couple?.title}, {fees.coupleDuration}
                </p>
              </div>
            </div>

            {introRest.length > 0 ? (
              <PortableText value={introRest as never} components={introComponents} />
            ) : null}
          </div>

          <aside className={styles.factsCard} aria-label={t("atAGlance")}>
            <p className={styles.factsCardKicker}>{t("atAGlance")}</p>
            <dl className={styles.factsList}>
              {(data?.facts ?? []).map((fact) => (
                <div key={fact.label} className={styles.factsItem}>
                  <dt className={styles.factsLabel}>{fact.label}</dt>
                  <dd className={styles.factsValue}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <section className={styles.services} aria-label={t("servicesLabel")}>
          {/* Revision 3 — this section had no heading at all before. Kicker
              reuses the existing PricePage.servicesLabel translation
              (already lived in messages/it.json/en.json as this section's
              aria-label, "Servizi"/"Services") rather than adding a new
              Sanity field for a short, repeatable label — see this pass's
              own report. The heading itself is real editorial copy
              (servicesHeading), so it's Sanity-sourced like everything
              else on this page. */}
          <p className={styles.servicesKicker}>
            <SectionKicker>{t("servicesLabel")}</SectionKicker>
          </p>
          <h2 className={styles.servicesHeading}>{data?.servicesHeading}</h2>
          {data?.servicesIntro ? <p className={styles.servicesIntro}>{data.servicesIntro}</p> : null}

          <div className={styles.servicesGrid}>
            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services?.individual?.title}</h2>
              <p className={styles.serviceDerivedNote}>{fees.individualDuration}</p>
              <p className={styles.serviceParagraph}>{services?.individual?.paragraph1}</p>
              {renderServiceLinks(services?.individual, typedLocale, styles.serviceParagraph!)}
            </article>

            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services?.couple?.title}</h2>
              <p className={styles.serviceDerivedNote}>{fees.coupleDuration}</p>
              <p className={styles.serviceParagraph}>{services?.couple?.paragraph1}</p>
              {renderServiceLinks(services?.couple, typedLocale, styles.serviceParagraph!)}
            </article>

            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services?.sexology?.title}</h2>
              {services?.sexology?.derivedNote ? (
                <p className={styles.serviceDerivedNote}>
                  {fees.individualDuration} — {services.sexology.derivedNote}
                </p>
              ) : null}
              <p className={styles.serviceParagraph}>{services?.sexology?.paragraph1}</p>
              {renderServiceLinks(services?.sexology, typedLocale, styles.serviceParagraph!)}
            </article>

            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services?.online?.title}</h2>
              {services?.online?.derivedNote ? (
                <p className={styles.serviceDerivedNote}>
                  {fees.individualDuration} / {fees.coupleDuration} — {services.online.derivedNote}
                </p>
              ) : null}
              <p className={styles.serviceParagraph}>{services?.online?.paragraph1}</p>
              {renderServiceLinks(services?.online, typedLocale, styles.serviceParagraph!)}
            </article>
          </div>
        </section>

        {darkBand ? (
          // themeDark on this OUTER wrapper, not on .darkBand itself — the
          // same reason as before this pass (see CLAUDE.md's own
          // light-island entry): .page (an ancestor) is light-island-
          // surface, which reassigns --color-bg/--color-text/etc for its
          // entire subtree, regardless of :root already carrying
          // data-theme="dark". Still needed after switching the ground
          // from rich-dark-surface/tone-deep-foreground to
          // tone.tone-base-surface this pass — tone-base-surface's own
          // tokens (--tone-base-bg etc.) are themselves just aliases of
          // --color-bg/--color-text, so they inherit the same poisoning
          // without this wrapper. No data-tone="deep" marker anymore —
          // that was ShimmerText's own override for the OLD rich-dark-
          // surface hijack (--color-accent repurposed as a background
          // gradient there); tone-base-surface doesn't hijack --color-
          // accent that way, so ShimmerText's existing plain `.themeDark`
          // branch (--shimmer-highlight: var(--color-accent-hover)) is
          // already correct here with no new override needed — verified
          // live, not assumed, see this pass's own report.
          <div className="themeDark">
          <section className={styles.darkBand} aria-label={darkBand.kicker} data-sheen="upper-left">
            <div className={styles.darkBandInner}>
              {/* Card — built the same way as the homepage's Welcome/
                  Benvenuto block (WelcomeBlock.tsx/welcome.module.scss):
                  a raised surface (--color-sand-deep) on the flat ground,
                  ivory heading (--color-text) and muted-ivory body
                  (--color-text-muted), border-radius: var(--radius-l),
                  box-shadow: var(--shadow-soft) — same tokens, not
                  approximated. See this pass's own report for the
                  measured values. */}
              <div className={styles.darkBandCard}>
                <p className={styles.darkBandKicker}>
                  <SectionKicker>{darkBand.kicker}</SectionKicker>
                </p>
                <h2 className={styles.darkBandHeading}>{darkBand.heading}</h2>
                <div className={styles.darkBandColumns}>
                  <div className={styles.darkBandColumn}>
                    {darkBandBlocks
                      .filter((b) => b.column === 1)
                      .map((block) => (
                        <div key={block.key} className={styles.darkBandBlock}>
                          <h3 className={styles.darkBandBlockHeading}>{block.heading}</h3>
                          <p className={styles.darkBandBlockBody}>
                            {renderBlockBody(block.body, darkBand.emphasisWord)}
                          </p>
                        </div>
                      ))}
                  </div>
                  <div className={styles.darkBandColumn}>
                    {darkBandBlocks
                      .filter((b) => b.column === 2)
                      .map((block) => (
                        <div key={block.key} className={styles.darkBandBlock}>
                          <h3 className={styles.darkBandBlockHeading}>{block.heading}</h3>
                          <p className={styles.darkBandBlockBody}>
                            {renderBlockBody(block.body, darkBand.emphasisWord)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>
        ) : null}

        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={typedLocale}
          photoUrl={CONTACT_PHOTO_URL}
          photoAlt={photoAlt}
        />
      </main>
    </>
  );
}
