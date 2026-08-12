import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Metodo build pass — methodPage grows out of defineSimplePageType (title +
// body + seo only, simplePage.ts) into its own full defineType, the same
// call this codebase already made for pricePage.ts and contactPage.ts (see
// either file's own comment: the generic factory has no extension point for
// extra fields). Seven fixed sections, each a flat object of short
// labels/headings plus prose paragraphs — not portable text, since this is
// structured UI copy with a fixed shape (a hero, a two-column split, three
// phase columns, etc.), not free-form article content.
//
// Deontology: applied via reqProse below to every substantial prose field
// (leads, paragraphs, epigraph, quotes) — NOT to kickers/labels/headings,
// which are short enough that the check has nothing meaningful to catch.
// Note, correcting the brief that asked to match pricePage.ts: pricePage.ts
// does NOT use deontologyCheck at all (verified directly, not assumed) — the
// real precedent followed here is faqPage.ts, which does
// (`Rule.required().custom(deontologyCheck)` on its own prose fields).

function reqString(name: string, title: string) {
  return defineField({ name, title, type: "string", validation: (Rule) => Rule.required() });
}

function reqProse(name: string, title: string, rows = 3) {
  return defineField({
    name,
    title,
    type: "text",
    rows,
    validation: (Rule) => Rule.required().custom(deontologyCheck),
  });
}

// Section 3 ("The path") — three phase columns, same shape.
const pathPhaseFields = [
  reqString("label", "Eyebrow label"),
  reqString("heading", "Heading (h3)"),
  reqProse("p1", "Paragraph 1"),
  reqProse("p2", "Paragraph 2"),
];

// Section 6 ("Fit and ending") — two stacked bands, same shape.
const fitEndingBandFields = [
  reqString("heading", "Heading (h2)"),
  reqProse("p1", "Paragraph 1"),
  reqProse("p2", "Paragraph 2"),
];

// Section 7 ("Practical and closing") — three columns, same shape.
const practicalColumnFields = [
  reqString("heading", "Heading (h3)"),
  reqProse("p", "Body"),
];

export const methodPage = defineType({
  name: "methodPage",
  title: "Method page",
  type: "document",
  fields: [
    // --- Section 1: hero (light island, centred) ---------------------------
    reqString("kicker", "1. Hero — kicker"),
    defineField({
      name: "title",
      title: "1. Hero — title (h1)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleEmphasisWord",
      title:
        "1. Hero — title, emphasized phrase (must match text from the title above exactly, case-sensitive; renders in the site's animated accent treatment)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    reqProse("lead", "1. Hero — lead paragraph", 2),

    // --- Section 2: the split (dark left / surface right, 50/50) -----------
    defineField({
      name: "split",
      title: "2. The split",
      description: "Two halves, no gap, no rule between them. Left = the past (dark ground). Right = what is ahead (surface step).",
      type: "object",
      fields: [
        defineField({
          name: "left",
          title: "Left half — the past",
          type: "object",
          fields: [reqString("label", "Eyebrow label"), reqString("heading", "Heading (h2)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2"), reqProse("p3", "Paragraph 3")],
        }),
        defineField({
          name: "right",
          title: "Right half — what is ahead",
          type: "object",
          fields: [reqString("label", "Eyebrow label"), reqString("heading", "Heading (h2)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2"), reqProse("p3", "Paragraph 3")],
        }),
      ],
    }),

    // --- Section 3: the path (light) ----------------------------------------
    defineField({
      name: "path",
      title: "3. The path",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqString("heading", "Heading (h2)"),
        defineField({ name: "phaseOne", title: "Column 1 — phase one (accented top border)", type: "object", fields: pathPhaseFields }),
        defineField({ name: "phaseTwo", title: "Column 2 — phase two", type: "object", fields: pathPhaseFields }),
        defineField({ name: "phaseThree", title: "Column 3 — phase three", type: "object", fields: pathPhaseFields }),
        defineField({
          name: "diary",
          title: "Below the rule — left column (the diary)",
          type: "object",
          fields: [
            reqString("heading", "Heading (h3)"),
            reqProse("p", "Body"),
            reqProse("quote", "Quote (rendered in a white card, italic)"),
          ],
        }),
        defineField({
          name: "experiments",
          title: "Below the rule — right column (small experiments)",
          type: "object",
          fields: [
            reqString("heading", "Heading (h3)"),
            reqProse("p1", "Paragraph 1"),
            reqString(
              "rhythmLeadIn",
              'Rhythm paragraph — lead-in phrase (must match the start of rhythmBody exactly, case-sensitive; e.g. "Il ritmo." / "The rhythm." — renders semibold, the rest of the paragraph stays regular)',
            ),
            reqProse("rhythmBody", "Rhythm paragraph — full text, including the lead-in phrase above verbatim at the start"),
          ],
        }),
      ],
    }),

    // --- Section 4: the relationship (dark, single 720px column) -----------
    defineField({
      name: "relationship",
      title: "4. The relationship",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqProse("epigraph", "Epigraph (large italic)", 2),
        reqProse("p1", "Paragraph 1"),
        reqProse("p2", "Paragraph 2"),
        reqProse("p3", "Paragraph 3", 4),
      ],
    }),

    // --- Section 5: the approach (light, asymmetric offset) ----------------
    defineField({
      name: "approach",
      title: "5. The approach",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqString("heading", "Large heading"),
        defineField({
          name: "headingEmphasisWord",
          title: "Large heading — emphasized phrase (must match text from the heading above exactly, case-sensitive)",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        reqProse("p1", "Paragraph 1"),
        reqProse("p2", "Paragraph 2"),
        defineField({
          name: "offset",
          title: "Offset block (right-aligned, left hairline border) — \"What I ask of you\"",
          type: "object",
          fields: [reqString("heading", "Heading (h3)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
      ],
    }),

    // --- Section 6: fit and ending (surface, two stacked bands) ------------
    defineField({
      name: "fitEnding",
      title: "6. Fit and ending",
      type: "object",
      fields: [
        defineField({ name: "band1", title: "Band 1 — if the fit is wrong", type: "object", fields: fitEndingBandFields }),
        defineField({ name: "band2", title: "Band 2 — how it ends", type: "object", fields: fitEndingBandFields }),
      ],
    }),

    // --- Section 7: practical and closing (light) ---------------------------
    defineField({
      name: "practical",
      title: "7. Practical and closing",
      type: "object",
      fields: [
        defineField({ name: "col1", title: "Column 1 — online and in person", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col2", title: "Column 2 — alongside your doctor", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col3", title: "Column 3 — what stays in the room", type: "object", fields: practicalColumnFields }),
        reqProse("closingQuote", "Closing quote (large italic serif)", 2),
      ],
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
});
