import type { StructureBuilder, StructureResolver } from "sanity/structure";

// Singletons: exactly one document, fixed _id equal to the type name.
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

function singletonListItem(S: StructureBuilder, typeId: string, title: string) {
  return S.listItem()
    .id(typeId)
    .title(title)
    .child(S.document().schemaType(typeId).documentId(typeId));
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
            .items([
              S.documentTypeListItem("article").title("Articles"),
              S.documentTypeListItem("author").title("Authors"),
            ]),
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
