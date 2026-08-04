import { defineField, defineType } from "sanity";
import { deontologyCheck, deontologyCheckAllowingSymbols } from "../lib/deontologyValidator";
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
        // Stage 2c — ambient, muted, autoplay-once background video for the
        // full-bleed hero variant (HeroBackgroundVideo/HeroVideoActions,
        // design-lab-to-production migration) — a DIFFERENT mechanism from
        // youtubeId above (that one is a click-to-play overlay on the
        // static photo; this one replaces the photo's own background
        // entirely, ambient and silent). All three fields below are
        // optional and independent: no video field set -> photo above
        // stays the whole hero, exactly as today. desktop/mobile are two
        // separate encodes (not one file resized) — the client is
        // supplying pre-encoded 1080p/720p exports, not raw footage for
        // this schema to transform.
        defineField({
          name: "backgroundVideoDesktop",
          title: "Background video — desktop (1080p, optional)",
          description:
            "Served at viewport widths ~768px and above. Silent/muted, plays once and holds on its last frame — never looped. Leave empty to keep the hero on its static photo.",
          type: "file",
          options: { accept: "video/mp4" },
        }),
        defineField({
          name: "backgroundVideoMobile",
          title: "Background video — mobile (720p, optional)",
          description:
            "Served below ~768px viewport width — a separate, smaller encode, never the desktop file resized on the fly. Leave empty and phones simply get no background video (the desktop file is never sent to them as a fallback).",
          type: "file",
          options: { accept: "video/mp4" },
        }),
        defineField({
          name: "backgroundVideoPoster",
          title: "Background video poster (optional)",
          description:
            "Shown immediately and stays visible until the background video above is actually playing — the video only ever fades in on top of this, never replaces it outright. Leave empty to fall back to the current placeholder interior photo, so this frame is never blank.",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alternative text", type: "string" }),
          ],
        }),
      ],
    }),

    // 2. ChiSonoOverlap
    // Homepage-fold pass: hidden from the Studio form (hidden: true) —
    // nothing has read this field group since "profilo" superseded it
    // (see this field's own pre-existing comment history). Data
    // untouched; hidden only removes it from the editing UI, not from
    // the document.
    defineField({
      name: "chiSono",
      title: "2. Chi sono",
      type: "object",
      hidden: true,
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
    // Homepage-fold pass: hidden from the Studio form (hidden: true) —
    // superseded by areeSection/area, nothing reads this field group.
    // Data untouched.
    defineField({
      name: "diCosa",
      title: "5. Di cosa mi occupo (aree)",
      type: "object",
      hidden: true,
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
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField(
          "intro",
          "Intro paragraph (shown beside the heading, design-lab-to-production migration pass)",
          { required: false },
        ),
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
                // Privacy-gate pair, added for the /design-lab interactive-
                // card + lightbox pass — deliberately separate from
                // `document` above (left untouched: unused by that pass's
                // own interactivity check, still here for whatever it was
                // already doing). A card is interactive if and only if
                // `scan` is present AND `scanRedacted` is true — enforced
                // in the component that reads this field, not here; this
                // schema only captures the two facts an editor confirms.
                // No initialValue: true on scanRedacted — defaulting a
                // privacy confirmation to true would make it a rubber
                // stamp, not a check. Always rendered in the Studio (no
                // hidden/optional framing) so an editor can't upload a
                // scan without being asked to confirm redaction in the
                // same breath.
                defineField({
                  name: "scan",
                  title: "Scan",
                  description: "Scansione del titolo. Il file caricato deve essere già oscurato: codice fiscale, data e luogo di nascita.",
                  type: "image",
                  options: { hotspot: false },
                }),
                defineField({
                  name: "scanRedacted",
                  title: "Scan redacted",
                  description: "Confermo che nel file caricato sono oscurati codice fiscale, data e luogo di nascita.",
                  type: "boolean",
                  initialValue: false,
                  validation: (Rule) => Rule.required(),
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
    //
    // DEPRECATED as of the design-lab-to-production migration: "metodo"
    // (below) now renders in this section's place on the real homepage —
    // JourneySection.tsx is no longer called from page.tsx, so nothing in
    // this ENTIRE field group renders anywhere as of this migration.
    // Left fully intact deliberately (not deleted, not cleared) — same
    // precedent as homePage.chiSono/chiSonoSection elsewhere in this
    // file. steps[].expandedText specifically holds real, already-
    // written detail copy for JourneySection's click-to-expand panel, a
    // mechanic "metodo"'s own static rebuild doesn't have — flagged here
    // so a future editor doesn't assume it's safe to delete.
    defineField({
      name: "percorso",
      title: "8. Come si svolge un percorso — DEPRECATED, no longer rendered (see \"metodo\" below)",
      description:
        "Orphaned as of the design-lab-to-production migration — JourneySection.tsx is no longer " +
        "rendered on the real homepage, superseded by \"metodo\" below. Left intact, not deleted.",
      type: "object",
      // Homepage-fold pass: hidden from the Studio form on top of the
      // pre-existing DEPRECATED title above — data untouched.
      hidden: true,
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
                  "DEPRECATED — nothing renders this field as of the design-lab-to-production " +
                    "migration (the click-to-expand panel it fed no longer exists; \"metodo\" below " +
                    "only keeps title + shortLine). Content preserved, not deleted.",
                ),
              ],
              preview: { select: { title: "title", subtitle: "shortLine" } },
            },
          ],
          validation: (Rule) => Rule.min(3).max(5),
        }),
      ],
    }),

    // Metodo (/design-lab copy pass) — deliberately a SEPARATE field group
    // from "percorso" (field 8, above), not a reuse of it, even though the
    // two are the same underlying content shape (kicker/heading/steps) and
    // MetodoInteractive.tsx visually supersedes JourneySection/percorso's
    // own render. Reusing "percorso" directly would mean any edit made for
    // /design-lab's own preview (different wording: "Il percorso" vs.
    // percorso's live "Come funziona", etc.) silently rewrites the REAL,
    // currently-live production homepage's JourneySection content — the
    // same "shared component/content, divergent behavior needed for one
    // consumer -> split, don't mutate" call already made repeatedly this
    // session (credentialsBand/credentialsBandLight, .section/
    // .metodoLightWrap). Only title + shortLine are kept per step (the
    // fields MetodoInteractive.tsx actually renders) — percorso's own
    // atAGlance/expandedText fields exist for JourneySection's click-to-
    // expand panel, a mechanic Metodo's own static rebuild retired; not
    // carried over since nothing would read them.
    defineField({
      name: "metodo",
      title: "8b. Metodo (design-lab light-section rebuild)",
      description:
        "Independent from field 8 (percorso) above, which still feeds the " +
        "real, live JourneySection on the production homepage — this one is " +
        "/design-lab's own visual rebuild of the same idea, with its own " +
        "wording, so editing one never silently changes the other.",
      type: "object",
      fields: [
        stringField("kicker", "Eyebrow"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word or phrase (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField("paragraph", "Paragraph / intro", { required: false }),
        defineField({
          name: "steps",
          title: "Steps",
          description: "Exactly 4, rendered 01-04 in order. Numeral is computed from array position, not stored.",
          type: "array",
          of: [
            {
              type: "object",
              name: "metodoStep",
              fields: [
                stringField("title", "Title"),
                stringField("shortLine", "Description (shown next to the numeral)"),
              ],
              preview: { select: { title: "title", subtitle: "shortLine" } },
            },
          ],
          validation: (Rule) => Rule.length(4),
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

    // Welcome (/design-lab copy pass). Was hardcoded (content.ts's WELCOME
    // constant) — moved through the CMS like every other section's copy,
    // per this pass's own brief ("all copy goes through the Sanity
    // pipeline, not hardcoded"). Unnumbered for the same reason as Hope
    // above (pre-restyle field-group numbering, not yet reordered).
    defineField({
      name: "welcome",
      title: "Welcome",
      description:
        "The card-and-portrait introduction directly beneath Hope — kicker, " +
        "heading (with one emphasized word/phrase), and a short first-person " +
        "bio paragraph (name, credentials, disorders treated, locations, " +
        "languages, first-contact process). Area list, CTA button, and " +
        "signature row are NOT here — they read from siteSettings.author and " +
        "the areas list directly, same as elsewhere on the page.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("title", "Heading"),
        stringField(
          "titleEmphasis",
          "Heading — emphasized word or phrase (optional — must match the heading above exactly, case-sensitive; renders in the site's italic-accent style)",
          { required: false },
        ),
        textField("paragraph", "Paragraph", { rows: 4 }),
      ],
    }),

    // Credentials band (/design-lab rebuild pass). Was entirely hardcoded
    // (density/content.ts's CREDENTIALS constant) — moved through the CMS
    // like Welcome. Distinct from `formazione` above (a separate, currently
    // GATED section not rendered anywhere live — see docs/pre-launch.md —
    // with its own differently-shaped `counters` array) and from
    // siteSettings.author.credentials (the short "Psicologo Psicoterapeuta"
    // credential line shown in header/footer). Four FIXED cells, not a
    // flexible list: three plain factual counters (years of clinical
    // practice, years of training, number of locations including online)
    // and one non-numeric bilingual badge (IT / EN) — named fields rather
    // than an array since the shape itself is fixed, not editor-configurable.
    defineField({
      name: "credentialsBand",
      title: "Credentials band",
      description:
        "Factual credentials only — years and location count, never client " +
        "counts, percentages, or outcome claims (§9).",
      type: "object",
      fields: [
        stringField("eyebrow", "Eyebrow"),
        stringField("heading", "Heading"),
        defineField({
          name: "clinicalPracticeYears",
          title: "Clinical practice — years",
          type: "number",
          validation: (Rule) => Rule.required(),
        }),
        stringField("clinicalPracticeCaption", "Clinical practice — caption"),
        textField("clinicalPracticeDescription", "Clinical practice — description (one short sentence)", { rows: 2 }),
        defineField({
          name: "trainingYears",
          title: "Training — years",
          type: "number",
          validation: (Rule) => Rule.required(),
        }),
        stringField("trainingCaption", "Training — caption"),
        textField("trainingDescription", "Training — description (one short sentence)", { rows: 2 }),
        defineField({
          name: "locationsCount",
          title: "Locations — count (including online)",
          type: "number",
          validation: (Rule) => Rule.required(),
        }),
        stringField("locationsCaption", "Locations — caption"),
        textField("locationsDescription", "Locations — description (one short sentence)", { rows: 2 }),
        stringField(
          "languagesValue",
          "Languages — value (e.g. \"IT / EN\") — a compact bilingual badge, not translated per language",
        ),
        stringField("languagesCaption", "Languages — caption"),
        textField("languagesDescription", "Languages — description (one short sentence)", { rows: 2 }),
      ],
    }),

    // Aree section (Homepage-fold pass) — folded in from the standalone
    // areeSection document type, now deprecated in favour of this field
    // group (see that document's own schema comment). Same three fields
    // it always had; `previewHover` is NOT carried over — it was a
    // demo-only flag AreeSection.tsx's own comment already says nothing
    // reads ("Card-grid rebuild pass: still fetched... but no longer
    // read here"). The rows themselves stay the separate `area` document
    // type, untouched — each carries an optional slug reserved for a
    // future individual area page, which a plain array field here
    // couldn't hold the same way (see area.ts's own comment).
    defineField({
      name: "aree",
      title: "Aree section",
      description:
        "Header copy for the Aree (intervention areas) list, shown between " +
        "Credentials and Metodo. The rows themselves are separate `area` " +
        "documents, not part of this field group.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("title", "Title"),
        textField("intro", "Intro"),
      ],
    }),

    // CTA bridge (Homepage-fold pass) — folded in from the standalone
    // ctaBridgeSection document type, now deprecated in favour of this
    // field group (see that document's own schema comment). Same four
    // fields it always had.
    defineField({
      name: "ctaBridge",
      title: "CTA bridge",
      description:
        "Quiet mid-page invitation linking to the contact section, shown " +
        "between Tariffe and Profilo — not a second form.",
      type: "object",
      fields: [
        stringField("title", "Title"),
        stringField(
          "titleEmphasis",
          "Title — emphasized phrase (must match text inside the title above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField("body", "Body"),
        stringField("linkLabel", "Link label"),
      ],
    }),

    // 11. SedesSection (scene list is the separate `sede` document type)
    // DEPRECATED as of the design-lab-to-production migration: superseded
    // by "locations" below. Left intact, not deleted — its own paragraph
    // field still carries a live [segnaposto]/[placeholder] marker, but
    // per the client's own instruction that gap is superseded by the new
    // copy, not a chase item.
    defineField({
      name: "sedi",
      title: "11. Sedi — DEPRECATED, no longer rendered (see \"locations\" below)",
      description:
        "Orphaned as of the design-lab-to-production migration — no longer rendered, " +
        "superseded by \"locations\". Left intact, not deleted.",
      type: "object",
      // Homepage-fold pass: hidden from the Studio form on top of the
      // pre-existing DEPRECATED title above — data untouched.
      hidden: true,
      fields: [stringField("kicker", "Kicker"), stringField("heading", "Heading"), textField("paragraph", "Paragraph")],
    }),

    // Sedi (design-lab light-surface rebuild) — DEPRECATED as of the
    // design-lab-to-production migration: renamed/superseded by
    // "locations" below (same data shape, copied over) now that both
    // /design-lab and production read the same field. Left intact, not
    // deleted, per the same precedent as "sedi" above.
    defineField({
      name: "sediLab",
      title: "11b. Sedi (design-lab light-surface rebuild) — DEPRECATED, see \"locations\"",
      description:
        "Orphaned as of the design-lab-to-production migration — superseded by " +
        "\"locations\" below (same shape, data copied over). Left intact, not deleted.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField("intro", "Intro paragraph"),
        stringField("onlineSubLine", "Online entry — sub-line (e.g. \"Stessa durata, stesso costo.\")"),
      ],
    }),

    // Photo strip — DEPRECATED as of the design-lab-to-production
    // migration: renamed/superseded by "spaces" below. Left intact, not
    // deleted.
    defineField({
      name: "spaziLab",
      title: "11c. Gli spazi (design-lab photo strip) — DEPRECATED, see \"spaces\"",
      description:
        "Orphaned as of the design-lab-to-production migration — superseded by " +
        "\"spaces\" below (same shape, data copied over). Left intact, not deleted.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField(
          "introLine",
          "Intro line (renders ONLY once every strip photo is real — see LocationsMarquee.tsx)",
        ),
      ],
    }),

    // 11d. Locations — design-lab-to-production migration: the live Sedi/
    // locations section. Supersedes "sedi" and "sediLab" above (both
    // deprecated in favour of this) — named for the English component
    // family it renders through (LocationsSection/LocationsMap/
    // LocationsMarquee), not a topic-and-suffix name that would age badly
    // once this stops being the "new" one.
    defineField({
      name: "locations",
      title: "11d. Locations",
      description:
        "The live Sedi/locations section — supersedes \"sedi\" and \"sediLab\" above, " +
        "both deprecated in favour of this.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField("intro", "Intro paragraph"),
        stringField("onlineSubLine", "Online entry — sub-line (e.g. \"Stessa durata, stesso costo.\")"),
      ],
    }),

    // 11e. Spaces (photo strip) — design-lab-to-production migration:
    // the live Spazi section. Supersedes "spaziLab" above.
    defineField({
      name: "spaces",
      title: "11e. Spaces (photo strip)",
      description:
        "The live Spazi/photo-strip section — supersedes \"spaziLab\" above, " +
        "deprecated in favour of this.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        textField(
          "introLine",
          "Intro line (renders ONLY once every strip photo is real — see LocationsMarquee.tsx)",
        ),
      ],
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

    // Tariffe (/design-lab new pricing section) — deliberately a SEPARATE
    // field group from "prezzi" (field 12, above), not a reuse of it.
    // prezzi/PricingSection.tsx is a real, still-gated component whose own
    // eventual design is explicitly an "open client decision, not
    // something [any prior] pass settles" (see that component's own
    // comment) — a single-column kicker/heading/body/button layout with a
    // dead "#" CTA link, structurally unlike this section's two-row mode/
    // price + four-fact-footer layout. Reusing prezzi would both force this
    // new layout into a shape it doesn't fit AND presume an answer to a
    // decision the real component itself says is still open. New,
    // independent group instead — same reuse-vs-new call as metodo/percorso
    // above, and see this pass's own report for the full reasoning.
    //
    // §9 traps specific to pricing (all four checked live against the
    // deontologyCheck validator, not just eyeballed): state the fee as a
    // plain fact — no "a partire da", no packages/tiers/discounts/bundle
    // pricing, no comparison against other professionals, no urgency. The
    // 19% tax deduction is a permitted, factual claim (spesa sanitaria) —
    // must be stated neutrally, never framed as a saving, and its
    // traceable-payment condition must be honest, not omitted. No session
    // count, course duration, or total path cost — those are outcome/
    // duration promises, not facts about a single session's price.
    defineField({
      name: "tariffe",
      title: "12b. Tariffe (design-lab pricing rebuild)",
      description:
        "Independent from field 12 (prezzi) above, whose own component " +
        "comment marks its layout as still an open decision — this is " +
        "/design-lab's own two-row mode/price layout with its own copy.",
      type: "object",
      fields: [
        stringField("eyebrow", "Eyebrow"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word or phrase (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        defineField({
          name: "rows",
          title: "Pricing rows",
          description: "Exactly 2 — In studio, Online.",
          type: "array",
          of: [
            {
              type: "object",
              name: "tariffeRow",
              fields: [
                stringField("mode", "Mode name"),
                stringField("subline", "Sub-line"),
                stringField("price", "Price (formatted as it should display, e.g. \"100 €\")"),
              ],
              preview: { select: { title: "mode", subtitle: "price" } },
            },
          ],
          validation: (Rule) => Rule.length(2),
        }),
        // Layout pass: the four-column label/value block (durataLabel/
        // -Value, pagamentoLabel/-Value, ricevutaLabel/-Value,
        // detrazioneLabel/-Value — 8 fields) is retired in favour of a
        // single flowing details line, one phrase per practical fact, the
        // old label folded into each phrase itself ("Ricevuta sempre
        // rilasciata" instead of a separate "Ricevuta" caption above
        // "Sempre rilasciata"). The middot separators between phrases are
        // rendered decoratively by PricingBlock.tsx itself, NOT stored in
        // this copy — each array item is one clean phrase.
        defineField({
          name: "detailsItems",
          title: "Practical details (one flowing line, joined by a decorative middot — do not type separators into the copy itself)",
          description: "Exactly 4 short phrases, e.g. \"45 minuti\", \"Ricevuta sempre rilasciata\".",
          type: "array",
          of: [
            {
              type: "string",
              // The one item that legitimately needs a literal "%" (the
              // 19% deduction fact) shares this relaxed validator with
              // the other three, which don't contain "%" anyway — same
              // narrow, disclosed carve-out as the old detrazioneValue
              // field used, just applied at the array-item level now. See
              // deontologyCheckAllowingSymbols's own comment.
              validation: (Rule) => Rule.required().custom(deontologyCheckAllowingSymbols(["%"])),
            },
          ],
          validation: (Rule) => Rule.length(4),
        }),
        // Kept from the previous pass, unchanged: the deduction's
        // traceable-payment condition, always rendered below the details
        // line (§9: the deduction must never read as unconditional).
        textField("detrazioneFootnote", "Footnote below the details line (the deduction's traceable-payment condition — must never be empty; see this field's own §9 note above)", { rows: 2 }),
      ],
    }),

    // Profilo (/design-lab full-bleed Chi sono rebuild) — deliberately a
    // SEPARATE document from "chiSonoSection" (the real, live production
    // singleton — see that document's own schema file), not a reuse of
    // it, same reuse-vs-new call as metodo/percorso and tariffe/prezzi.
    // chiSonoSection's own shape (kicker/title/titleEmphasisWord/
    // paragraphs[3-5]/pullQuote/portrait/storyLink/signatureEnabled) is
    // built for the real site's own sticky-portrait/pull-quote layout;
    // this pass's brief is a different register entirely (full-bleed
    // background photo, exactly 3 paragraphs, no pull-quote, no story
    // link) — reusing chiSonoSection would either force this new layout
    // to fit that shape or silently rewrite the real production page's
    // own content. Photo itself stays a plain static asset reference
    // (ChiSonoBlock.tsx's own portraitUrl constant, same pattern Metodo/
    // CTA bridge already use for their own /design-lab imagery), not a
    // new Sanity image field — this pass's brief says "use the EXISTING
    // Chi sono portrait", not upload a new one.
    //
    // §9: professional facts only — no personal-recovery claim, no
    // outcome promise. The client asked for the personal-experience
    // angle (own panic attack, own therapy) to come out entirely; this
    // group's own fields have no room for it structurally (three plain
    // paragraphs, all professional-fact register).
    defineField({
      name: "profilo",
      title: "9b. Profilo (design-lab full-bleed rebuild)",
      description:
        "Independent from chiSonoSection (the real, live production " +
        "singleton) — this is /design-lab's own full-bleed rebuild with " +
        "its own, shorter copy (professional facts only, no personal-" +
        "experience narrative).",
      type: "object",
      fields: [
        stringField("eyebrow", "Eyebrow"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized phrase (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          description: "Exactly 3.",
          type: "array",
          of: [
            {
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required().custom(deontologyCheck),
            },
          ],
          validation: (Rule) => Rule.length(3),
        }),
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

    // 15. FinalContactSection — PARTIALLY DEPRECATED as of the design-lab-
    // to-production migration: kicker/heading/body/ctaLabel/privacyNote/
    // responseNote/photo are superseded by "contactSection" below and no
    // longer rendered. googleProfileLabel is the ONE exception — it stays
    // read from here directly, shared by both the CTA bridge and the
    // Contact section (never duplicated into contactSection). Per the
    // client's own instruction: responseNote's [segnaposto] marker is a
    // cancelled decision (the "within N days" promise was replaced by
    // "rispondo entro 24 ore", which lives in contactSection's own reply-
    // line copy, not a field on this document), not an unfilled one — no
    // chase item there.
    defineField({
      name: "finalCta",
      title: "15. Non sai da dove iniziare? (final CTA) — PARTIALLY DEPRECATED, see \"contactSection\"",
      description:
        "kicker/heading/body/ctaLabel/privacyNote/responseNote/photo are orphaned as of the " +
        "design-lab-to-production migration, superseded by \"contactSection\" below. " +
        "googleProfileLabel is NOT deprecated — still read directly by both the CTA bridge " +
        "and the Contact section.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        textField("body", "Body"),
        stringField("ctaLabel", "CTA button label"),
        textField("privacyNote", "Privacy note", { rows: 1 }),
        textField("responseNote", "Response-time note", { rows: 1 }),
        stringField("googleProfileLabel", "Google profile link label — NOT deprecated, still live"),
        defineField({
          name: "photo",
          title: "Photo",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
        }),
      ],
    }),

    // 15b. Contact (design-lab light-surface rebuild) — DEPRECATED as of
    // the design-lab-to-production migration: renamed/superseded by
    // "contactSection" below (same shape, data copied over). Left intact,
    // not deleted.
    defineField({
      name: "contactLab",
      title: "15b. Contatto (design-lab light-surface rebuild) — DEPRECATED, see \"contactSection\"",
      description:
        "Orphaned as of the design-lab-to-production migration — superseded by " +
        "\"contactSection\" below (same shape, data copied over). Left intact, not deleted.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        stringField("photoCaption", "Photo caption"),
      ],
    }),

    // 15c. Contact section (form) — design-lab-to-production migration:
    // the live Contact section. Supersedes "contactLab" above. Named for
    // the SECTION (there are now two contact-related elements on the
    // page — this form, and the CTA bridge that opens a modal pointing at
    // it), not the bare topic "contact", which would be ambiguous between
    // the two.
    defineField({
      name: "contactSection",
      title: "15c. Contact section (form)",
      description:
        "The live Contact section (the form at the bottom of the page) — supersedes " +
        "\"contactLab\" above. \"finalCta\" above is partially superseded too (see its own " +
        "description) — googleProfileLabel stays read from finalCta directly, shared with " +
        "the CTA bridge.",
      type: "object",
      fields: [
        stringField("kicker", "Kicker"),
        stringField("heading", "Heading"),
        stringField(
          "headingEmphasisWord",
          "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
          { required: false },
        ),
        stringField("photoCaption", "Photo caption"),
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
