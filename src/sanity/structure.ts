import type { StructureBuilder, StructureResolver } from "sanity/structure";
import type { StructureResolverContext } from "sanity/structure";

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
  // Privacy/cookie policy pass: two more singleton pages, unlike aboutPage
  // (see this file's own "aboutPage: LEFT UNLISTED" comment below) — these
  // ARE the live routes (/privacy, /cookie-policy), so they get the same
  // singleton-pane/no-delete-or-duplicate/visible-in-Pages treatment as
  // methodPage/pricePage/contactPage/faqPage, not aboutPage's hidden one.
  "privacyPage",
  "cookiePolicyPage",
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
const API_VERSION = "2026-07-05";

function singletonListItem(S: StructureBuilder, typeId: string, title: string) {
  return S.listItem()
    .id(typeId)
    .title(title)
    .child(S.document().schemaType(typeId).documentId(`${typeId}-${DEFAULT_LOCALE}`));
}

// Desk consolidation pass — same "fixed pane, bootstraps its own first
// document" mechanism as singletonListItem above, generalized to an
// explicit document id rather than always assuming `${typeId}-it`. Used
// below for locationPage, which needs TWO fixed panes (Milan, Monza),
// not one — singletonListItem can't express that (it hardcodes exactly
// one id per type). Pointing at an id that doesn't exist yet is not a
// write: Sanity shows an empty, pre-addressed create form, exactly how
// methodPage/pricePage/contactPage/faqPage already bootstrap today with
// zero documents (verified — count() was 0 for all four before this
// pass, and they already work this way).
function fixedDocListItem(
  S: StructureBuilder,
  typeId: string,
  docId: string,
  title: string,
) {
  return S.listItem()
    .id(docId)
    .title(title)
    .child(S.document().schemaType(typeId).documentId(docId));
}

