import { PortableText, type PortableTextComponents } from "next-sanity";
import { urlFor } from "./image";

interface ReferencedDoc {
  _id: string;
  _type: string;
  title?: string;
  slug?: string;
  parentSlug?: string | null;
}

function hrefFor(locale: string, doc: ReferencedDoc): string {
  const prefix = locale === "it" ? "" : `/${locale}`;

  if (doc._type === "pillarPage" && doc.slug) {
    return `${prefix}/${doc.slug}`;
  }
  if (doc._type === "subtopicPage" && doc.slug && doc.parentSlug) {
    return `${prefix}/${doc.parentSlug}/${doc.slug}`;
  }

  return prefix || "/";
}

// Minimal, unstyled renderers proving every custom block type in the
// restricted Portable Text schema renders server-side. Styling comes in
// a later stage.
//
// headingIds maps a block's _key to the anchor id computed by
// extractHeadings (headings.ts) — the same map used to build the visible
// TableOfContents, so a jump-link can never point at an id that doesn't
// exist on the rendered h2/h3.
export function getPortableTextComponents(
  locale: string,
  headingIds?: Map<string, string>,
): PortableTextComponents {
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
    },
    marks: {
      link: ({ value, children }) => {
        const href = (value?.href as string | undefined) ?? "#";
        const isExternal = /^https?:\/\//.test(href);
        const rel = isExternal
          ? ["noopener", value?.nofollow ? "nofollow" : null]
              .filter(Boolean)
              .join(" ")
          : undefined;

        return (
          <a href={href} target={isExternal ? "_blank" : undefined} rel={rel}>
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }) => (
        // Plain <img>, not next/image: this stage is deliberately
        // unstyled/unoptimized plumbing verification (Step 9); image
        // optimization is a later-stage concern.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlFor(value).width(800).url()} alt={value.alt ?? ""} />
      ),
      keyTakeaways: ({ value }) => (
        <ul>
          {(value.items as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ),
      faqBlock: ({ value }) => (
        <dl>
          {(value.items as { _id: string; question: string; answer: unknown }[]).map(
            (item) => (
              <div key={item._id}>
                <dt>{item.question}</dt>
                <dd>
                  <PortableText value={item.answer as never} />
                </dd>
              </div>
            ),
          )}
        </dl>
      ),
      relatedTopics: ({ value }) => (
        <ul>
          {(value.items as ReferencedDoc[]).map((doc) => (
            <li key={doc._id}>
              <a href={hrefFor(locale, doc)}>{doc.title}</a>
            </li>
          ))}
        </ul>
      ),
      ctaBlock: ({ value }) => (
        <div>
          <p>{value.heading as string}</p>
          {value.body ? <p>{value.body as string}</p> : null}
          <a href={value.buttonHref as string}>{value.buttonLabel as string}</a>
        </div>
      ),
      conditionCard: ({ value }) => {
        const link = value.link as ReferencedDoc | undefined;
        return (
          <div>
            <p>{value.title as string}</p>
            <p>{value.description as string}</p>
            {link ? <a href={hrefFor(locale, link)}>{link.title}</a> : null}
          </div>
        );
      },
      treatmentCard: ({ value }) => {
        const link = value.link as ReferencedDoc | undefined;
        return (
          <div>
            <p>{value.title as string}</p>
            <p>{value.description as string}</p>
            {link ? <a href={hrefFor(locale, link)}>{link.title}</a> : null}
          </div>
        );
      },
    },
  };
}
