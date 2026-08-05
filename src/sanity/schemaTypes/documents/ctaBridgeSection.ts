import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// CTA bridge pass: a quiet mid-page invitation between Aree and Diplomi —
// a link to the existing contact section, not a second form. Standalone
// singleton (owner call, same reasoning as areeSection/chiSonoSection:
// this isn't a homePage field group).
//
// Homepage-fold pass: DEPRECATED — superseded by homePage.ctaBridge (same
// four fields: title/titleEmphasis/body/linkLabel). hidden: true removes
// this from the Studio structure tree, global search, and "create new"
// menu (same mechanism qualification.ts/chiSonoSection.ts/areeSection.ts
// already use). Content copied, not moved — this document and its data
// are untouched, just no longer read by anything.
function textField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "text",
    rows: 2,
    validation: (Rule) => Rule.required().custom(deontologyCheck),
  });
}

function stringField(name: string, title: string, options?: { required?: boolean }) {
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

export const ctaBridgeSection = defineType({
  name: "ctaBridgeSection",
  title: "CTA bridge (homepage) — DEPRECATED, no longer rendered (see Home page → CTA bridge)",
  type: "document",
  hidden: () => true,
  fields: [
    stringField("title", "Title"),
    stringField(
      "titleEmphasis",
      "Title — emphasized phrase (must match text inside the title above exactly, case-sensitive; leave empty for no emphasis)",
      { required: false },
    ),
    textField("body", "Body"),
    stringField("linkLabel", "Link label"),
    languageField(),
  ],
  preview: {
    select: { title: "title", subtitle: "linkLabel" },
  },
});
