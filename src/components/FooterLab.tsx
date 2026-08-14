import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactElement } from "react";
import { CookiePreferencesLink } from "@/components/CookiePreferencesLink";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { resolveNavItems } from "@/components/headerNavItems";
import { FullLockupMark } from "@/components/Logo";
import { whatsappUrl } from "@/sanity/contact";
import type { Locale } from "@/sanity/paths";
import { getFooterSettings } from "@/sanity/seo";
import type { ContactChannel, EmergencyContact, SocialLinks } from "@/sanity/seo";
import styles from "./footerLab.module.scss";

// Fork of src/components/Footer.tsx — "Footer, dark, on the lighter
// green" pass. The real Footer.tsx/.module.scss are shared with
// production and stay untouched (verified empty git diff, see this
// pass's own report). DOM/data logic mirrors the original; what changed
// is the surface (now tone-mid, applied by the wrapping .toneMidWrap div
// in DesignLabHomepage.tsx, not this file), the four-column hierarchy,
// the merged emergency+bottom-bar row, and the new emergencyContacts ->
// real tel: links. crisisSupportText itself renders exactly as authored,
// unparsed — the structured contacts are a separate, additive field
// (siteSettings.ts), not extracted from the prose.

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

// tel: hrefs need bare digits (+ leading +) — the LABEL/visible text
// keeps the number exactly as authored in Sanity (e.g. "02 2327 2327"),
// only the href strips formatting. Not a parse of free text: `number`
// is already a single, structured field with nothing else in it.
function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export async function FooterLab({
  locale,
  authorName,
  authorCredentials,
  authorRegistrationNumber,
  contactChannels,
  piva,
  sedes,
  crisisSupportText,
  emergencyContacts,
  googleProfileUrl,
  socialLinks,
}: {
  locale: Locale;
  authorName: string;
  authorCredentials?: string;
  authorRegistrationNumber?: string;
  contactChannels?: ContactChannel[];
  piva?: string;
  sedes: SedeDoc[];
  crisisSupportText?: string;
  emergencyContacts?: EmergencyContact[];
  googleProfileUrl?: string;
  socialLinks?: SocialLinks;
}) {
  const t = await getTranslations({ locale, namespace: "Footer" });
  const year = new Date().getFullYear();

  const footerSettings = await getFooterSettings(locale);
  const navItems = resolveNavItems(locale, footerSettings?.navItems);
  const legalNavItems = resolveNavItems(locale, footerSettings?.legalNavItems);
  const columnHeadings = footerSettings?.columnHeadings;

  const socialIcons = SOCIAL_ICONS.filter(({ key }) => socialLinks?.[key]);

  return (
    <footer className={styles.footer} data-lab-section="footer" data-lab-footer>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.brandRow}>
            <p className={styles.wordmark}>
              <FullLockupMark className={styles.logoImage} />
            </p>
            {socialIcons.length > 0 ? (
              <div className={styles.socialRow}>
                {socialIcons.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={socialLinks?.[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={styles.socialLink}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <p className={styles.alboLine}>
            {authorCredentials ?? "Psicologo Psicoterapeuta"} — Iscrizione all&apos;Albo degli Psicologi della Lombardia n. {authorRegistrationNumber ?? "[segnaposto]"}
          </p>
        </div>

        <div className={styles.columns}>
          <div className={styles.columnEsplora}>
            <p className={styles.kicker}>
              <span className={styles.kickerRule} aria-hidden="true" />
              {columnHeadings?.explore}
            </p>
            <ul className={styles.navList}>
              {navItems.map((item) =>
                item.href ? (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.link}>
                      {item.label}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>

          <div className={styles.columnSedi}>
            <p className={styles.kicker}>
              <span className={styles.kickerRule} aria-hidden="true" />
              {columnHeadings?.locations}
            </p>
            <div className={styles.sediList}>
              {sedes.map((sede) => (
                <div key={sede._id} className={styles.sedeGroup}>
                  <p className={styles.sedeCityName}>{sede.city}</p>
                  {sede.isOnline
                    ? sede.onlineLine
                      ? <p className={styles.sediAddress}>{sede.onlineLine}</p>
                      : null
                    : (sede.addresses ?? []).map((addr) => (
                        <p key={addr.address} className={styles.sediAddress}>
                          {addr.centerName ? `${addr.centerName}, ` : ""}
                          {addr.address}
                        </p>
                      ))}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.columnContatti}>
            <p className={styles.kicker}>
              <span className={styles.kickerRule} aria-hidden="true" />
              {columnHeadings?.contact}
            </p>
            <div className={styles.contactList}>
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
                      className={styles.contactLine}
                    >
                      {channel.label}
                    </a>
                  );
                })}
              {socialLinks?.instagram && footerSettings?.instagramLabel ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLine}
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
                className={styles.googleLink}
              >
                {footerSettings.googleProfileLabel}
              </a>
            ) : null}
          </div>

          <div className={styles.columnLegale}>
            <p className={styles.kicker}>
              <span className={styles.kickerRule} aria-hidden="true" />
              {columnHeadings?.legal}
            </p>
            <ul className={styles.navList}>
              {legalNavItems.map((item) =>
                item.href ? (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.linkMuted}>
                      {item.label}
                    </Link>
                  </li>
                ) : null,
              )}
              {/* Privacy/cookie policy pass — plain hardcoded stub, not a
                  CMS legalNavItems entry: that schema's navLink object has
                  no free-text URL field (deliberately, so an editor can
                  never author a broken link — see navLink.ts's own
                  comment), so it structurally cannot represent an in-page
                  action rather than a URL. Opens CookieConsentBanner
                  (rendered once at layout level) via the shared consent
                  module — see CookiePreferencesLink.tsx. */}
              <li>
                <CookiePreferencesLink label={t("cookiePreferences")} className={styles.linkMuted} />
              </li>
            </ul>
            <p className={styles.pivaLine}>P.IVA {piva ?? "[segnaposto]"}</p>
          </div>
        </div>
      </div>

      <div className={styles.lowerBand}>
        <div className={styles.lowerBandInner}>
          {crisisSupportText ? (
            <div className={styles.emergency}>
              <p className={styles.emergencyText}>{crisisSupportText}</p>
              {emergencyContacts && emergencyContacts.length > 0 ? (
                <ul className={styles.emergencyContacts}>
                  {emergencyContacts.map((contact) => (
                    <li key={contact.label}>
                      <a href={telHref(contact.number)} className={styles.emergencyContactLink}>
                        <span className={styles.emergencyContactLabel}>{contact.label}</span>
                        <span className={styles.emergencyContactNumber}>{contact.number}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <div className={styles.bottomBar}>
            <p className={styles.copyright}>
              {t("copyright", { year, name: authorName })}
            </p>
            <p className={styles.localeSwitcher}>
              <LocaleSwitcher currentLocale={locale} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
