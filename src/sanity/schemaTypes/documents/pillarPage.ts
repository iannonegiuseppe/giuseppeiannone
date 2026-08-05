import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";
import { medicalEntityTypeField } from "../lib/medicalEntityTypeField";
import { rootSlugCollisionCheck } from "../lib/rootSlugValidator";

export const pillarPage = defineType({
  name: "pillarPage",
  title: "Pillar page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      // Root-namespace pass — pillarPage shares its URL segment
      // (/{slug}) with the universal page type and can be shadowed by a
      // frozen WordPress redirect; this checks all three at save time.
      // Same validator as page.slug — see rootSlugValidator.ts's own
      // comment on why this must be symmetric.
      validation: (Rule) => Rule.required().custom(rootSlugCollisionCheck),
      components: { input: SlugLockedAfterPublish },
    }),
    // --- Pillar template pass (below) — additive only. title/slug/body/
    // seo/medicalEntityType/language above are untouched.
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
    defineField({
      name: "factsStrip",
      title: "Facts strip",
      description:
        "Neutral facts about the session format only — session length, modality, languages spoken, where Giuseppe practises. Never a number of sessions, never a duration of treatment, never anything that reads as an outcome or result — see docs/design-direction.md §9. Leave empty to hide this section entirely.",
      type: "object",
      fields: [
        defineField({
          name: "items",
          title: "Facts",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  title: "Label",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "value",
                  title: "Value",
                  type: "string",
                  validation: (Rule) => Rule.required().custom(deontologyCheck),
                }),
              ],
              preview: {
                select: { label: "label", value: "value" },
                prepare({ label, value }: { label?: string; value?: string }) {
                  return { title: label ?? "", subtitle: value ?? "" };
                },
              },
            },
          ],
          validation: (Rule) => Rule.min(3).max(4),
        }),
      ],
      preview: {
        select: { items: "items" },
        prepare({ items }: { items?: unknown[] }) {
          return { title: "Facts strip", subtitle: `${items?.length ?? 0} fact(s)` };
        },
      },
    }),
    defineField({
      name: "recognition",
      title: "Recognition",
      description:
        "Short first-person phrases Giuseppe has actually heard in practice — displayed two per row. Not a diagnosis; the page adds a fixed disclaimer line beneath these automatically. Leave empty to hide this section entirely.",
      type: "object",
      fields: [
        defineField({
          name: "items",
          title: "Phrases",
          type: "array",
          of: [
            {
              type: "string",
              validation: (Rule) => Rule.custom(deontologyCheck),
            },
          ],
          validation: (Rule) => Rule.min(2),
        }),
      ],
      preview: {
        select: { items: "items" },
        prepare({ items }: { items?: unknown[] }) {
          return { title: "Recognition", subtitle: `${items?.length ?? 0} phrase(s)` };
        },
      },
    }),
    defineField({
      name: "faqItems",
      title: "FAQ",
      description:
        "Up to a handful of questions for this page's own dedicated FAQ section. Same faqItem documents body's FAQ block uses elsewhere — this is a separate, top-level field (not fished out of Body) so the section only appears when this field is filled, independent of anything placed in Body itself. Leave empty to hide this section entirely.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faqItem" }] }],
    }),
    defineField({
      name: "relatedArticles",
      title: "Related articles",
      description:
        "Up to 3 articles to feature at the end of this page. Leave empty (or pick fewer than 3) and the page fills any remaining slots automatically with the most recent articles.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (Rule) => Rule.max(3),
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
