import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactElement } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { resolveNavItems } from "./headerNavItems";
import { Logo } from "./Logo";
import { whatsappUrl } from "@/sanity/contact";
import type { Locale } from "@/sanity/paths";
import { getFooterSettings } from "@/sanity/seo";
import type {
  ContactChannel,
  ResolvedLogo,
  SocialLinks,
} from "@/sanity/seo";
import styles from "./Footer.module.scss";

// Footer social icons pass: fixed display order regardless of which
// fields are filled in Studio (per spec) — a plain array literal, walked
// once per render and filtered to whichever URLs are actually set. Icons
// are fixed code assets (components/icons/social/), not CMS-managed;
// only the URL + accessible label live here.
const SOCIAL_ICONS: {
  key: keyof SocialLinks;
  label: string;
  Icon: () => ReactElement;
}[] = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "whatsapp", label: "WhatsApp", Icon: WhatsappIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
];

interface SedeAddress {
  centerName?: string;
  address: string;
}

interface SedeDoc {
  _id: string;
  city: string;
  isOnline?: boolean;
  onlineLine?: string;
  addresses?: SedeAddress[];
}

// CMS-driven header/footer pass: nav (Esplora + Legale columns), column
// headings, and the two social/Google link labels now come from the new
// footerSettings singleton (fetched here, colocated — same reasoning as
// Header.tsx's own getHeaderSettings). Addresses come from `sede` docs
// (same source the homepage's own Sedi section uses — see this pass's own
// report on why this replaces the old, unpublished locationPage query).
// authorName/authorCredentials/authorRegistrationNumber/contactChannels/
// piva/crisisSupportText/googleProfileUrl/socialLinks/logo all stay
// siteSettings-sourced props from layout.tsx, unchanged. The developer
// credit is NOT a footerSettings field — hardcoded below, per spec
// ("must not be editable or deletable via CMS").
export async function Footer({
  locale,
  authorName,
  logo,
  authorCredentials,
  authorRegistrationNumber,
  contactChannels,
  piva,
  sedes,
  crisisSupportText,
  googleProfileUrl,
  socialLinks,
}: {
  locale: Locale;
  authorName: string;
  logo?: ResolvedLogo;
  authorCredentials?: string;
  authorRegistrationNumber?: string;
  contactChannels?: ContactChannel[];
  piva?: string;
  sedes: SedeDoc[];
  crisisSupportText?: string;
  googleProfileUrl?: string;
  socialLinks?: SocialLinks;
}) {
  // Only "copyright" (a translated TEMPLATE combining siteSettings'
  // own author name + the computed year with a boilerplate legal phrase)
  // still comes from the message catalog — it isn't "nav labels, CTA
  // text, or column headings" (the categories this pass migrates), and
  // its actual CONTENT (the name) already comes from siteSettings, per
  // this pass's own "do not duplicate data" rule. See this pass's report.
  const t = await getTranslations({ locale, namespace: "Footer" });
  const year = new Date().getFullYear();

  const footerSettings = await getFooterSettings(locale);
  const navItems = resolveNavItems(locale, footerSettings?.navItems);
  const legalNavItems = resolveNavItems(locale, footerSettings?.legalNavItems);
  const columnHeadings = footerSettings?.columnHeadings;

  const socialIcons = SOCIAL_ICONS.filter(({ key }) => socialLinks?.[key]);

  return (
    <footer className={styles.labFooter} data-lab-section="footer" data-lab-footer>
      <div className={styles.labFooterContainer}>
        <div className={styles.labFooterBrand}>
          <div className={styles.labFooterBrandRow}>
            <p className={styles.labFooterWordmark}>
              <Logo logo={logo} authorName={authorName} imageClassName={styles.labFooterLogoImage} />
            </p>
            {socialIcons.length > 0 ? (
              <div className={styles.labFooterSocialRow}>
                {socialIcons.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={socialLinks?.[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={styles.labFooterSocialLink}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <p className={styles.labFooterAlboLine}>
            {authorCredentials ?? "Psicologo Psicoterapeuta"} — Iscrizione all&apos;Albo degli Psicologi della Lombardia n. {authorRegistrationNumber ?? "[segnaposto]"}
          </p>
        </div>

        <div className={styles.labFooterColumns}>
          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {columnHeadings?.explore}
            </p>
            <ul className={styles.labFooterNavList}>
              {navItems.map((item) =>
                item.href ? (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.labFooterLink}>
                      {item.label}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {columnHeadings?.locations}
            </p>
            <div className={styles.labFooterSediList}>
              {sedes.map((sede) => (
                <div key={sede._id} className={styles.labFooterSedeGroup}>
                  <p className={styles.labFooterSedeCityName}>{sede.city}</p>
                  {sede.isOnline
                    ? sede.onlineLine
                      ? <p className={styles.labFooterSediAddress}>{sede.onlineLine}</p>
                      : null
                    : (sede.addresses ?? []).map((addr) => (
                        <p key={addr.address} className={styles.labFooterSediAddress}>
                          {addr.centerName ? `${addr.centerName}, ` : ""}
                          {addr.address}
                        </p>
                      ))}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {columnHeadings?.contact}
            </p>
            <div className={styles.labFooterContactList}>
              {contactChannels
                ?.slice()
                .sort((a, b) => a.order - b.order)
                .map((channel) => {
                  const href =
                    channel.type === "whatsapp"
                      ? whatsappUrl(channel.value)
                      : channel.type === "phone"
                        ? `tel:${channel.value}`
                        : `mailto:${channel.value}`;
                  return (
                    <a
                      key={channel.type}
                      href={href}
                      {...(channel.type === "whatsapp"
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={styles.labFooterContactLine}
                    >
                      {channel.label}
                    </a>
                  );
                })}
              {/* Footer social icons pass — HONESTY-RULE FLAG: this text
                  Instagram link (footerSettings.instagramLabel-driven,
                  predates this pass) now duplicates the same URL shown as
                  an icon in the new top-row social row above. Left
                  untouched deliberately — retiring the footerSettings
                  field is a separate, not-requested schema change with
                  its own blast radius (an editor may already have typed
                  into it); flagged here and in this pass's own report for
                  the owner to decide, not silently removed or kept. */}
              {socialLinks?.instagram && footerSettings?.instagramLabel ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.labFooterContactLine}
                >
                  {footerSettings.instagramLabel}
                </a>
              ) : null}
            </div>
            {googleProfileUrl && footerSettings?.googleProfileLabel ? (
              <a
                href={googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.labFooterGoogleLink}
              >
                {footerSettings.googleProfileLabel}
              </a>
            ) : null}
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              {columnHeadings?.legal}
            </p>
            <ul className={styles.labFooterNavList}>
              {legalNavItems.map((item) =>
                item.href ? (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.labFooterLink}>
                      {item.label}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
            <p className={styles.labFooterPivaLine}>P.IVA {piva ?? "[segnaposto]"}</p>
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
          {/* Static, not a CMS field — per spec, must not be editable or
              deletable via Studio. Only "Bandziuk" itself is the link. */}
          <p className={styles.labFooterDevCredit}>
            Developed by{" "}
            <a
              href="https://www.bandziuk.com"
              target="_blank"
              rel="noopener"
              className={styles.labFooterDevCreditLink}
            >
              Bandziuk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
