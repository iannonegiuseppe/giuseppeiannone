import { aboutPage } from "./aboutPage";
import { area } from "./area";
import { areeSection } from "./areeSection";
import { article } from "./article";
import { blogCategory } from "./blogCategory";
import { blogIndexSection } from "./blogIndexSection";
import { chiSonoSection } from "./chiSonoSection";
import { contactPage } from "./contactPage";
import { cookiePolicyPage } from "./cookiePolicyPage";
import { ctaBridgeSection } from "./ctaBridgeSection";
import { diploma } from "./diploma";
import { faqItem } from "./faqItem";
import { faqPage } from "./faqPage";
import { footerSettings } from "./footerSettings";
import { headerSettings } from "./headerSettings";
import { homePage } from "./homePage";
import { libriPage } from "./libriPage";
import { locationPage } from "./locationPage";
import { methodPage } from "./methodPage";
import { milanPage } from "./milanPage";
import { monzaPage } from "./monzaPage";
import { onlineTherapyPage } from "./onlineTherapyPage";
import { page } from "./page";
import { pillarPage } from "./pillarPage";
import { pricePage } from "./pricePage";
import { privacyPage } from "./privacyPage";
import { qualification } from "./qualification";
import { sede } from "./sede";
import { service } from "./service";
import { siteSettings } from "./siteSettings";
import { subtopicPage } from "./subtopicPage";

export const documentTypes = [
  // Singletons
  siteSettings,
  // CMS-driven header/footer pass: two new singletons, grouped with
  // siteSettings under desk structure's "Settings" group.
  headerSettings,
  footerSettings,
  homePage,
  aboutPage,
  methodPage,
  pricePage,
  faqPage,
  contactPage,
  // Privacy/cookie policy pass: two more defineSimplePageType singletons
  // (title + lastUpdated + body + seo — see simplePage.ts's own comment on
  // withLastUpdated), grouped with the other singleton pages above rather
  // than with knowledge-base content below.
  privacyPage,
  cookiePolicyPage,
  // Libri build pass — grows out of defineSimplePageType the same way
  // pricePage/contactPage do (see libriPage.ts's own comment); grouped
  // with the other singleton content pages above.
  libriPage,
  // City/online pages pass — three bespoke singleton types, same
  // treatment as methodPage above (see milanPage.ts's own comment for
  // why each gets its own type rather than a shared/reorderable one).
  milanPage,
  monzaPage,
  onlineTherapyPage,
  // Chi sono section pass: homepage teaser singleton (own structured
  // fields, not defineSimplePageType) — see its own file's comment for
  // why it supersedes homePage.chiSono/ChiSonoOverlap.tsx instead of
  // reusing them.
  chiSonoSection,
  // Aree section pass: header-copy singleton for the intervention-area
  // list — see its own file's comment for why it supersedes
  // homePage.diCosa/ConcernsSection.tsx instead of reusing them.
  areeSection,
  // CTA bridge pass: quiet mid-page link to the contact section, between
  // Aree and Diplomi — see its own file's comment.
  ctaBridgeSection,
  // Blog index redesign pass: hero + closing editorial copy for /blog —
  // see its own file's comment for why "editorial" is a narrower portable
  // text array than the shared `portableText` object type.
  blogIndexSection,
  // Exactly two: Milan, Monza (protected like singletons in Step 7)
  locationPage,
  // Root-namespace pass: the universal page type — see its own file's
  // comment. Registered near pillarPage/locationPage since all three are
  // "a document that is a real page," not because it shares their
  // protection/singleton status (it doesn't).
  page,
  // Knowledge base / content
  pillarPage,
  subtopicPage,
  article,
  // Blog category-chip pass (round 2) — a /blog-only taxonomy, deliberately
  // separate from pillarPage (see blogCategory.ts's own comment for the
  // "what I treat" vs "what I have written about" distinction).
  blogCategory,
  service,
  faqItem,
  // CMS-wiring pass: homepage's shared content, fetched directly by type
  sede,
  diploma,
  // Diplomi rebuild pass — replaced `diploma` above for the card-row +
  // lightbox composition; itself now superseded by homePage.diplomi.items
  // (owner call, homePage-array migration pass) and marked `hidden` in its
  // own schema file. Left registered for the same reason `diploma` above
  // is: existing documents are a disclosed orphan, not deleted, and stay
  // valid/reachable rather than removed from Studio out from under them.
  qualification,
  // Aree section pass: plain list type, one document per intervention
  // area — see its own file's comment for why it's a separate document
  // type rather than an array field.
  area,
];
