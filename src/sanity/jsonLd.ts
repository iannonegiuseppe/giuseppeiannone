import type { BreadcrumbItem } from "./breadcrumbs";
import type { AuthorFields, SocialLinks } from "./seo";

// Person for the practitioner. jobTitle (free text) carries the
// professional title ("Psicologa Psicoterapeuta") rather than
// medicalSpecialty: that property is constrained to schema.org's
// MedicalSpecialty enum, which doesn't have a clean, accurate entry for
// a psychologist-psychotherapist (the closest, "Psychiatric", would
// misrepresent a distinct professional category) — omitting it is more
// correct than forcing an inaccurate enum value.
// telephone/email: added alongside the pre-existing identifier/sameAs —
// the practitioner personally answers these channels (not a front desk),
// so they're real on the Person node, not just the business one below.
// Values come
// from siteSettings.contactChannels (the same single source every wa.me/
// tel/mailto link in the app already builds from — see
// src/sanity/contact.ts), not re-typed here. telephone uses the raw
// digits form (matches the tel: href value, not the spaced display
// label) since this is machine-readable data, not on-page text.
export function buildPersonJsonLd({
  author,
  siteUrl,
  socialLinks,
  telephone,
  email,
}: {
  author: AuthorFields;
  siteUrl: string;
  socialLinks?: SocialLinks;
  telephone?: string;
  email?: string;
}) {
  const sameAs = [
    socialLinks?.instagram,
    socialLinks?.linkedin,
    socialLinks?.facebook,
  ].filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.credentials,
    url: siteUrl,
    telephone,
    email,
    identifier: author.registrationNumber
      ? {
          "@type": "PropertyValue",
          propertyID: "Albo degli Psicologi",
          value: author.registrationNumber,
        }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

interface LocationFields {
  title: string;
  address?: string;
}

// location.address is plain text (Text is a valid schema.org value for
// Place.address) rather than a structured PostalAddress: locationPage
// only collects a single free-text address field, and parsing it into
// street/locality/region/postalCode would risk fabricating structure
// that isn't actually there.
//
// telephone/email/vatID: business-wide (not per-location — there's one
// phone/email/P.IVA for the whole practice, not one per address), same
// source values as buildPersonJsonLd's own telephone/email above. vatID
// only makes sense here, not on Person — schema.org defines it on
// Organization/LocalBusiness, not Person.
export function buildMedicalBusinessJsonLd({
  name,
  siteUrl,
  locations,
  telephone,
  email,
  vatID,
}: {
  name: string;
  siteUrl: string;
  locations: LocationFields[];
  telephone?: string;
  email?: string;
  vatID?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name,
    url: siteUrl,
    telephone,
    email,
    vatID,
    location: locations.map((location) => ({
      "@type": "Place",
      name: location.title,
      address: location.address,
    })),
  };
}

export function buildBreadcrumbListJsonLd(
  items: BreadcrumbItem[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export type MedicalEntityType = "condition" | "therapy" | "none";

// "about" only gets a MedicalCondition/MedicalTherapy sub-type — with
// just @type + name, nothing else — when the document is explicitly
// tagged via medicalEntityType. No medical codes (ICD-10 etc.) are ever
// included: we don't have that data, and inventing it would be a real
// accuracy risk on a YMYL site.
export function buildMedicalWebPageJsonLd({
  url,
  name,
  description,
  medicalEntityType,
}: {
  url: string;
  name: string;
  description?: string;
  medicalEntityType?: MedicalEntityType;
}) {
  const about =
    medicalEntityType === "condition"
      ? { "@type": "MedicalCondition", name }
      : medicalEntityType === "therapy"
        ? { "@type": "MedicalTherapy", name }
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    url,
    name,
    description,
    about,
  };
}

interface FaqEntry {
  question: string;
  // Portable Text answer, already rendered to plain text for the
  // structured-data copy (see plainTextFromPortableText in this file).
  answerText: string;
}

// Secondary machine-readability signal only: Google no longer shows FAQ
// rich results as of 2023. The visible, rendered Q&A HTML on the page is
// the primary AEO/GEO mechanism (what answer engines actually read) —
// this markup doesn't replace that, it just doesn't hurt to include it.
export function buildFaqPageJsonLd(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answerText,
      },
    })),
  };
}

// Portable Text -> plain text, for structured data only (FAQPage answers).
// Deliberately minimal: only handles the block/span shapes our restricted
// faqAnswer schema actually allows (see schemaTypes/objects/faqAnswer.ts).
export function plainTextFromPortableText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (
        typeof block !== "object" ||
        block === null ||
        !("children" in block) ||
        !Array.isArray((block as { children?: unknown }).children)
      ) {
        return "";
      }

      return (block as { children: { text?: string }[] }).children
        .map((span) => span.text ?? "")
        .join("");
    })
    .filter(Boolean)
    .join(" ");
}

// Finds faqBlock entries within a rendered Portable Text body (already
// expanded via the bodyProjection in queries.ts, so `question`/`answer`
// are real values, not bare references) and converts them into the shape
// buildFaqPageJsonLd expects.
export function extractFaqEntries(body: unknown): FaqEntry[] {
  if (!Array.isArray(body)) return [];

  const entries: FaqEntry[] = [];

  for (const block of body) {
    if (
      typeof block !== "object" ||
      block === null ||
      (block as { _type?: string })._type !== "faqBlock"
    ) {
      continue;
    }

    const items =
      (block as { items?: { question: string; answer: unknown }[] }).items ??
      [];

    for (const item of items) {
      entries.push({
        question: item.question,
        answerText: plainTextFromPortableText(item.answer),
      });
    }
  }

  return entries;
}
