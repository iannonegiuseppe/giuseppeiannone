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
    // Chi sono full rebuild pass — glass card overlapping the hero/section
    // boundary (block 2). Four facts, stacked; text color splits at the
    // boundary (handled entirely in the component, not stored here) — the
    // first two facts render on the dark half, the last two on the light
    // half, matching "roughly half over the dark image, half over the
    // light surface" per the brief. An array of {label, value} rather than
    // four named fields: same shape either way today, but an array lets
    // the count change later without a schema migration.
    defineField({
      name: "glassCard",
      title: "Glass card (hero/section overlap)",
      type: "object",
      fields: [
        defineField({
          name: "facts",
          title: "Facts (exactly 4 — first 2 render on the dark half, last 2 on the light half)",
          type: "array",
          of: [
            {
              type: "object",
              name: "glassCardFact",
              fields: [
                stringField("label", "Label (small caps, gold)"),
                stringField("value", "Value"),
              ],
              preview: { select: { title: "label", subtitle: "value" } },
            },
          ],
          validation: (Rule) => Rule.min(4).max(4),
        }),
      ],
    }),
    // Full rebuild pass — parallax divider (block 4), dark band between
    // "Di cosa mi occupo" and "Come lavoro". Two lines; emphasisWord uses
    // the same substring-match technique as titleEmphasisWord above (must
    // match a word in line1 exactly). markerLabel is the small gold "↓ ..."
    // line below — the arrow itself is added by the component, not stored.
    defineField({
      name: "parallaxDivider",
      title: "Parallax divider",
      type: "object",
      fields: [
        stringField("line1", "Line 1 (contains the emphasized word)"),
        stringField(
          "emphasisWord",
          "Line 1 — emphasized word (must match one word from line 1 exactly, case-sensitive)",
        ),
        stringField("line2", "Line 2"),
        stringField("markerLabel", 'Marker label (e.g. "COME LAVORO" — the "↓" is added automatically)'),
      ],
    }),
    // Chi sono timeline header — kicker/heading/description for the
    // section itself (distinct from each entry's own kicker/title
    // below). TimelineSection.tsx already accepted kicker/heading props
    // from day one but page.tsx never passed them, so the section
    // rendered with no header at all — this is what feeds it. Same
    // object shape as whatIWorkWith/howIWork above (kicker + heading +
    // one short descriptive field).
    defineField({
      name: "journey",
      title: '"Il percorso" — timeline section header',
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("description", "Description (1-2 sentences)", { rows: 2 }),
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
              description:
                "PLACEHOLDER PASS: entries currently carrying an image are using generic stock " +
                "interior photography (not real photos from this period of Giuseppe's life) so the " +
                "timeline's layout could be judged with real proportions. Each placeholder's asset " +
                "filename is prefixed \"PLACEHOLDER —\" in the media library — replace with a real " +
                "photo when one exists rather than treating the current image as final.",
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
    // Full rebuild pass — credentials/institutions band (block 6), text
    // only per art. 40 (no logos — a logo strip reads as an endorsement
    // row). Five institutions with a role caption each.
    //
    // Redesign pass — "tagline" is now the block's own heading (left
    // column, EB Garamond, up to three lines), not a trailing italic line
    // under the list. Field NOT renamed (avoids a migration for existing
    // content) — same "repurpose in place" precedent as whatIWorkWith's
    // own intro/closingLine history. taglineEmphasisWord follows the same
    // substring-match convention as bodyBlocks' own headingEmphasisWord
    // (see ChiSonoBodyBlocks.tsx's renderEmphasis, reused verbatim here).
    defineField({
      name: "credentials",
      title: "Credentials — institutions band",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("tagline", "Heading (EB Garamond, left column, up to three lines)"),
        stringField(
          "taglineEmphasisWord",
          "Heading — emphasized word (must match one word from the heading exactly; leave empty for no emphasis)",
          { required: false },
        ),
        defineField({
          name: "items",
          title: "Institutions",
          type: "array",
          of: [
            {
              type: "object",
              name: "credentialInstitution",
              fields: [
                stringField("institution", "Institution"),
                stringField("role", "Role (small, muted, beneath the institution)"),
              ],
              preview: { select: { title: "institution", subtitle: "role" } },
            },
          ],
          validation: (Rule) => Rule.min(1),
        }),
      ],
    }),
    // Full rebuild pass — the two alternating image/text blocks (block 7).
    // Replaces the standalone pull-quote section: block two's body is the
    // old pullQuoteFollowUp content, block two's quote is drawn from the
    // old pullQuote — both fields below stay untouched/orphaned (see their
    // own comment further down) rather than repurposed in place, since the
    // exact wording differs (a short quote pulled for the image scrim vs.
    // the full original pull quote).
    defineField({
      name: "bodyBlocks",
      title: "Alternating image/text blocks",
      type: "array",
      of: [
        {
          type: "object",
          name: "chiSonoBodyBlock",
          fields: [
            stringField("kicker", "Kicker"),
            stringField("heading", "Heading"),
            stringField(
              "headingEmphasisWord",
              "Heading — emphasized word (must match one word from the heading exactly; leave empty for no emphasis)",
              { required: false },
            ),
            defineField({
              name: "body",
              title: "Body paragraphs",
              type: "array",
              of: [{ type: "text", rows: 3, validation: (Rule) => Rule.required().custom(deontologyCheck) }],
              validation: (Rule) => Rule.min(1),
            }),
            textField("quote", "Pull quote over the image (EB Garamond italic, on a scrim)", { rows: 2 }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
              fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
            }),
          ],
          preview: { select: { title: "heading", subtitle: "kicker" } },
        },
      ],
      validation: (Rule) => Rule.min(2).max(2),
    }),
    // Chi sono publications pass (pass 3 of 4), restructured for the full
    // rebuild — real academic citations now (authors/title/source), grouped
    // into three sets (journal/book/conference). Group labels are rendered
    // by the page itself (locale-branched literal, same precedent as
    // ContactBlock's own replyLine) rather than stored per-item — they're
    // structural section labels, not citation content, and citation content
    // itself is deliberately NOT translated (author names/titles/journals
    // stay in their original language regardless of site locale, per the
    // source draft's own note).
    defineField({
      name: "publications",
      title: "Publications",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("title", "Title"),
        textField("note", "Note below the list (e.g. \"Two of these are freely available online.\")", {
          rows: 2,
          required: false,
        }),
        defineField({
          name: "items",
          title: "Publications",
          type: "array",
          of: [
            {
              type: "object",
              name: "publicationEntry",
              fields: [
                defineField({
                  name: "group",
                  title: "Group",
                  type: "string",
                  options: {
                    list: [
                      { title: "Peer-reviewed journal", value: "journal" },
                      { title: "Book chapter", value: "book" },
                      { title: "Conference contribution", value: "conference" },
                    ],
                  },
                  validation: (Rule) => Rule.required(),
                }),
                stringField("authors", "Authors"),
                stringField("title", "Title"),
                stringField("source", "Source (journal/book/conference, plus year)"),
                defineField({
                  name: "url",
                  title: "Source link (optional — only 2 of the 7 works have one)",
                  type: "url",
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "source" },
              },
            },
          ],
          validation: (Rule) => Rule.min(1),
        }),
      ],
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
    // Chi sono pull-quote follow-up pass (pass 3 of 4) — "La spia sul
    // cruscotto"/"The warning light". Renders directly below pullQuote
    // above, back in the light island (not the dark timeline section —
    // that stays scoped to the timeline alone).
    defineField({
      name: "pullQuoteFollowUp",
      title: "Pull quote — follow-up paragraphs",
      description: "Body paragraphs rendered directly below the pull quote above.",
      type: "array",
      of: [{ type: "text", rows: 3, validation: (Rule) => Rule.required().custom(deontologyCheck) }],
      validation: (Rule) => Rule.min(1),
    }),
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
