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
  // Chi sono section pass: homepage teaser singleton — see its own
  // schema file's comment for why it's a standalone type rather than a
  // homePage field group.
  "chiSonoSection",
  // Aree section pass: same reasoning, header copy only — the area rows
  // themselves are the separate `area` list type below.
  "areeSection",
  // CTA bridge pass: quiet mid-page link to the contact section.
  "ctaBridgeSection",
  // Blog index redesign pass: /blog listing's own hero + editorial copy.
  "blogIndexSection",
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
  // Root-namespace pass: the universal page type — plain list type, not
  // protected/singleton, same it/en pairing mechanism as pillarPage.
  "page",
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
  // Aree section pass: one row per intervention area, plain list type.
  "area",
]);

const DEFAULT_LOCALE = "it";

function singletonListItem(S: StructureBuilder, typeId: string, title: string) {
  return S.listItem()
    .id(typeId)
    .title(title)
    .child(S.document().schemaType(typeId).documentId(`${typeId}-${DEFAULT_LOCALE}`));
}

// Root-namespace pass — desk restructure, organized by what each thing
// IS rather than where it happened to be added over time. The old flat
// "Pages" group mixed three different kinds of thing (real pages,
// homepage fragments, entity collections) under one label; Giuseppe
// would look for his homepage text under "Home page" and not find it.
// This is a desk-only change: it edits which branch of this file's own
// tree a type's list item appears under, never a document's `_id` or any
// field.
//
// Homepage-fold pass (later): areeSection/ctaBridgeSection folded into
// homePage as field groups and chiSonoSection hidden outright — all
// three removed from this file's Homepage group as a result. Their
// schema types are now `hidden: () => true` (same mechanism
// `qualification` already used), so — unlike the root-namespace pass
// above, which only ever moved list items between branches of this same
// tree — these three are no longer reachable through normal desk
// browsing at all, only via Vision or a direct document URL. Their
// documents and data are untouched; see each schema file's own comment
// for why (chiSonoSection: irreplaceable copy, hidden not folded;
// areeSection/ctaBridgeSection: superseded, folded AND hidden).
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Homepage-fold pass: areeSection and ctaBridgeSection folded into
      // homePage as field groups (Aree section / CTA bridge, inside Home
      // page's own edit form) — their old standalone list items removed
      // from here. chiSonoSection was ALSO removed from this group, not
      // folded: hidden from the desk entirely now (schema hidden: true,
      // same as qualification), reachable only via Vision/a direct
      // document URL — its five paragraphs are Giuseppe's own writing,
      // kept intact for the future Chi sono page, just no longer listed
      // anywhere in this tree.
      //
      // Area-fold pass (later): `area` folded too — its 6+6 rows now
      // live inside homePage.aree.items, editable alongside the Aree
      // section's own kicker/title/intro in the same document (see
      // homePage.ts's own schema comment for why folding cost nothing —
      // slug was empty on all 12 documents and backed by no route). Its
      // list item removed from here the same way; the type itself is now
      // `hidden: () => true`, same mechanism as the other three. This
      // group now contains exactly Home page — nothing else.
      S.listItem()
        .title("Homepage")
        .child(
          S.list()
            .title("Homepage")
            .items([singletonListItem(S, "homePage", "Home page")]),
        ),
      // Real pages: every document type whose job is to BE a page with
      // its own URL. FAQ page + its questions nest together, same
      // "root + its dependent list" shape Homepage uses above (questions
      // only ever feed faqPage.faqs, unlike Sedi/Diplomi/Services, which
      // are genuinely reused elsewhere — see Reference data below).
      // `page` is the new universal type (Step 4 of this pass) — a plain
      // list here, not a singleton, since there can be any number of them.
      S.listItem()
        .title("Real pages")
        .child(
          S.list()
            .title("Real pages")
            .items([
              singletonListItem(S, "aboutPage", "About page"),
              singletonListItem(S, "methodPage", "Method page"),
              singletonListItem(S, "pricePage", "Pricing page"),
              singletonListItem(S, "contactPage", "Contact page"),
              singletonListItem(S, "faqPage", "FAQ page"),
              S.documentTypeListItem("faqItem").title("FAQ questions"),
              S.documentTypeListItem("locationPage").title("Locations (Milan, Monza)"),
              S.documentTypeListItem("page").title("Pages"),
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
              singletonListItem(S, "blogIndexSection", "Blog index (hero + editorial)"),
              S.documentTypeListItem("article").title("Articles"),
            ]),
        ),
      // Reference data: entities reused across other content rather than
      // pages in their own right. sede != locationPage — sede feeds the
      // homepage's Sedi scene (city/addresses/map pins); locationPage is
      // a dedicated per-city PAGE (Real pages, above). Easy to confuse by
      // name, deliberately filed apart by what each one is.
      S.listItem()
        .title("Reference data")
        .child(
          S.list()
            .title("Reference data")
            .items([
              S.documentTypeListItem("sede").title("Sedi"),
              S.documentTypeListItem("diploma").title("Diplomi"),
              S.documentTypeListItem("service").title("Services"),
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
