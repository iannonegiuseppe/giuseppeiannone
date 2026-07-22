import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Aree section pass: homepage header copy for the typographic
// intervention-area list — the rows themselves are separate `area`
// documents (see that type's own comment for why), fetched alongside
// this singleton rather than nested inside it. Standalone singleton
// (owner call, matching this session's chiSonoSection precedent), not a
// homePage field group.
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
  title: "Aree section (homepage)",
  type: "document",
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
