import { aboutPage } from "./aboutPage";
import { area } from "./area";
import { areeSection } from "./areeSection";
import { article } from "./article";
import { chiSonoSection } from "./chiSonoSection";
import { contactPage } from "./contactPage";
import { diploma } from "./diploma";
import { faqItem } from "./faqItem";
import { faqPage } from "./faqPage";
import { footerSettings } from "./footerSettings";
import { headerSettings } from "./headerSettings";
import { homePage } from "./homePage";
import { locationPage } from "./locationPage";
import { methodPage } from "./methodPage";
import { pillarPage } from "./pillarPage";
import { pricePage } from "./pricePage";
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
  // Chi sono section pass: homepage teaser singleton (own structured
  // fields, not defineSimplePageType) — see its own file's comment for
  // why it supersedes homePage.chiSono/ChiSonoOverlap.tsx instead of
  // reusing them.
  chiSonoSection,
  // Aree section pass: header-copy singleton for the intervention-area
  // list — see its own file's comment for why it supersedes
  // homePage.diCosa/ConcernsSection.tsx instead of reusing them.
  areeSection,
  // Exactly two: Milan, Monza (protected like singletons in Step 7)
  locationPage,
  // Knowledge base / content
  pillarPage,
  subtopicPage,
  article,
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
