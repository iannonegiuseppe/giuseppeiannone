import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Aree section pass: homepage header copy for the typographic
// intervention-area list — the rows themselves are separate `area`
// documents (see that type's own comment for why), fetched alongside
// this singleton rather than nested inside it. Standalone singleton
// (owner call, matching this session's chiSonoSection precedent), not a
// homePage field group.
//
// Homepage-fold pass: DEPRECATED — superseded by homePage.aree (same
// three fields, kicker/title/intro; `previewHover` below was already
// dead — see AreeSection.tsx's own comment — and wasn't carried over).
// hidden: true removes this from the Studio structure tree, global
// search, and "create new" menu (same mechanism qualification.ts/
// chiSonoSection.ts already use). Content copied, not moved — this
// document and its data are untouched, just no longer read by anything.
function textField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "text",
    rows: 2,
    validation: (Rule) => Rule.required().custom(deontologyCheck),
  });
}

function stringField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "string",
    validation: (Rule) => Rule.required().custom(deontologyCheck),
  });
}

export const areeSection = defineType({
  name: "areeSection",
  title: "Aree section (homepage) — DEPRECATED, no longer rendered (see Home page → Aree section)",
  type: "document",
  hidden: () => true,
  fields: [
    stringField("kicker", "Kicker"),
    stringField("title", "Title"),
    textField("intro", "Intro"),
    defineField({
      name: "previewHover",
      title: "Preview hover (demo)",
      description: "Demo only — disable once area pages exist.",
      type: "boolean",
      initialValue: false,
    }),
    languageField(),
  ],
  preview: {
    select: { title: "title", subtitle: "kicker" },
  },
});
