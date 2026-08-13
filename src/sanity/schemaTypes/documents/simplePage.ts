import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Shared shape for singleton pages that are just a title + body + SEO.
//
// Privacy/cookie policy pass — added `withLastUpdated`, off by default. Only
// those two documents need a visible, editor-set revision date; the four
// existing callers (aboutPage/methodPage/pricePage/contactPage) don't ask
// for one and are unaffected — confirmed none of them pass this option, so
// their schema shape is unchanged.
export function defineSimplePageType(options: {
  name: string;
  title: string;
  withLastUpdated?: boolean;
}) {
  return defineType({
    name: options.name,
    title: options.title,
    type: "document",
    fields: [
      defineField({
        name: "title",
        title: "Title",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      ...(options.withLastUpdated
        ? [
            defineField({
              name: "lastUpdated",
              title: "Last updated",
              description: "Shown on the page as the document's revision date.",
              type: "date",
              validation: (rule) => rule.required(),
            }),
          ]
        : []),
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
      languageField(),
    ],
  });
}
