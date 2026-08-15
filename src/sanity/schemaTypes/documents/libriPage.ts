import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Libri build pass — grows out of defineSimplePageType (title + body + seo
// only, simplePage.ts) into its own full defineType, the same call this
// codebase already made for pricePage.ts and contactPage.ts (see either
// file's own comment: the generic factory has no extension point for
// extra fields). `body` is dropped entirely, same reasoning as
// contactPage.ts: every piece of copy on this page is one of the
// structured fields below, there is no free-form intro prose slot.
//
// Six NAMED chapter fields (chapter1..chapter6), not a repeatable array —
// same "fixed, known items" convention as pricePage.ts's own
// services.individual/couple/sexology/online. Deliberately not an
// editor-extensible list here: the hero animation's own chapter reveal
// depends on there being exactly six (owner's own instruction, not a
// guess).
const chapterField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
      defineField({ name: "description", title: "Description", type: "string", validation: (Rule) => Rule.required() }),
    ],
  });

export const libriPage = defineType({
  name: "libriPage",
  title: "Libri page",
  type: "document",
  fields: [
    // --- Hero ---
    defineField({ name: "kicker", title: "Hero — kicker", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "title", title: "Hero — title (h1)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "titleEmphasisWord",
      title: "Hero — title emphasized word (must match text from the title above exactly, case-sensitive)",
      type: "string",
    }),
    defineField({ name: "lead", title: "Hero — lead", type: "text", rows: 2, validation: (Rule) => Rule.required() }),

    // --- Index ("Cosa c'è dentro") ---
    defineField({ name: "indexKicker", title: "Index — kicker", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "indexTitle", title: "Index — title (h1)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "indexTitleEmphasisWord",
      title: "Index — title emphasized word (must match text from the title above exactly, case-sensitive)",
      type: "string",
    }),
    defineField({
      name: "indexLead",
      title: "Index — lead (contains the page-count placeholder until the real count is known)",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),

    chapterField("chapter1", "Chapter 1"),
    chapterField("chapter2", "Chapter 2"),
    chapterField("chapter3", "Chapter 3"),
    chapterField("chapter4", "Chapter 4"),
    chapterField("chapter5", "Chapter 5"),
    chapterField("chapter6", "Chapter 6"),

    // --- Guide cover / metadata (shared by the hero's animated cover and
    // the index section's static cover) ---
    defineField({ name: "coverTitle", title: "Guide cover — title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "metaLine",
      title: "Guide metadata line (e.g. \"[n] pagine · PDF · italiano\") — plain string, kept verbatim including bracket placeholders until the real page count is known",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    // Real cover pass — BookCover.tsx already accepted an imageUrl prop
    // (built for exactly this swap, per its own comment) but nobody
    // passed one until now. coverTitle above still renders whenever this
    // is empty (BookCover falls back to its CSS-drawn placeholder) — see
    // this pass's own report for where coverTitle stands now that a real
    // image usually IS set.
    defineField({
      name: "guideCoverImage",
      title: "Guide cover — real image (a 3D mockup with its own shadow/spine baked in; rendered flat, no added CSS depth — see BookCover.tsx's own comment)",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string", validation: (Rule) => Rule.required() }),
      ],
    }),
    // Download-flow build pass — the free guide's actual PDF. Left EMPTY
    // until the real file exists; LibriForm.tsx disables its submit button
    // (with an explanatory title) rather than sending a visitor to a URL
    // that 404s while this is unset. No `validation.required()` — an
    // empty state is expected and handled, not an authoring error.
    defineField({
      name: "guidePdf",
      title: "Guide — PDF file (the free download the form below promises)",
      type: "file",
      options: { accept: "application/pdf" },
    }),

    // --- Form ---
    defineField({
      name: "form",
      title: "Form",
      description:
        "Markup/copy only this pass — no working submission exists yet (a second processing purpose from the contact form, needs its own consent record and privacy-policy section first). See LibriForm.tsx's own TODO.",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "heading", title: "Heading (h2)", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 2, validation: (Rule) => Rule.required() }),
        defineField({ name: "consentLabel", title: "Privacy consent checkbox label (required)", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "marketingLabel", title: "Marketing consent checkbox label (optional)", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "submitLabel", title: "Submit button label", type: "string", validation: (Rule) => Rule.required() }),
      ],
    }),

    // --- Published book ---
    defineField({
      name: "book",
      title: "Published book",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
        defineField({
          name: "subtitle",
          title: "Subtitle (rendered as metadata beneath the title, not as body text — e.g. \"Guarire dal panico con la psicoterapia · 2023\")",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "body",
          title: "Body — separate paragraphs with a BLANK LINE. LibriBookPromo.tsx splits on blank lines into real <p> elements; a plain string field can't hold structure on its own, so this is the convention that makes it render as actual paragraphs instead of one run-on block.",
          type: "text",
          rows: 8,
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: "ctaLabel", title: "CTA label", type: "string", validation: (Rule) => Rule.required() }),
        defineField({
          name: "amazonUrl",
          title: "Amazon URL (leave empty until known — the CTA doesn't render without it, same pattern siteSettings.googleProfileUrl uses)",
          type: "url",
        }),
        defineField({
          name: "coverImage",
          title: "Cover — real image (a flat scan; CSS adds the depth — a slight rotateY, a striped page-block edge, a drop shadow — see BookCover.tsx's own comment)",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alternative text", type: "string", validation: (Rule) => Rule.required() }),
          ],
        }),
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
