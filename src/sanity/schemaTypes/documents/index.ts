import { aboutPage } from "./aboutPage";
import { article } from "./article";
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
];
