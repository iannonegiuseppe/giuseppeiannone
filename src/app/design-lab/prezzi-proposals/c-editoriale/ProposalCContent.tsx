import type { ReactNode } from "react";
import Link from "next/link";
import { ContactBlock } from "@/components/ContactBlock";
import { Header } from "@/components/Header";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import { pillarPath } from "@/sanity/paths";
import { ProposalBanner } from "../ProposalBanner";
import { getPrezziProposalData, pricingOrPlaceholder } from "../shared";
import {
  BANNER,
  DARK_BAND,
  FACTS,
  HEADER,
  INTRO_PARAGRAPHS,
  PILLAR_LINKS,
  SERVICES_COPY,
  SERVICES_INTRO,
  type ProposalLocale,
} from "./content";
import styles from "./page.module.scss";

// Renders a service's link-bearing sentence, splicing real pillar-page
// links (Link + pillarPath, real slugs fetched from Sanity — see this
// pass's own report) between plain placeholder text. Comma-joined with
// "e"/"and" before the last item, matching normal prose punctuation
// rather than a bare list.
function renderServiceLinks(
  prefix: string,
  linkKeys: readonly (keyof typeof PILLAR_LINKS)[],
  suffix: string,
  locale: ProposalLocale,
): ReactNode {
  const joiner = locale === "en" ? "and" : "e";
  return (
    <p className={styles.serviceParagraph}>
      {prefix}{" "}
      {linkKeys.map((key, index) => {
        const target = PILLAR_LINKS[key][locale];
        const isLast = index === linkKeys.length - 1;
        const isFirst = index === 0;
        return (
          <span key={key}>
            {!isFirst && isLast ? ` ${joiner} ` : !isFirst ? ", " : ""}
            <Link href={pillarPath(locale, target.slug)} className={styles.serviceLink}>
              {target.label}
            </Link>
          </span>
        );
      })}
      {suffix}
    </p>
  );
}

