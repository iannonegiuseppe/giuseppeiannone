import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// One field group per rendered <main> section on the promoted homepage
// (src/app/[locale]/page.tsx) — 15 groups for 15 sections, in page order.
// Groups hold ONLY section-level copy; shared lists (diplomas, sedi) are
// separate document types fetched directly, not referenced from here, and
// the FAQ group holds references to a subset of the existing faqItem type
// rather than duplicating question/answer fields. Name/credentials/
// registration number and the repeated CTA/signature strings deliberately
// come from siteSettings.author instead of being re-entered per section —
// see each group's own description for what it reuses.
//
// CMS-wiring pass, Stage A — replaces the pre-promotion placeholder
// homepage's own field set (hero/credentialsStrip/methods/body/
// pricingSummary/finalContact) entirely; credentialsStrip, methods, and the
// legacy body/ctaBlock field are removed outright (owner-confirmed: no
// dormant fields) since none of them correspond to anything in the current
// 15-section composition.
function textField(
  name: string,
  title: string,
  options?: { rows?: number; required?: boolean; initialValue?: string },
) {
  return defineField({
    name,
    title,
    type: "text",
    rows: options?.rows ?? 2,
    initialValue: options?.initialValue,
    validation: (Rule) => {
      const withCustom = Rule.custom(deontologyCheck);
      return options?.required === false ? withCustom : withCustom.required();
    },
  });
}

