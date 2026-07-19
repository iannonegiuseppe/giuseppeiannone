import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// CMS-driven header/footer pass: NEW singleton — the header's own nav
// structure + CTA label. Logo lives on siteSettings instead (shared with
// the footer, not header-specific — see that document's own `logo`
// field). Per-locale like homePage/siteSettings (document-internationalization,
// see structure.ts's SINGLETON_TYPES/TRANSLATABLE_TYPES).
export const headerSettings = defineType({
  name: "headerSettings",
  title: "Header",
  type: "document",
  fields: [
    defineField({
      name: "navItems",
      title: "Navigation",
      description:
        'Top-level nav items, in display order. A submenu (e.g. "Aree") is a navLink whose own route/reference is left empty and which holds "Submenu items" instead — see navLink\'s own field descriptions.',
      type: "array",
      of: [{ type: "navLink" }],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "ctaButtonText",
      title: "CTA button label",
      description: "The header's contact-popup trigger button.",
      type: "string",
      initialValue: "Inizia il percorso",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    languageField(),
  ],
});
