import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Chi sono section pass: a homepage TEASER between Diplomi and Areas —
// NOT the future full /chi-sono page (aboutPath in sanity/paths.ts),
// which stays unbuilt this pass (see storyLink's own description, and
// headerNavItems.ts's PREVIEW_GATE_ANCHOR_OVERRIDES comment for why the
// header's "Chi sono" nav link still anchor-scrolls here rather than
// routing to that future page — this section owns id="chi-sono" for
// exactly that reason). Standalone singleton (owner call), not a
// homePage field group — same singletonListItem/SINGLETON_TYPES
// treatment as aboutPage/methodPage/pricePage, but with its own
// structured fields (title/paragraphs/portrait/etc.) rather than
// defineSimplePageType's generic title+body+seo shape, since this
// section's layout (sticky portrait, pull-quote, signature) needs
// individually addressable fields, not one Portable Text blob. The
// OLDER homePage.chiSono field group + ChiSonoOverlap.tsx (a different,
// pre-existing shape) are superseded by this — left registered/orphaned,
// not deleted, same precedent as diploma/qualification before it.
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

// DEPRECATED as of the design-lab-to-production migration: homePage.profilo
// is now the rendered Chi sono source on the real homepage (ChiSonoBlock,
// a full-bleed rebuild with its own shorter, professional-facts-only
// copy) — this document type's own 5-paragraph personal-story content is
// real, finished client copy, just no longer rendered anywhere. Left
// fully intact deliberately (not deleted, not cleared) — same precedent
// this file's own top comment already set for the OLDER homePage.chiSono
// field group it itself superseded.
//
// Homepage-fold pass: hidden: true removes this from the Studio
// structure tree, global search, and "create new" menu (same mechanism
// qualification.ts already uses) — its own five paragraphs are Giuseppe's
// own writing and exist nowhere else (they're planned for the future Chi
// sono page), so this is hidden, not deleted or folded — unlike
// areeSection/ctaBridgeSection (same pass), whose content moved into
// homePage as new field groups instead.
export const chiSonoSection = defineType({
  name: "chiSonoSection",
  title: "Chi sono section (homepage) — DEPRECATED, no longer rendered (see homePage.profilo)",
  description:
    "Orphaned as of the design-lab-to-production migration — no longer rendered on the real " +
    "homepage, superseded by homePage.profilo. Left intact, not deleted; still real client copy.",
  type: "document",
  hidden: () => true,
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
        "Optional — set once the future full Chi sono page exists (not built this pass). " +
        "When empty, the homepage section renders no link at all.",
      type: "slug",
    }),
    defineField({
      name: "signatureEnabled",
      title: "Show signature",
      type: "boolean",
      initialValue: true,
    }),
    languageField(),
  ],
  preview: {
    select: { title: "title", subtitle: "kicker", media: "portrait" },
  },
});