// Desk consolidation pass — a pillar's own row in Pages. Resolves to its
// ITALIAN document by fixed id (see "Locale pairing" note below for why),
// using S.documentListItem so the row's own label/media always tracks
// that document's current title field live — unlike singletonListItem's
// hardcoded string, this drifts correctly if Giuseppe ever renames a
// pillar's title in Studio, with nothing here to keep in sync by hand.
//
// The child pane is overridden (not the default "open the document
// editor" a bare documentListItem would give) to an ASYNC list: "Edit
// page" first, then — only when at least one exists — a divider and one
// row per subtopicPage whose `parentPillar` reference points at this
// exact document. This is the reference-driven nesting from the Stage 1
// report: no new field, resolved at render time via a live GROQ query
// (a read, not a write) against `parentPillar._ref`. Every pillar gets
// this identical treatment, including the four with zero subtopics today
// (relazioni/sessuali/stress/trauma) — their pane is just "Edit page"
// alone, no divider — so nothing here needs touching again the day a
// subtopic gets added under one of them; the query already covers it.
//
// Click budget: Pages → area row → "Edit page" (or a subtopic row) = 3
// clicks to any editor, same as every other entry in this file.
//
// Subtopic ordering inside the pane is alphabetical by title
// (`order(title asc)`) — the "deliberate order, not alphabetical" brief
// was about the TOP-LEVEL Pages list (Home, then areas, then ordinary
// pages), not about a pillar's own children; alphabetical here needs no
// manual upkeep as subtopics are added, unlike a hardcoded child order
// would.
function pillarWithSubtopics(
  S: StructureBuilder,
  context: StructureResolverContext,
  pillarId: string,
) {
  return S.documentListItem()
    .id(pillarId)
    .schemaType("pillarPage")
    .child(async () => {
      const client = context.getClient({ apiVersion: API_VERSION });
      const subtopics: { _id: string }[] = await client.fetch(
        `*[_type == "subtopicPage" && language == $locale && parentPillar._ref == $pillarId] | order(title asc){ _id }`,
        { locale: DEFAULT_LOCALE, pillarId },
      );

      const items: Parameters<ReturnType<StructureBuilder["list"]>["items"]>[0] = [
        S.listItem()
          .id(`${pillarId}-edit`)
          .title("Edit page")
          .child(S.document().schemaType("pillarPage").documentId(pillarId)),
      ];

      if (subtopics.length > 0) {
        items.push(S.divider());
        for (const subtopic of subtopics) {
          items.push(S.documentListItem().id(subtopic._id).schemaType("subtopicPage"));
        }
      }

      return S.list().title("Area").items(items);
    });
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
// for why (areeSection/ctaBridgeSection: superseded, folded AND hidden).
//
// chiSonoSection correction: the comment above was written for an
// earlier state and is now stale where it names chiSonoSection —
// verified live: chiSonoSection.ts's own `hidden: () => true` was
// already removed in a later "Chi sono build pass" (it's now the real
// source for the live /chi-sono, /en/about-me route), but nobody added
// its list item back to this file, so it stayed unreachable from the
// desk by omission rather than by the hidden flag. Fixed below — Pages
// → "Chi sono" now points at chiSonoSection, the actual live content.
//
// Desk consolidation pass — everything that IS a page (single "Pages"
// group, areas carry their subtopics as children, both locales resolve
// through one Italian row per page — see pillarWithSubtopics/
// fixedDocListItem above) now replaces the old three-way Homepage/Real
// pages/Knowledge Base split. Three deliberate departures from a literal
// carry-over of the old "Real pages" group, each decided with the owner
// before this pass:
//
// - aboutPage: LEFT UNLISTED, same as qualification/area (hidden types
//   below). It's a generic title+body type with zero documents and no
//   route reads it — the live Chi sono content is chiSonoSection, not
//   this. Listing aboutPage would offer Giuseppe a second "About page"
//   that edits nothing real. Not touched at the schema level (still a
//   registered, unhidden type — just never added to this tree), so if a
//   future pass ever wants it back, that's a one-line addition here, not
//   a schema change. VESTIGIAL — do not re-add without first confirming
//   something actually renders it.
// - faqItem ("FAQ questions", 94 documents): moved OUT of Pages and into
//   Reference data below. It has no route and no URL of its own — it's
//   reference data reused by three consumers (pillarPage.faqItems,
//   subtopicPage.faqItems, faqPage.faqs), structurally identical to
//   sede/diploma/service already there. Leaving it in Pages would put 94
//   non-pages inside a group whose entire point is "only pages."
// - locationPage ("Sedi (pagine)", 0 documents today): added near the
//   bottom of Pages, its own nested pane with two FIXED panes (Milan,
//   Monza) via fixedDocListItem, same bootstrap-from-empty mechanism
//   singletonListItem already relies on elsewhere in this file. No
//   locationPage document exists yet and no id convention existed for it
//   before this pass (checked: no seed script, nothing hardcoded
//   anywhere) — "locationPage-milano-it"/"locationPage-monza-it" are
//   PROPOSED here, following the same `{type}-{area}-{locale}` shape
//   already established for pillarPage/subtopicPage during their own
//   rollout. Whichever document actually gets saved through this pane
//   first is what fixes the real id going forward — nothing has been
//   written by this pass. Labelled "Sedi (pagine)", not "Sedi" alone, so
//   it can't be confused with the `sede` reference-data type in the
//   group below (same city information, different type: sede feeds the
//   homepage's map/pins, locationPage is a dedicated per-city page).
//
// Locale pairing: every fixed-id row in Pages (Home page, each area, the
// singleton ordinary pages, Sedi) resolves straight to its ITALIAN
// document — @sanity/document-internationalization does not offer a
// structure-builder API to collapse an it/en pair into one row (checked:
// its plugin config here only wires document-level actions and an
// in-editor language banner), so this is the practical equivalent: one
// row per logical page instead of two, with the plugin's own already-
// installed in-document language switcher reaching the English sibling
// from inside whichever Italian document you open. The one place this
// doesn't apply is `page` (the universal type, "(other pages)" below) —
// it has no fixed, known set of ids to hardcode against (zero documents
// exist today, and future ones are arbitrary), so it stays a genuine
// S.documentTypeListItem, which WILL show it/en siblings as flat rows
// once real `page` documents exist. FUTURE WORK, not built here (nothing
// to build against zero documents): swap it for
// S.documentList().filter('_type == "page" && language == "it"') the
// same way, once that type actually has content worth de-duplicating.
//
// Create-button labels: the global "+ New document" button (top nav,
// untouched by this pass) already lists every creatable type — a scoped
// "+" specific to the Pages pane isn't something a manually-composed
// S.list() gets for free in structure builder (only a single-type list
// gets an automatic create button), and building one would mean going
// beyond this file. Client-facing labels the owner approved and wants on
// record for whenever the underlying schema titles are next touched for
// another reason (NOT applied here — Stage 2 of this pass is
// structure.ts only, and a schema `title:` edit is out of scope):
//   pillarPage   "Pillar page"   -> "Area page"
//   subtopicPage "Subtopic page" -> "Sub-area page"
//   page         "Page"          -> "Simple page"
//   faqItem      "FAQ item"      -> "FAQ question"
export const structure: StructureResolver = (S, context) =>
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
              pillarWithSubtopics(S, context, "pillarPage-anxiety-it"),
              pillarWithSubtopics(S, context, "pillarPage-panic-it"),
              pillarWithSubtopics(S, context, "pillarPage-relazioni-it"),
              pillarWithSubtopics(S, context, "pillarPage-sessuali-it"),
              pillarWithSubtopics(S, context, "pillarPage-stress-it"),
              pillarWithSubtopics(S, context, "pillarPage-trauma-it"),
              singletonListItem(S, "chiSonoSection", "Chi sono"),
              singletonListItem(S, "methodPage", "Metodo"),
              singletonListItem(S, "pricePage", "Prezzi"),
              singletonListItem(S, "contactPage", "Contatti"),
              singletonListItem(S, "faqPage", "FAQ"),
              singletonListItem(S, "privacyPage", "Privacy"),
              singletonListItem(S, "cookiePolicyPage", "Cookie policy"),
              S.listItem()
                .title("Sedi (pagine)")
                .child(
                  S.list()
                    .title("Sedi (pagine)")
                    .items([
                      fixedDocListItem(S, "locationPage", "locationPage-milano-it", "Milano"),
                      fixedDocListItem(S, "locationPage", "locationPage-monza-it", "Monza"),
                    ]),
                ),
              S.documentTypeListItem("page").title("Altre pagine"),
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
      // a dedicated per-city PAGE (Pages, above). Easy to confuse by
      // name, deliberately filed apart by what each one is. faqItem
      // joins this group as of this pass (see the comment block above
      // this resolver for why it moved out of Pages).
      S.listItem()
        .title("Reference data")
        .child(
          S.list()
            .title("Reference data")
            .items([
              S.documentTypeListItem("sede").title("Sedi"),
              S.documentTypeListItem("diploma").title("Diplomi"),
              S.documentTypeListItem("service").title("Services"),
              S.documentTypeListItem("faqItem").title("FAQ questions"),
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
