import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// CMS-driven header/footer pass: NEW singleton. Deliberately does NOT
// duplicate data that already lives elsewhere — single source of truth:
// - Addresses: sede documents (already the homepage Sedi section's own
//   source) — NOT this document. Fixes a pre-existing bug flagged by an
//   earlier audit pass: the footer's "Sedi" column was pulling from the
//   separate, unpublished `locationPage` type and rendering empty; it now
//   reads the same sede docs the homepage already shows (see layout.tsx).
// - Contacts/Albo/P.IVA/emergency line/copyright name: siteSettings.
// - Nav: this document's OWN navItems/legalNavItems (see the field
//   comment below on why the footer nav is NOT just a reuse of
//   headerSettings — the two lists genuinely differ).
// - Developer credit: NOT a field here at all — hardcoded in Footer.tsx,
//   per spec ("must not be editable or deletable via CMS").
export const footerSettings = defineType({
  name: "footerSettings",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "columnHeadings",
      title: "Column headings",
      description: "The four footer column kickers.",
      type: "object",
      fields: [
        defineField({
          name: "explore",
          title: "Explore column",
          type: "string",
          initialValue: "Esplora",
          validation: (Rule) => Rule.required().custom(deontologyCheck),
        }),
        defineField({
          name: "locations",
          title: "Locations column",
          type: "string",
          initialValue: "Sedi",
          validation: (Rule) => Rule.required().custom(deontologyCheck),
        }),
        defineField({
          name: "contact",
          title: "Contact column",
          type: "string",
          initialValue: "Contatti",
          validation: (Rule) => Rule.required().custom(deontologyCheck),
        }),
        defineField({
          name: "legal",
          title: "Legal column",
          type: "string",
          initialValue: "Informazioni legali",
          validation: (Rule) => Rule.required().custom(deontologyCheck),
        }),
      ],
    }),
    defineField({
      name: "navItems",
      title: "Explore column — links",
      description:
        'The footer\'s "Esplora" column genuinely differs from the header nav (it includes Home and Risorse, and has no "Aree" submenu — it\'s a flat list) — its own editable list rather than a reuse of Header > Navigation.',
      type: "array",
      of: [{ type: "navLink" }],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: "legalNavItems",
      title: "Legal column — links",
      description: 'Typically Privacy + Cookie policy. P.IVA is its own line below this, sourced from Site settings, not part of this list.',
      type: "array",
      of: [{ type: "navLink" }],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "instagramLabel",
      title: "Instagram link label",
      description: "Shown only when Site settings > Social profiles > Instagram is set.",
      type: "string",
      initialValue: "Instagram",
      validation: (Rule) => Rule.custom(deontologyCheck),
    }),
    defineField({
      name: "googleProfileLabel",
      title: "Google profile link label",
      description: "Shown only when Site settings > Google profile URL is set.",
      type: "string",
      initialValue: "Trovami su Google",
      validation: (Rule) => Rule.custom(deontologyCheck),
    }),
    languageField(),
  ],
});
