import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Chi sono build pass: this document is now the real source for the
// full /chi-sono, /en/about-me page (src/app/[locale]/chi-sono/page.tsx,
// src/app/[locale]/about/page.tsx) — un-hidden, un-deprecated. It's ALSO
// still the source of the homepage's portrait/paragraphs used elsewhere
// (chiSonoPortraitQuery, the article route's end-of-post author block) —
// unchanged by this pass. What it is NOT: the homepage's own Chi sono
// TEASER, which reads homePage.profilo instead (a separate, shorter,
// professional-facts-only rewrite — see that field's own schema comment
// for why it's independent rather than a reuse of this document).
// Standalone singleton (owner call), not a homePage field group — same
// singletonListItem/SINGLETON_TYPES treatment as aboutPage/methodPage/
// pricePage, but with its own structured fields (title/paragraphs/
// portrait/etc.) rather than defineSimplePageType's generic
// title+body+seo shape, since this section's layout (sticky portrait,
// pull-quote, signature) needs individually addressable fields, not one
// Portable Text blob. The OLDER homePage.chiSono field group + the
// retired ChiSonoOverlap.tsx (a different, pre-existing shape) are
// superseded by this — left registered/orphaned, not deleted, same
// precedent as diploma/qualification before it.
function textField(
  name: string,
  title: string,
  options?: { rows?: number; required?: boolean },
) {
  return defineField({
    name,
    title,
    type: "text",
    rows: options?.rows ?? 2,
    validation: (Rule) => {
      const withCustom = Rule.custom(deontologyCheck);
      return options?.required === false ? withCustom : withCustom.required();
    },
  });
}

function stringField(
  name: string,
  title: string,
  options?: { required?: boolean },
) {
  return defineField({
    name,
    title,
    type: "string",
    validation: (Rule) => {
      const withCustom = Rule.custom(deontologyCheck);
      return options?.required === false ? withCustom : withCustom.required();
    },
  });
}

// Chi sono build pass: un-hidden and un-deprecated — this is now the
// live source for the full /chi-sono, /en/about-me page. homePage.profilo
// (the homepage's own shorter teaser) is untouched and stays the
// homepage's rendered source, per this pass's own explicit instruction
// not to touch it — the two coexist deliberately, see this file's own
// top comment for the overlap-avoidance approach the page component
// itself takes (only paragraphs 1-2 + a trimmed paragraph 5 render there,
// never the three paragraphs profilo already shows verbatim).
export const chiSonoSection = defineType({
  name: "chiSonoSection",
  title: "Chi sono page",
  description:
    "The full personal story (origin, training, portrait) for the /chi-sono, /en/about-me page. " +
    "Not the homepage's own shorter Chi sono teaser — see homePage.profilo for that.",
  type: "document",
  fields: [
    stringField("kicker", "Kicker"),
    stringField("title", "Title"),
    stringField(
      "titleEmphasisWord",
      "Title — emphasized word (must match one word from the title above exactly, case-sensitive; leave empty for no emphasis)",
      { required: false },
    ),
    defineField({
      name: "paragraphs",
      title: "Paragraphs",
      description: "3-5 short first-person paragraphs, rendered in order (expect 4).",
      type: "array",
      of: [
        {
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.required().custom(deontologyCheck),
        },
      ],
      validation: (Rule) => Rule.min(3).max(5),
    }),
    textField("pullQuote", "Pull quote", { rows: 3 }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "storyLink",
      title: "Story link",
      description:
        "Unused by this document itself — the homepage's own teaser (a separate section, " +
        "reading homePage.profilo) is what would show a link to this page, not a field here. " +
        "Left as-is, not repurposed.",
      type: "slug",
    }),
    defineField({
      name: "signatureEnabled",
      title: "Show signature",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
  preview: {
    select: { title: "title", subtitle: "kicker", media: "portrait" },
  },
});
