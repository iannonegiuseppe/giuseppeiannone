import Link from "next/link";
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
import { sedeScenes } from "./sediData";
import styles from "./design-lab.module.scss";

// Single-block pass: the final Group B block. This is NOT src/components/
// Footer.tsx — that's the real, shared, production component (rendered
// by the root layout on every route including this lab page) and is
// explicitly out of scope for in-place edits this pass. This is a new,
// design-lab-only component previewing what that footer should become;
// promoting it to the shared Footer.tsx is a production-merge step, not
// part of this pass. Because layout.tsx renders the real Footer
// unconditionally after {children}, both footers are visible on this lab
// page during review — the real one (unchanged, still no copyright line,
// still its own emergency notice) sits below this preview. Flagged in
// the pass's final report, not hidden.

// Design-lab-only IT/EN link pair — deliberately NOT the real
// LocaleSwitcher.tsx component. That component resolves arbitrary
// pillar/subtopic pages via a <link rel="alternate"> tag this page's own
// metadata never sets (design-lab isn't a real indexed route), so it
// would silently fall back to linking the HOMEPAGE in the other locale
// instead of this page — wrong for a footer that's supposed to switch
// the page it's actually on. This page's own it/en pair is fixed and
// known, so a plain local version is both simpler and correct here.
function designLabPath(locale: Locale): string {
  return locale === "it" ? "/design-lab" : "/en/design-lab";
}

const NAV_LABELS_IT = {
  home: "Home",
  about: "Chi sono",
  method: "Metodo",
  price: "Prezzi",
  resources: "Risorse",
  faq: "FAQ",
  contact: "Contatti",
};

export function DesignLabFooter({ locale }: { locale: string }) {
  const typedLocale = locale as Locale;
  const year = new Date().getFullYear();

  const navItems = [
    { href: homePath(typedLocale), label: NAV_LABELS_IT.home },
    { href: aboutPath(typedLocale), label: NAV_LABELS_IT.about },
    { href: methodPath(typedLocale), label: NAV_LABELS_IT.method },
    { href: pricePath(typedLocale), label: NAV_LABELS_IT.price },
    { href: articlesPath(typedLocale), label: NAV_LABELS_IT.resources },
    { href: faqPath(typedLocale), label: NAV_LABELS_IT.faq },
    { href: contactPath(typedLocale), label: NAV_LABELS_IT.contact },
  ];

  const otherLocale: Locale = typedLocale === "it" ? "en" : "it";

  return (
    <footer className={styles.labFooter} data-lab-section="footer" data-lab-footer>
      <div className={styles.labFooterContainer}>
        <div className={styles.labFooterBrand}>
          <p className={styles.labFooterWordmark}>Giuseppe Iannone</p>
          <p className={styles.labFooterAlboLine}>
            Psicologo Psicoterapeuta — Iscrizione all&apos;Albo degli Psicologi della Lombardia n. [segnaposto]
          </p>
        </div>

        <div className={styles.labFooterColumns}>
          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              Esplora
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
              Sedi
            </p>
            <div className={styles.labFooterSediList}>
              {sedeScenes.map((scene) => (
                <div key={scene.id} className={styles.labFooterSediCity}>
                  <p className={styles.labFooterSediCityName}>{scene.city}</p>
                  {scene.addresses.length > 0
                    ? scene.addresses.map((addr) => (
                        <p key={addr.address} className={styles.labFooterSediAddress}>
                          {addr.centerName ? `${addr.centerName}, ${addr.address}` : addr.address}
                        </p>
                      ))
                    : (
                        <p className={styles.labFooterSediAddress}>{scene.onlineLine}</p>
                      )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              Contatti
            </p>
            <div className={styles.labFooterContactList}>
              <p className={styles.labFooterContactLine}>[segnaposto — email]</p>
              <p className={styles.labFooterContactLine}>[segnaposto — telefono]</p>
              <p className={styles.labFooterContactLine}>PEC: [segnaposto]</p>
            </div>
            {/* Renders only when siteSettings.googleProfileUrl is set on
                the real site — see FinalContactSection.tsx's own copy of
                this same demoted treatment. */}
            <a href="#" rel="noopener noreferrer" className={styles.labFooterGoogleLink}>
              Trovami su Google
            </a>
          </div>

          <div className={styles.labFooterColumn}>
            <p className={styles.labFooterKicker}>
              <span className={styles.labFooterKickerRule} aria-hidden="true" />
              Legale
            </p>
            <ul className={styles.labFooterNavList}>
              <li>
                <Link href={privacyPath(typedLocale)} className={styles.labFooterLink}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href={cookiePolicyPath(typedLocale)} className={styles.labFooterLink}>
                  Cookie policy
                </Link>
              </li>
            </ul>
            <p className={styles.labFooterPivaLine}>P.IVA [segnaposto]</p>
          </div>
        </div>
      </div>

      {/* Emergency notice — byte-identical to the live crisisSupportText
          content currently rendered by the real Footer (verified against
          the live rendered page, not scripts/seed.ts, which was found to
          hold stale placeholder copy predating a live content edit — see
          the pass's final report). Repositioned per this spec; wording
          and presence otherwise untouched. */}
      <div className={styles.labFooterEmergencyWrap}>
        <div className={styles.labFooterEmergency}>
          <p className={styles.labFooterEmergencyText}>
            In caso di emergenza o pericolo immediato, non utilizzare questo sito: chiama il 112 (numero unico di
            emergenza) o recati al pronto soccorso più vicino. Per un sostegno emotivo immediato puoi contattare
            Telefono Amico Italia al 02 2327 2327. Questo sito non fornisce assistenza in situazioni di emergenza.
          </p>
        </div>
      </div>

      <div className={styles.labFooterBottomBarWrap}>
        <div className={styles.labFooterBottomBar}>
          <p className={styles.labFooterCopyright}>
            © {year} Giuseppe Iannone — Tutti i diritti riservati.
          </p>
          <p className={styles.labFooterLocaleSwitcher}>
            {typedLocale === "it" ? (
              <span className={styles.labFooterLocaleCurrent}>IT</span>
            ) : (
              <Link href={designLabPath(otherLocale)} lang="it" className={styles.labFooterLocaleLink}>
                IT
              </Link>
            )}
            {" / "}
            {typedLocale === "en" ? (
              <span className={styles.labFooterLocaleCurrent}>EN</span>
            ) : (
              <Link href={designLabPath(otherLocale)} lang="en" className={styles.labFooterLocaleLink}>
                EN
              </Link>
            )}
          </p>
          {/* rel/final anchor text to be set per the development contract
              — placeholder label only, per spec. */}
          <a href="#" className={styles.labFooterDevCredit}>
            Sito: [segnaposto — nome/link sviluppatore]
          </a>
        </div>
      </div>
    </footer>
  );
}
