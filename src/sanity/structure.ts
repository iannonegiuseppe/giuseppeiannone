import type { StructureBuilder, StructureResolver } from "sanity/structure";

// Singletons: exactly one document PER LANGUAGE, linked as an it/en
// translation pair by @sanity/document-internationalization. Fixed pane
// _id convention: `${typeId}-${language}` (e.g. "homePage-it",
// "homePage-en"), established here for Step 9's seed script to follow.
export const SINGLETON_TYPES = new Set([
  "siteSettings",
  "homePage",
  "aboutPage",
  "methodPage",
  "pricePage",
  "faqPage",
  "contactPage",
]);

// Singletons, plus locationPage: exactly two documents (Milan, Monza) that
// must not be deleted or duplicated, even though it's a normal list (not a
// fixed single-document pane) since there's more than one.
export const PROTECTED_TYPES = new Set([...SINGLETON_TYPES, "locationPage"]);

// Every schema type wired into @sanity/document-internationalization
// (see sanity.config.ts).
export const TRANSLATABLE_TYPES = new Set([
  ...PROTECTED_TYPES,
  "pillarPage",
  "subtopicPage",
  "article",
  "service",
  "faqItem",
]);

const DEFAULT_LOCALE = "it";

function singletonListItem(S: StructureBuilder, typeId: string, title: string) {
  return S.listItem()
    .id(typeId)
    .title(title)
    .child(S.document().schemaType(typeId).documentId(`${typeId}-${DEFAULT_LOCALE}`));
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              singletonListItem(S, "homePage", "Home page"),
              singletonListItem(S, "aboutPage", "About page"),
              singletonListItem(S, "methodPage", "Method page"),
              singletonListItem(S, "pricePage", "Pricing page"),
              singletonListItem(S, "contactPage", "Contact page"),
              S.documentTypeListItem("service").title("Services"),
              S.documentTypeListItem("locationPage").title("Locations"),
            ]),
        ),
      S.listItem()
        .title("Knowledge Base")
        .child(
          S.list()
            .title("Knowledge Base")
            .items([
              S.documentTypeListItem("pillarPage").title("Pillar pages"),
              S.documentTypeListItem("subtopicPage").title("Subtopics"),
            ]),
        ),
      S.listItem()
        .title("Blog")
        .child(
          S.list()
            .title("Blog")
            .items([S.documentTypeListItem("article").title("Articles")]),
        ),
      S.listItem()
        .title("FAQ")
        .child(
          S.list()
            .title("FAQ")
            .items([
              singletonListItem(S, "faqPage", "FAQ page"),
              S.documentTypeListItem("faqItem").title("Questions"),
            ]),
        ),
      S.divider(),
      singletonListItem(S, "siteSettings", "Settings"),
    ]);
