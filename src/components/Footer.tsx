import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { cookiePolicyPath, privacyPath, type Locale } from "@/sanity/paths";
import styles from "./Footer.module.scss";

interface FooterLocation {
  title: string;
  address?: string;
}

export async function Footer({
  locale,
  contactEmail,
  contactPhone,
  locations,
  crisisSupportText,
  googleProfileUrl,
}: {
  locale: Locale;
  contactEmail?: string;
  contactPhone?: string;
  locations: FooterLocation[];
  // Optional here even though the schema requires it (Stage 3 Step 4) —
  // a document published before the field existed won't have it; the
  // footer omits the line rather than rendering an empty one.
  crisisSupportText?: string;
  googleProfileUrl?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <p className={styles.heading}>{t("contactHeading")}</p>
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`} className={styles.link}>
              {contactEmail}
            </a>
          ) : null}
          {contactPhone ? (
            <a href={`tel:${contactPhone}`} className={styles.link}>
              {contactPhone}
            </a>
          ) : null}
          {googleProfileUrl ? (
            <a
              href={googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {t("googleProfile")}
            </a>
          ) : null}
        </div>

        <div className={styles.column}>
          <p className={styles.heading}>{t("locationsHeading")}</p>
          {locations.map((location) => (
            <p key={location.title} style={{ margin: 0 }}>
              {location.title}
              {location.address ? `, ${location.address}` : null}
            </p>
          ))}
        </div>

        <div className={styles.column}>
          <p className={styles.heading}>{t("legalHeading")}</p>
          <Link href={privacyPath(locale)} className={styles.link}>
            {t("privacy")}
          </Link>
          <Link href={cookiePolicyPath(locale)} className={styles.link}>
            {t("cookiePolicy")}
          </Link>
        </div>
      </div>

      {crisisSupportText ? (
        <div className={styles.crisis}>
          <p className={styles.crisisText}>{crisisSupportText}</p>
        </div>
      ) : null}
    </footer>
  );
}
