import type { StructureBuilder, StructureResolver } from "sanity/structure";

// Singletons: exactly one document PER LANGUAGE, linked as an it/en
// translation pair by @sanity/document-internationalization. Fixed pane
// _id convention: `${typeId}-${language}` (e.g. "homePage-it",
// "homePage-en"), established here for Step 9's seed script to follow.
export const SINGLETON_TYPES = new Set([
  "siteSettings",
  // CMS-driven header/footer pass: two new singletons, pinned under the
  // desk's own "Settings" group alongside siteSettings (see `structure`
  // below) — same singleton-pane/no-delete-or-duplicate treatment as
  // every other entry in this set.
  "headerSettings",
  "footerSettings",
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
  // CMS-wiring pass: homepage's shared content types (sede/diploma) — plain
  // list types, not singleton/protected (no "exactly N" constraint), but
  // still it/en pairs via the same mechanism as article/service.
  "sede",
  "diploma",
  // Diplomi rebuild pass — replaced diploma's own role for the homepage
  // card row, itself now superseded by homePage.diplomi.items (owner call,
  // homePage-array migration pass) and hidden in Studio; kept here only so
  // its existing (orphaned, not deleted) it/en document pairs stay valid.
  "qualification",
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
              S.documentTypeListItem("sede").title("Sedi (homepage)"),
              S.documentTypeListItem("diploma").title("Diplomas"),
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
      // CMS-driven header/footer pass: grouped under one "Settings" desk
      // item (was a single siteSettings pane before) — same fixed-pane,
      // no-delete-or-duplicate singleton treatment, per document, via
      // singletonListItem, unchanged.
      S.listItem()
        .title("Settings")
        .child(
          S.list()
            .title("Settings")
            .items([
              singletonListItem(S, "siteSettings", "Site settings"),
              singletonListItem(S, "headerSettings", "Header"),
              singletonListItem(S, "footerSettings", "Footer"),
            ]),
        ),
    ]);
