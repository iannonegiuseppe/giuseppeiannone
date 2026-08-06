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
    // Chi sono opening pass (pass 1 of 4) — hero rebuild. Portrait moves
    // from a full-bleed background (PillarHero, the old top of this page)
    // to a contained side-by-side layout (PortraitHero) — see that
    // component's own file for why a new one was needed. kicker/title/
    // titleEmphasisWord above are unchanged and still feed the new hero
    // directly; these two are additive.
    textField("heroStandfirst", "Hero — standfirst (one line)", { rows: 2 }),
    stringField("heroLocations", "Hero — locations line (e.g. \"Milano, Monza, Cernusco sul Naviglio\")"),
    // "Di cosa mi occupo" — heading/intro/closing sit in the container;
    // the area mosaic between them is NOT authored here, it's derived
    // live from pillarPage documents (title/slug/heroImage/subtopic
    // count) so a new area appears automatically — see AreaMosaic.tsx.
    defineField({
      name: "whatIWorkWith",
      title: '"Di cosa mi occupo" section',
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        defineField({
          name: "intro",
          title: "Intro paragraphs",
          description: "Short first-person paragraphs, rendered in order before the area mosaic.",
          type: "array",
          of: [{ type: "text", rows: 3, validation: (Rule) => Rule.required().custom(deontologyCheck) }],
          validation: (Rule) => Rule.min(1),
        }),
        stringField(
          "closingLine",
          "Closing line (italic, personal voice — the page's first shift from factual to personal)",
        ),
      ],
    }),
    // "Come lavoro" — kicker/heading/intro plus numbered parts. Each
    // part's own chapter number is presentational (array position),
    // not a stored field. A part with no real answer yet (e.g. "Fra un
    // incontro e l'altro", still bracketed in the draft as of this pass)
    // is simply left out of the array — never rendered as an empty part.
    defineField({
      name: "howIWork",
      title: '"Come lavoro" section',
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("intro", "Intro", { rows: 2 }),
        defineField({
          name: "parts",
          title: "Parts",
          type: "array",
          of: [
            {
              type: "object",
              name: "howIWorkPart",
              fields: [
                stringField("title", "Part title"),
                defineField({
                  name: "body",
                  title: "Part body (paragraphs)",
                  type: "array",
                  of: [{ type: "text", rows: 3, validation: (Rule) => Rule.required().custom(deontologyCheck) }],
                  validation: (Rule) => Rule.min(1),
                }),
              ],
              preview: {
                select: { title: "title" },
              },
            },
          ],
          validation: (Rule) => Rule.min(1),
        }),
      ],
    }),
    // Chi sono timeline pass (pass 2 of 4) — the page's one dark section.
    // Eight entries; year is OPTIONAL and deliberately empty on 6 of the
    // 8 (only Siena 2001 and the 2016 Albo/registration date are known
    // today — see this pass's own report). pullQuote/image are both
    // optional per entry — image especially: none supplied yet for any
    // entry, so every entry in this rollout has an empty image, and the
    // template must not leave a gap when that's true (see
    // TimelineSection.tsx's own conditional render).
    defineField({
      name: "timeline",
      title: "Timeline",
      type: "array",
      of: [
        {
          type: "object",
          name: "timelineEntry",
          fields: [
            stringField("place", "Place"),
            stringField(
              "year",
              "Year (optional — leave empty until confirmed; the rail shows the place alone when empty)",
              { required: false },
            ),
            stringField("kicker", "Kicker"),
            stringField("title", "Title"),
            defineField({
              name: "body",
              title: "Body paragraphs",
              type: "array",
              of: [{ type: "text", rows: 3, validation: (Rule) => Rule.required().custom(deontologyCheck) }],
              validation: (Rule) => Rule.min(1),
            }),
            textField("pullQuote", "Pull quote (optional, EB Garamond italic)", { rows: 3, required: false }),
            defineField({
              name: "image",
              title: "Image (optional)",
              type: "image",
              options: { hotspot: true },
              fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
            }),
          ],
          preview: {
            select: { title: "title", place: "place", year: "year" },
            prepare({ title, place, year }: { title?: string; place?: string; year?: string }) {
              return {
                title: title ?? "",
                subtitle: year ? `${year} — ${place ?? ""}` : (place ?? ""),
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    // --- Fields below are unchanged by the opening pass. `paragraphs` in
    // particular stays exactly as it is: the article footer's author bio
    // (buildAuthorBio, blog/[slug]/page.tsx) reads it through its own
    // independent query (chiSonoPortraitQuery) — nothing here deletes,
    // renames, or repurposes it, so that stays working unmodified.
    // `pullQuote` is reserved for a later pass (the page's own dedicated
    // quote section, not the same thing as whatIWorkWith.closingLine
    // above, which is new content specific to that section). ---
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
