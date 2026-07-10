import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { whatsappUrl } from "@/sanity/contact";
import {
  aboutPath,
  articlesPath,
  contactPath,
  cookiePolicyPath,
  faqPath,
  homePath,
  methodPath,
  pricePath,
  privacyPath,
  type Locale,
} from "@/sanity/paths";
import type { SocialLinks } from "@/sanity/seo";
import styles from "./Footer.module.scss";

interface FooterLocation {
  title: string;
  address?: string;
}

// Promoted from design-lab's own DesignLabFooter.tsx (brand block, 4-
// column layout, emergency notice, bottom bar with copyright + locale
// switcher). Keeps this file's own pre-existing Sanity/i18n-driven props
// unchanged — contactEmail/contactPhone/whatsappNumber/locations/
// crisisSupportText/googleProfileUrl/socialLinks were already real,
// working wiring before this pass touched anything, so they're re-skinned
// here, not replaced with the lab's own hardcoded placeholders (which
// would have been a regression). authorName is new — reuses the SAME
// siteSettings.author.name layout.tsx already fetches for Header, not a
// new CMS query. The Albo/credentials line stays hardcoded IT placeholder
// text, matching the rest of this pass's hardcoded-content composition
// (adding real credentials/registrationNumber wiring here specifically
// would be new CMS plumbing, out of scope this pass).
export async function Footer({
  locale,
  authorName,
  contactEmail,
  contactPhone,
  whatsappNumber,
  locations,
  crisisSupportText,
  googleProfileUrl,
  socialLinks,
}: {
  locale: Locale;
  authorName: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  locations: FooterLocation[];
  // Optional here even though the schema requires it (Stage 3 Step 4) —
  // a document published before the field existed won't have it; the
  // footer omits the line rather than rendering an empty one.
  crisisSupportText?: string;
  googleProfileUrl?: string;
  socialLinks?: SocialLinks;
}) {
  const t = await getTranslations({ locale, namespace: "Footer" });
  // Reuses Header's own nav labels for the items this column shares with
  // it (Chi sono/Metodo/Prezzi/FAQ/Contatti), rather than duplicating a
  // second translated copy that could drift — "Home" and "Risorse" are
  // footer-only additions the header doesn't need (its wordmark already
  // links home; "Aree" replaces a flat Risorse link there).
  const tHeader = await getTranslations({ locale, namespace: "Header" });
  const year = new Date().getFullYear();

  const navItems = [
    { href: homePath(locale), label: tHeader("nav.home") },
    { href: aboutPath(locale), label: tHeader("nav.about") },
    { href: methodPath(locale), label: tHeader("nav.method") },
    { href: pricePath(locale), label: tHeader("nav.price") },
    { href: articlesPath(locale), label: t("resourcesLabel") },
    { href: faqPath(locale), label: tHeader("nav.faq") },
    { href: contactPath(locale), label: tHeader("nav.contact") },
  ];

  return (
    <footer className={styles.labFooter} data-lab-section="footer" data-lab-footer>
      <div className={styles.labFooterContainer}>
        <div className={styles.labFooterBrand}>
          <p className={styles.labFooterWordmark}>{authorName}</p>
          <p className={styles.labFooterAlboLine}>
            Psicologo Psicoterapeuta — Iscrizione all&apos;Albo degli Psicologi della Lombardia n. [segnaposto]
          </p>
        </div>

        <div className={styles.labFooterColumns}>
          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {t("exploreHeading")}
            </p>
            <ul className={styles.labFooterNavList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.labFooterLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {t("locationsHeading")}
            </p>
            <div className={styles.labFooterSediList}>
              {locations.map((location) => (
                <p key={location.title} className={styles.labFooterSediAddress}>
                  {location.title}
                  {location.address ? `, ${location.address}` : null}
                </p>
              ))}
            </div>
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {t("contactHeading")}
            </p>
            <div className={styles.labFooterContactList}>
              {contactEmail ? (
                <a href={`mailto:${contactEmail}`} className={styles.labFooterContactLine}>
                  {contactEmail}
                </a>
              ) : null}
              {contactPhone ? (
                <a href={`tel:${contactPhone}`} className={styles.labFooterContactLine}>
                  {contactPhone}
                </a>
              ) : null}
              {whatsappNumber ? (
                <a
                  href={whatsappUrl(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.labFooterContactLine}
                >
                  {t("whatsapp")}
                </a>
              ) : null}
              {socialLinks?.instagram ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.labFooterContactLine}
                >
                  {t("instagram")}
                </a>
              ) : null}
            </div>
            {googleProfileUrl ? (
              <a
                href={googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.labFooterGoogleLink}
              >
                {t("googleProfile")}
              </a>
            ) : null}
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {t("legalHeading")}
            </p>
            <ul className={styles.labFooterNavList}>
              <li>
                <Link href={privacyPath(locale)} className={styles.labFooterLink}>
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href={cookiePolicyPath(locale)} className={styles.labFooterLink}>
                  {t("cookiePolicy")}
                </Link>
              </li>
            </ul>
            <p className={styles.labFooterPivaLine}>P.IVA [segnaposto]</p>
          </div>
        </div>
      </div>

      {crisisSupportText ? (
        <div className={styles.labFooterEmergencyWrap}>
          <div className={styles.labFooterEmergency}>
            <p className={styles.labFooterEmergencyText}>{crisisSupportText}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.labFooterBottomBarWrap}>
        <div className={styles.labFooterBottomBar}>
          <p className={styles.labFooterCopyright}>
            {t("copyright", { year, name: authorName })}
          </p>
          <p className={styles.labFooterLocaleSwitcher}>
            <LocaleSwitcher currentLocale={locale} />
          </p>
          {/* Final anchor text/href pending the development contract —
              placeholder label only, per spec. */}
          <a href="#" className={styles.labFooterDevCredit}>
            {t("devCredit")}
          </a>
        </div>
      </div>
    </footer>
  );
}
