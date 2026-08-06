import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";
import { medicalEntityTypeField } from "../lib/medicalEntityTypeField";

export const subtopicPage = defineType({
  name: "subtopicPage",
  title: "Subtopic page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parentPillar",
      title: "Parent pillar",
      description:
        "Must be the pillar page in the same language as this subtopic (each language is a separate document).",
      type: "reference",
      to: [{ type: "pillarPage" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "Own URL segment only (e.g. attacchi-di-panico) — the public URL is the parent pillar's slug plus this segment, composed at render time.",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      components: { input: SlugLockedAfterPublish },
    }),
    // --- Subtopic template pass (below) — additive only. title/parentPillar/
    // slug/body/seo/medicalEntityType/language above are untouched. Same
    // field shapes as pillarPage's own hero/faqItems fields, deliberately
    // NOT the same as facts strip / recognition — see this pass's own
    // report for why those two are excluded here.
    defineField({
      name: "heroImage",
      title: "Hero image",
      description:
        "Full-bleed image behind the hero. Optional — if left empty, the hero renders on a flat fallback fill instead of a broken/empty band.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({
      name: "heroKicker",
      title: "Hero kicker",
      description: "Short eyebrow label above the title.",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      description: "One sentence beneath the title.",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "titleEmphasisWord",
      title: "Title — emphasized word",
      description:
        "Must match one word from the title above exactly, case-sensitive; that word renders in the site's italic-accent style. Leave empty for no emphasis.",
      type: "string",
    }),
    // Deliberately a single required string, not a reuse of pillarPage's
    // recognitionItem — a subtopic is already the specific thing, so
    // there's one quote, not six, and nothing to label or cross-link (see
    // this pass's own report on why factsStrip/recognition don't belong
    // on this template at all).
    defineField({
      name: "epigraph",
      title: "Epigraph",
      description:
        "A single first-person quote Giuseppe has actually heard, shown beneath the hero. Not a diagnosis.",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "faqItems",
      title: "FAQ",
      description:
        "Up to a handful of questions for this subtopic's own FAQ section. Leave empty to hide this section entirely.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faqItem" }] }],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    medicalEntityTypeField(),
    languageField(),
  ],
});
