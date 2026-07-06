import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import {
  aboutPath,
  contactPath,
  faqPath,
  homePath,
  methodPath,
  pricePath,
  type Locale,
} from "@/sanity/paths";
import styles from "./Header.module.scss";

// Nav targets some routes that don't exist until Steps 5/7 — visiting one
// early lands on the site's own localized not-found page (Stage 2 Step 8),
// not a raw error, so the full nav can be shown now rather than growing
// item by item as pages land.
export async function Header({
  locale,
  authorName,
}: {
  locale: Locale;
  authorName: string;
}) {
  const t = await getTranslations({ locale, namespace: "Header" });

  const navItems = [
    { href: homePath(locale), label: t("nav.home") },
    { href: aboutPath(locale), label: t("nav.about") },
    { href: methodPath(locale), label: t("nav.method") },
    { href: pricePath(locale), label: t("nav.price") },
    { href: faqPath(locale), label: t("nav.faq") },
    { href: contactPath(locale), label: t("nav.contact") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={homePath(locale)} className={styles.logo}>
          {authorName}
        </Link>

        <MobileNav toggleLabel={t("menuToggle")}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MobileNav>

        <div className={styles.actions}>
          <LocaleSwitcher currentLocale={locale} />
          <ButtonLink href={contactPath(locale)} variant="solid">
            {t("cta")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
