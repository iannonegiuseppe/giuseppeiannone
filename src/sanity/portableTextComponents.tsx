import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { Card } from "@/components/Card";
import { ButtonLink } from "@/components/Button";
import { imageDimensions, urlFor } from "./image";
import { hrefFor, type Locale, type ReferencedDoc } from "./paths";
import styles from "./portableTextComponents.module.scss";

// True for a full external URL; false for an internal path (ctaBlock's
// buttonHref and Portable Text's link mark can both be either).
function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

// headingIds maps a block's _key to the anchor id computed by
// extractHeadings (headings.ts) — the same map used to build the visible
// TableOfContents, so a jump-link can never point at an id that doesn't
// exist on the rendered h2/h3.
export async function getPortableTextComponents(
  locale: string,
  headingIds?: Map<string, string>,
): Promise<PortableTextComponents> {
  const typedLocale = locale as Locale;
  const t = await getTranslations({
    locale: typedLocale,
    namespace: "KeyTakeaways",
  });

  return {
    block: {
      h2: ({ children, value }) => (
        <h2 id={value._key ? headingIds?.get(value._key) : undefined}>
          {children}
        </h2>
      ),
      h3: ({ children, value }) => (
        <h3 id={value._key ? headingIds?.get(value._key) : undefined}>
          {children}
        </h3>
      ),
      blockquote: ({ children }) => (
        <blockquote className={styles.blockquote}>{children}</blockquote>
      ),
    },
    marks: {
      link: ({ value, children }) => {
        const href = (value?.href as string | undefined) ?? "#";
        const isExternal = isExternalHref(href);
        const rel = isExternal
          ? ["noopener", value?.nofollow ? "nofollow" : null]
              .filter(Boolean)
              .join(" ")
          : undefined;

        return (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={rel}
            className={styles.link}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }) => {
        const dims = imageDimensions(value) ?? { width: 4, height: 3 };
        return (
          <Image
            src={urlFor(value).width(2000).url()}
            alt={value.alt ?? ""}
            width={dims.width}
            height={dims.height}
            sizes="(min-width: 64rem) 40rem, 100vw"
            className={styles.image}
          />
        );
      },
      keyTakeaways: ({ value }) => (
        <div className={styles.keyTakeaways}>
          <p className={styles.keyTakeawaysLabel}>{t("label")}</p>
          <ul className={styles.keyTakeawaysList}>
            {(value.items as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ),
      faqBlock: ({ value }) => (
        <div className={styles.faqBlock}>
          {(
            value.items as { _id: string; question: string; answer: unknown }[]
          ).map((item) => (
            <details key={item._id} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                <span>{item.question}</span>
                <span className={styles.faqIcon} aria-hidden="true" />
              </summary>
              <div className={styles.faqAnswer}>
                <PortableText value={item.answer as never} />
              </div>
            </details>
          ))}
        </div>
      ),
      relatedTopics: ({ value }) => (
        <ul className={styles.cardGrid}>
          {(value.items as ReferencedDoc[]).map((doc) => (
            <li key={doc._id}>
              <Card title={doc.title ?? ""} href={hrefFor(typedLocale, doc)} />
            </li>
          ))}
        </ul>
      ),
      ctaBlock: ({ value }) => (
        <div className={styles.ctaBlock}>
          <p className={styles.ctaHeading}>{value.heading as string}</p>
          {value.body ? (
            <p className={styles.ctaBody}>{value.body as string}</p>
          ) : null}
          <ButtonLink
            href={value.buttonHref as string}
            variant="solid"
            target={isExternalHref(value.buttonHref as string) ? "_blank" : undefined}
            rel={isExternalHref(value.buttonHref as string) ? "noopener" : undefined}
          >
            {value.buttonLabel as string}
          </ButtonLink>
        </div>
      ),
      conditionCard: ({ value }) => {
        const link = value.link as ReferencedDoc | undefined;
        return (
          <div className={styles.standaloneCard}>
            <Card
              title={value.title as string}
              description={value.description as string}
              href={link ? hrefFor(typedLocale, link) : "#"}
            />
          </div>
        );
      },
      treatmentCard: ({ value }) => {
        const link = value.link as ReferencedDoc | undefined;
        return (
          <div className={styles.standaloneCard}>
            <Card
              title={value.title as string}
              description={value.description as string}
              href={link ? hrefFor(typedLocale, link) : "#"}
            />
          </div>
        );
      },
    },
  };
}
