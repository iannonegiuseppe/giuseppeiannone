import { aboutPage } from "./aboutPage";
import { article } from "./article";
import { author } from "./author";
import { contactPage } from "./contactPage";
import { faqItem } from "./faqItem";
import { faqPage } from "./faqPage";
import { homePage } from "./homePage";
import { locationPage } from "./locationPage";
import { methodPage } from "./methodPage";
import { pillarPage } from "./pillarPage";
import { pricePage } from "./pricePage";
import { service } from "./service";
import { siteSettings } from "./siteSettings";
import { subtopicPage } from "./subtopicPage";

export const documentTypes = [
  // Singletons
  siteSettings,
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
  author,
];