export async function ProposalCContent({ locale }: { locale: ProposalLocale }) {
  const { siteSettings, contactCopy } = await getPrezziProposalData(locale);
  const fees = pricingOrPlaceholder(siteSettings?.pricing, locale);
  const contactSection = contactCopy?.contactSection;

  const header = HEADER[locale];
  const introParagraphs = INTRO_PARAGRAPHS[locale];
  const facts = FACTS[locale];
  const services = SERVICES_COPY[locale];
  const darkBand = DARK_BAND[locale];
  const banner = BANNER[locale];

  const photoAlt = locale === "en" ? "Giuseppe Iannone, portrait." : "Giuseppe Iannone, ritratto.";

  return (
    <>
      {/* Layout fix 1 — the real, production Header/HeaderInteractive, not
          a design-lab stand-in. Safe here: confirmed Header.tsx and its
          whole render tree (HeaderInteractive, LocaleSwitcher,
          HeaderNavItemWithSubmenu, MobileMenuOverlay, ChannelPickerDialog,
          Logo) have zero next-intl dependency — nav items/CTA label come
          from Sanity (headerSettings), not a translation catalog, and
          LocaleSwitcher uses plain next/navigation's usePathname, not an
          i18n-routing-aware wrapper — so it renders correctly outside the
          [locale] tree design-lab otherwise has no access to. One known,
          reported limitation: LocaleSwitcher can't find a real reciprocal
          URL for a route this deep (no <link rel="alternate"> emitted
          here), so it falls back to the real site's own home page for the
          other locale rather than looping to this route's own /en mirror
          — safe (never broken/dead), just not exact. */}
      <Header locale={locale} contactChannels={siteSettings?.contactChannels} />
      <ProposalBanner label={banner.label} weak={banner.weak} hasRealHeader />
      <main className={styles.page}>
        {/* data-light-hero — same marker LightPortraitHero.tsx uses on
            /faq and /blog: HeaderInteractive.module.scss's own
            `body:has([data-light-hero])` rule gives the header its dark
            62%-opacity glass treatment from first paint, exactly the
            "dark header over a light top" mechanism this page needs (this
            section, like every section above the dark band, is a light
            island) — reused, not reinvented. */}
        <header className={styles.header} data-light-hero>
          <p className={styles.kicker}>
            <SectionKicker>{header.kicker}</SectionKicker>
          </p>
          <h1 className={styles.title}>{header.title}</h1>
        </header>

        {/* Unchanged from before this pass — same markup, same classes. */}
        <div className={styles.spread}>
          <div className={styles.proseCol}>
            <p className={styles.prose}>{introParagraphs[0]}</p>

            <div className={styles.figures}>
              <div className={styles.figure}>
                <p className={styles.figureNumber}>{fees.individualFee}</p>
                <p className={styles.figureCaption}>
                  {services.individual.title}, {fees.individualDuration}
                </p>
              </div>
              <div className={styles.figure}>
                <p className={styles.figureNumber}>{fees.coupleFee}</p>
                <p className={styles.figureCaption}>
                  {services.couple.title}, {fees.coupleDuration}
                </p>
              </div>
            </div>

            <p className={styles.prose}>{introParagraphs[1]}</p>
          </div>

          <aside className={styles.factsCard} aria-label={locale === "en" ? "At a glance" : "In sintesi"}>
            <p className={styles.factsCardKicker}>{locale === "en" ? "At a glance" : "In sintesi"}</p>
            <dl className={styles.factsList}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.factsItem}>
                  <dt className={styles.factsLabel}>{fact.label}</dt>
                  <dd className={styles.factsValue}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* ADD 1 — four service blocks. Individual/couple carry the same
            pull-figure treatment as the spread above (real, primary rates);
            sexology/online carry a smaller derived-value line instead of a
            second pull-figure, since neither has its own rate — both are
            computed from the individual/couple figures already fetched,
            never a new literal (see this pass's own report). */}
        <section className={styles.services} aria-label={locale === "en" ? "Services" : "Servizi"}>
          <p className={styles.servicesIntro}>{SERVICES_INTRO[locale]}</p>

          <div className={styles.servicesGrid}>
            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services.individual.title}</h2>
              <div className={styles.serviceFigureRow}>
                <p className={styles.serviceFigureNumber}>{fees.individualFee}</p>
                <p className={styles.serviceFigureCaption}>{fees.individualDuration}</p>
              </div>
              <p className={styles.serviceParagraph}>{services.individual.paragraph1}</p>
              {renderServiceLinks(
                services.individual.linkPrefix,
                services.individual.linkKeys,
                services.individual.linkSuffix,
                locale,
              )}
            </article>

            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services.couple.title}</h2>
              <div className={styles.serviceFigureRow}>
                <p className={styles.serviceFigureNumber}>{fees.coupleFee}</p>
                <p className={styles.serviceFigureCaption}>{fees.coupleDuration}</p>
              </div>
              <p className={styles.serviceParagraph}>{services.couple.paragraph1}</p>
              {renderServiceLinks(
                services.couple.linkPrefix,
                services.couple.linkKeys,
                services.couple.linkSuffix,
                locale,
              )}
            </article>

            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services.sexology.title}</h2>
              <p className={styles.serviceDerivedNote}>
                {fees.individualFee} · {fees.individualDuration} — {services.sexology.derivedNote}
              </p>
              <p className={styles.serviceParagraph}>{services.sexology.paragraph1}</p>
              {renderServiceLinks(
                services.sexology.linkPrefix,
                services.sexology.linkKeys,
                services.sexology.linkSuffix,
                locale,
              )}
            </article>

            <article className={styles.service}>
              <h2 className={styles.serviceTitle}>{services.online.title}</h2>
              <p className={styles.serviceDerivedNote}>
                {fees.individualFee} / {fees.coupleFee} — {services.online.derivedNote}
              </p>
              <p className={styles.serviceParagraph}>{services.online.paragraph1}</p>
            </article>
          </div>
        </section>

        {/* ADD 2 — dark band, established tone-deep treatment (rich-dark-
            surface + tone-deep-foreground, both from _tone.scss, unedited).
            .themeDark is added locally because /design-lab's own layout
            never sets data-theme="dark" on <html> the way [locale]/layout.tsx
            does on the real site — without it, --tone-deep-accent and
            ShimmerText's dark branch would both resolve to this route's
            light :root default instead of the real gold values. See this
            pass's own report for the measured contrast this produces. */}
        {/* themeDark lives on this OUTER wrapper, not on .darkBand itself —
            see .darkBand's own comment: putting both the token-defining
            class and the token-consuming (tone-deep-foreground) rule on
            the SAME element creates a real circular reference
            (--color-text -> --tone-deep-text -> --color-text, both
            declared for that one element), confirmed live via
            getComputedStyle (came back "" — CSS's own guaranteed-invalid
            result for a cyclic custom property). Ancestor/descendant split
            matches how the real site's data-theme="dark" (on <html>,
            always an ancestor of any tone-deep section) relates to every
            other tone-deep consumer already in production. */}
        <div className="themeDark">
          <section className={styles.darkBand} data-tone="deep" aria-label={darkBand.kicker}>
            <div className={styles.darkBandGrain} aria-hidden="true" />
            <div className={styles.darkBandInner}>
              <p className={styles.darkBandKicker}>
                <SectionKicker>{darkBand.kicker}</SectionKicker>
              </p>
              <h2 className={styles.darkBandHeading}>{darkBand.heading}</h2>
              <div className={styles.darkBandColumns}>
                <p className={styles.darkBandParagraph}>{darkBand.column1}</p>
                <p className={styles.darkBandParagraph}>
                  {darkBand.column2.split(darkBand.emphasisPhrase)[0]}
                  <ShimmerText>{darkBand.emphasisPhrase}</ShimmerText>
                  {darkBand.column2.split(darkBand.emphasisPhrase)[1]}
                </p>
              </div>
            </div>
          </section>
        </div>

        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={locale}
          photoUrl="/design-lab/photos/09.webp"
          photoAlt={photoAlt}
        />
      </main>
    </>
  );
}