function stringField(
  name: string,
  title: string,
  options?: { required?: boolean; initialValue?: string },
) {
  return defineField({
    name,
    title,
    type: "string",
    initialValue: options?.initialValue,
    validation: (Rule) => {
      const withCustom = Rule.custom(deontologyCheck);
      return options?.required === false ? withCustom : withCustom.required();
    },
  });
}

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description:
        "Used for the browser tab / SEO fallback title, not shown on the page itself — the hero displays the author's name from Site settings instead.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    // 1. HeroOverlap
    defineField({
      name: "hero",
      title: "1. Hero",
      description:
        "Credentials and registration number come from Site settings' Author fields, not from here — kept in one place. The headline below is the benefit statement shown to visitors; it no longer displays the author's name.",
      type: "object",
      fields: [
        textField("headline", "Headline", {
          rows: 2,
        }),
        stringField(
          "headlineEmphasisWord",
          "Headline — emphasized word (must match one word from the headline above exactly, case-sensitive; that word renders in the site's italic-accent style — leave empty for no emphasis)",
          { required: false },
        ),
        textField("positioningStatement", "Subtext"),
        stringField("ctaLabel", "CTA button label"),
        defineField({
          name: "photo",
          title: "Photo",
          description:
            "Full-bleed portrait behind the section. Leave empty until a real photo is ready; a placeholder renders in its place. Always the fallback and video poster frame, even when a video is set below.",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alternative text", type: "string", validation: (Rule) => Rule.required() }),
          ],
        }),
        defineField({
          name: "youtubeId",
          title: "YouTube video ID (optional)",
          description:
            "The 11-character ID from a YouTube URL (the part after \"v=\"). When set, a click-to-play button appears over the photo above; the photo stays the poster frame and fallback either way. Leave empty to keep the current static-photo hero.",
          type: "string",
          validation: (Rule) =>
            Rule.regex(/^[\w-]{11}$/, { name: "YouTube video ID" }).warning(
              "Doesn't look like an 11-character YouTube video ID — double-check it's just the ID, not the full URL.",
            ),
        }),
      ],
    }),

    // 2. ChiSonoOverlap
    defineField({
      name: "chiSono",
      title: "2. Chi sono",
      type: "object",
      fields: [
        textField("introHeading", "Intro heading", { rows: 2 }),
        stringField("introLinkLabel", "Intro link label"),
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("bio", "Bio", { rows: 4 }),
        textField("methodsBody", "Approach paragraph (merged from retired 'Come funziona' section)", {
          rows: 4,
          required: false,
        }),
        stringField("storyLinkLabel", "Story link label"),
        stringField("watermarkText", "Background watermark word", {
          required: false,
        }),
        defineField({
          name: "photo",
          title: "Photo",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
        }),
      ],
    }),

    // 4. FormazioneBand
    defineField({
      name: "formazione",
      title: "4. Formazione e iscrizioni",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        defineField({
          name: "credentials",
          title: "Credentials list",
          description: "Factual credentials only — never counters, percentages, or client-number claims.",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.max(8),
        }),
        defineField({
          name: "counters",
          title: "Counters",
          description:
            'Plain factual figures (years of practice, training hours). Not client counts or outcome claims — those are forbidden by §9 regardless of phrasing.',
          type: "array",
          of: [
            {
              type: "object",
              name: "formazioneCounter",
              fields: [
                defineField({ name: "value", title: "Value", type: "number", validation: (Rule) => Rule.required() }),
                stringField("label", "Label"),
              ],
              preview: { select: { title: "label", subtitle: "value" } },
            },
          ],
          validation: (Rule) => Rule.max(3),
        }),
      ],
    }),

    // 5. ConcernsSection
    defineField({
      name: "diCosa",
      title: "5. Di cosa mi occupo (aree)",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField("linkLabel", "Link label"),
        defineField({
          name: "areas",
          title: "Areas",
          type: "array",
          of: [
            {
              type: "object",
              name: "concernArea",
              fields: [
                stringField("title", "Title"),
                defineField({
                  name: "subItems",
                  title: "Sub-items",
                  type: "array",
                  of: [{ type: "string" }],
                  validation: (Rule) => Rule.max(3),
                }),
              ],
              preview: { select: { title: "title" } },
            },
          ],
          validation: (Rule) => Rule.max(4),
        }),
        defineField({
          name: "photo",
          title: "Photo",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
        }),
      ],
    }),

    // 7. DiplomiSection — items moved in-line here (owner call: array on
    // homePage, not a standalone document type). Supersedes the
    // `qualification` document type the same way `qualification` itself
    // superseded `diploma` before it — see qualification.ts's own comment;
    // that type stays registered/orphaned, not deleted, same precedent as
    // `diploma`. Order is the array's own item order (drag-reorder in
    // Studio), not a stored field — same convention as `percorso.steps[]`
    // above ("computed from array position, not stored").
    defineField({
      name: "diplomi",
      title: "7. Diplomi e formazione",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "alboLine",
          "Albo registration line (shown below the card row)",
        ),
        defineField({
          name: "items",
          title: "Qualifications",
          description: "3-8 entries, rendered in array order.",
          type: "array",
          of: [
            {
              type: "object",
              name: "qualificationItem",
              fields: [
                defineField({
                  name: "year",
                  title: "Year",
                  description: 'Display string, not a number — e.g. "2011" or a future "2019–2020" range.',
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                stringField("title", "Title"),
                stringField("institution", "Institution"),
                defineField({
                  name: "tier",
                  title: "Tier",
                  description: "Stored for future grouping/filtering — this pass renders every tier identically in a single row.",
                  type: "string",
                  options: {
                    list: [
                      { title: "Titolo (degree/formal qualification)", value: "titolo" },
                      { title: "Formazione continua (continuing education)", value: "formazione_continua" },
                    ],
                  },
                  initialValue: "titolo",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "document",
                  title: "Scanned document",
                  description: "Optional — leave empty until the redacted scan is ready. Cards without one show a typographic placeholder instead of a broken image.",
                  type: "image",
                  options: { hotspot: false },
                }),
              ],
              preview: { select: { title: "title", subtitle: "institution", media: "document" } },
            },
          ],
          validation: (Rule) => Rule.min(3).max(8),
        }),
      ],
    }),

    // 8. JourneySection (interactive rebuild — supersedes the earlier
    // static staircase pass; steps[].description renamed to shortLine,
    // expandedText added for the desktop right panel / mobile inline copy)
    defineField({
      name: "percorso",
      title: "8. Come si svolge un percorso",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match one word from the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField("paragraph", "Paragraph"),
        defineField({
          name: "steps",
          title: "Steps",
          description: "3-5 steps, rendered 01-04(-05) in order. Numeral is computed from array position, not stored.",
          type: "array",
          of: [
            {
              type: "object",
              name: "percorsoStep",
              fields: [
                stringField("title", "Title"),
                stringField("shortLine", "Short line (always visible, next to the numeral)"),
                textField(
                  "expandedText",
                  "Expanded text (desktop: shown in the right panel when this step is active; mobile: shown inline, always visible)",
                ),
              ],
              preview: { select: { title: "title", subtitle: "shortLine" } },
            },
          ],
          validation: (Rule) => Rule.min(3).max(5),
        }),
      ],
    }),

    // 9. RecognitionSection
    defineField({
      name: "recognition",
      title: "9. Ti riconosci? (constellation)",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("bridgeLine", "Bridge line"),
        defineField({
          name: "fragments",
          title: "Fragments",
          description:
            "Rebuild pass: replaces the old scroll-highlight vignette list and its " +
            "per-vignette background visuals entirely — this section is now a " +
            "static asymmetric composition of short, patient-voice sentences (no " +
            "background art at all). 4-6 fragments, three tiers: exactly ONE " +
            "anchor (largest, catches the eye first — closes the centre-left " +
            "void the composition otherwise leaves), dominant (2-3, larger), " +
            "peripheral (2-3, smaller/quieter) — set via each fragment's own " +
            "Tier field. These sentences ARE the section's whole job: a visitor " +
            "should recognize themselves in one within a second, so the wording " +
            "must be the language patients actually use, not a clinical " +
            "description. Mark placeholder copy with [segnaposto] — real lines " +
            "are owed by Giuseppe, not written by an assistant.",
          type: "array",
          of: [
            {
              type: "object",
              name: "recognitionFragment",
              fields: [
                stringField(
                  "label",
                  "Category label (e.g. \"Stress\") — leave blank for the anchor tier if it reads better unlabeled",
                  { required: false },
                ),
                textField(
                  "text",
                  "Sentence — keep the anchor tier's especially short (~60 characters or less): it renders nearly twice the dominant size, so a long sentence there dominates the whole section",
                  { rows: 2 },
                ),
                stringField(
                  "emphasisWord",
                  "Emphasized word or phrase (optional — must match the sentence above exactly, case-sensitive; renders in the site's italic-accent style. One or two words at most — not every fragment needs one.)",
                  { required: false },
                ),
                defineField({
                  name: "tier",
                  title: "Tier",
                  type: "string",
                  options: {
                    list: [
                      { title: "Anchor (largest — exactly one)", value: "anchor" },
                      { title: "Dominant (larger, longer)", value: "dominant" },
                      { title: "Peripheral (smaller, quieter)", value: "peripheral" },
                    ],
                  },
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: { select: { title: "label", subtitle: "text" } },
            },
          ],
          validation: (Rule) =>
            Rule.min(4)
              .max(6)
              .custom((fragments) => {
                if (!Array.isArray(fragments)) return true;
                const anchorCount = fragments.filter(
                  (f) => f && typeof f === "object" && "tier" in f && f.tier === "anchor",
                ).length;
                return anchorCount <= 1 || "Only one fragment may use the Anchor tier — pick the single strongest line.";
              }),
        }),
      ],
    }),

    // Hope (new — global restyle pass). A small, static transitional band:
    // eyebrow + one heading line only, no photo, no body paragraph. Field-
    // group numbering across this file reflects the PRE-restyle page
    // order; the restyle pass's own reorder step renumbers all of these
    // titles to match the new order in one pass, so this one is
    // deliberately left unnumbered for now rather than guessing a slot.
    defineField({
      name: "hope",
      title: "Hope",
      description:
        "Full-bleed accent-band pass: the pivot of the patient-centered arc — " +
        "Recognition, then this, then How therapy helps. One still line, not a " +
        "claim of outcome; deliberately just eyebrow + heading, nothing else " +
        "(no photo, no body, no button — a second element kills the effect). " +
        "The heading matters more here than almost anywhere else on the page: " +
        "it carries the entire emotional turn, and it must be Giuseppe's own " +
        "line, not a placeholder treated as final.",
      type: "object",
      fields: [
        stringField("eyebrow", "Eyebrow", { initialValue: "[segnaposto]" }),
        textField("heading", "Heading", { rows: 2, initialValue: "[segnaposto]" }),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word or phrase (optional — must match the heading above exactly, case-sensitive; renders in italic. Color stays the same ivory as the rest of the heading — the accent-color swap used elsewhere doesn't apply on this band, since the background itself IS the accent color.)",
          { required: false },
        ),
      ],
    }),

    // 11. SedesSection (scene list is the separate `sede` document type)
    defineField({
      name: "sedi",
      title: "11. Sedi",
      type: "object",
      fields: [stringField("kicker", "Kicker"), stringField("heading", "Heading"), textField("paragraph", "Paragraph")],
    }),

    // 12. PricingSection
    defineField({
      name: "prezzi",
      title: "12. Quanto costa un percorso",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("body", "Body"),
        stringField("buttonLabel", "Button label"),
        defineField({
          name: "showPrices",
          title: "Show price list",
          description: "When off, the section shows the noPricesSentence below instead of the price lines.",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "priceLines",
          title: "Price lines",
          type: "array",
          of: [
            {
              type: "object",
              name: "priceLine",
              fields: [stringField("label", "Label"), stringField("price", "Price"), stringField("unit", "Unit")],
              preview: { select: { title: "label", subtitle: "price" } },
            },
          ],
        }),
        textField("footnote", "Footnote (shown when price list is on)"),
        textField("noPricesSentence", "Sentence (shown when price list is off)"),
      ],
    }),

    // 13. ResourcesSection — kicker/heading/link label only; realArticles
    // keeps coming from the existing, untouched article query per spec.
    defineField({
      name: "risorse",
      title: "13. Risorse",
      type: "object",
      fields: [stringField("kicker", "Kicker"), stringField("heading", "Heading"), stringField("allArticlesLabel", "\"All articles\" link label")],
    }),

    // 14. VideoSection ("La prima seduta") — between Risorse and the final
    // CTA band, per spec: the last anxiety-reducer before the invitation
    // to act. Renders ONLY when `file` is set (VideoSection.tsx's own
    // early-return) — same "zero content -> zero DOM" philosophy as
    // ResourcesSection's zero-articles case, not a placeholder block.
    //
    // Field names follow this file's own established convention (plain
    // kicker/heading/lead inside a named object, matching all 14 other
    // sections) rather than the flat, videoKicker/videoTitle-prefixed
    // names an earlier draft of this spec used — that prefixing pattern
    // belongs to siteSettings' flat top-level fields (a different
    // document, different shape), not this file's per-section objects.
    defineField({
      name: "video",
      title: "14. La prima seduta (video)",
      description:
        "Optional. The section is entirely absent from the live page until a video file is uploaded below — no placeholder block, matching Risorse's zero-articles behavior.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker", { initialValue: "LA PRIMA SEDUTA" }),
        stringField("heading", "Heading", { initialValue: "Come si svolge il primo incontro" }),
        textField("lead", "Lead line", {
          rows: 2,
          initialValue:
            "Un breve video per conoscermi: guarda come lavoro e senti se potresti trovarti a tuo agio con me.",
        }),
        defineField({
          name: "file",
          title: "Video file",
          description: "Leave empty to keep this section off the live page entirely.",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
        }),
        defineField({
          name: "poster",
          title: "Poster image",
          description: "Required whenever a video file is set above — shown before playback and after the video ends.",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alternative text", type: "string" }),
          ],
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { file?: { asset?: unknown } } | undefined;
              if (parent?.file?.asset && !value) {
                return "Required whenever a video file is set above.";
              }
              return true;
            }),
        }),
        defineField({
          name: "captions",
          title: "Captions (VTT, optional)",
          description:
            "Italian captions are strongly recommended — most viewers watch with sound off.",
          type: "file",
          options: { accept: ".vtt" },
        }),
      ],
    }),

    // 15. FinalContactSection
    defineField({
      name: "finalCta",
      title: "15. Non sai da dove iniziare? (final CTA)",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("body", "Body"),
        stringField("ctaLabel", "CTA button label"),
        textField("privacyNote", "Privacy note", { rows: 1 }),
        textField("responseNote", "Response-time note", { rows: 1 }),
        stringField("googleProfileLabel", "Google profile link label"),
        defineField({
          name: "photo",
          title: "Photo",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
        }),
      ],
    }),

    // 16. FaqSection — references a subset of the existing faqItem type.
    defineField({
      name: "faq",
      title: "16. Domande frequenti",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField("linkLabel", "\"All questions\" link label"),
        defineField({
          name: "items",
          title: "Questions shown on the homepage",
          type: "array",
          of: [{ type: "reference", to: [{ type: "faqItem" }] }],
          validation: (Rule) => Rule.length(4),
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
