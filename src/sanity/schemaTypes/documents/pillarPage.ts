import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
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
