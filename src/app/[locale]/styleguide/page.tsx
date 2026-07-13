import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isProductionDeployment, resolveRobots } from "@/sanity/metadata";
import { cormorant, sourceSans3 } from "./fonts";
import { PaletteRoot } from "./PaletteContext";
import { PaletteSwitcher } from "./PaletteSwitcher";
import { DEFAULT_PALETTE, isPalette } from "./palettes";
import { TokenTable } from "./TokenTable";
import styles from "./styleguide.module.scss";
import "./styleguide-palettes.scss";

// Stage 3.5 groundwork — REWORK of the previous /styleguide (a component-
// museum documenting every past "single-block pass" decision) into a
// four-palette explorer for the client's approved redesign-direction
// call. The old content is fully replaced, not archived — confirmed with
// the owner before doing this (a large, deliberate rework of an
// extensively-documented file, not an ambiguous one) — it stays
// recoverable via git history if ever needed again.
//
// Still gated exactly like the page it replaces: hard 404 in production
// (never just noindexed) via isProductionDeployment(), noindex as a
// second, redundant layer for the window while reachable on preview
// deployments. Static — no Sanity queries, per this task's own
// constraint (nothing here needs live content).
export const metadata: Metadata = {
  title: "Style guide (internal) — Palette Explorer",
  robots: resolveRobots(true),
};

export default async function StyleguidePage({
  searchParams,
}: {
  searchParams: Promise<{ palette?: string }>;
}) {
  if (isProductionDeployment()) {
    notFound();
  }

  // Resolved SERVER-SIDE so the very first HTML byte already carries the
  // correct data-palette — no client-side flash of the wrong theme before
  // hydration (this task's own explicit deep-link requirement).
  const { palette: rawPalette } = await searchParams;
  const initialPalette = isPalette(rawPalette) ? rawPalette : DEFAULT_PALETTE;

  return (
    <PaletteRoot
      initialPalette={initialPalette}
      rootClassName={`${sourceSans3.variable} ${cormorant.variable}`}
    >
      {/* ================= 1. Header strip ================= */}
      <header className={styles.headerStrip}>
        <div className={styles.headerStripTop}>
          <h1 className={styles.headerStripTitle}>
            Design Direction — Palette Explorer
          </h1>
          <PaletteSwitcher />
        </div>
        <p className={styles.headerStripNote}>
          Pagina di esplorazione interna — non collegata pubblicamente, non
          indicizzata. / Internal exploration page — not publicly linked,
          not indexed.
        </p>
      </header>

      {/* ================= 2. Background progression strip ================= */}
      <section className={styles.section} aria-labelledby="sg-bg-heading">
        <h2 id="sg-bg-heading" className={styles.sectionHeading}>
          Background progression
        </h2>
        <div className={styles.bgStrip}>
          {(
            [
              ["--sg-bg-page", "page"],
              ["--sg-bg-hero", "hero"],
              ["--sg-bg-alt-1", "alt-1"],
              ["--sg-bg-alt-2", "alt-2"],
              ["--sg-bg-alt-3", "alt-3"],
              ["--sg-bg-alt-4", "alt-4"],
            ] as const
          ).map(([token, label]) => (
            <BgStop key={token} token={token} label={label} />
          ))}
        </div>
        <p className={styles.caption}>
          Sul sito reale queste tonalità evolvono in modo impercettibile
          durante lo scroll. / On the real site these evolve imperceptibly
          while scrolling.
        </p>
      </section>

      {/* ================= 3. Typography specimen ================= */}
      <section className={styles.section} aria-labelledby="sg-type-heading">
        <h2 id="sg-type-heading" className={styles.sectionHeading}>
          Typography specimen
        </h2>

        <h3 className={styles.subsectionHeading}>Display — Marcellus 400</h3>
        <ul className={styles.typeSpecList}>
          <TypeRow
            name="display-xl"
            fsVar="--sg-fs-display-xl"
            lhVar="--sg-lh-display-xl"
            font="display"
          />
          <TypeRow name="h1" fsVar="--sg-fs-h1" lhVar="--sg-lh-h1" font="display" />
          <TypeRow name="h2" fsVar="--sg-fs-h2" lhVar="--sg-lh-h2" font="display" />
          <TypeRow name="h3" fsVar="--sg-fs-h3" lhVar="--sg-lh-h3" font="display" />
          <TypeRow
            name="numeral"
            fsVar="--sg-fs-numeral"
            lhVar="--sg-lh-numeral"
            font="numeral"
            sample="01"
          />
        </ul>

        <h3 className={styles.subsectionHeading}>Body &amp; UI — Source Sans 3</h3>
        <ul className={styles.typeSpecList}>
          <TypeRow name="lead" fsVar="--sg-fs-lead" lhVar="--sg-lh-lead" font="body" />
          <TypeRow name="body" fsVar="--sg-fs-body" lhVar="--sg-lh-body" font="body" />
          <TypeRow name="small" fsVar="--sg-fs-small" lhVar="--sg-lh-small" font="body" />
          <TypeRow
            name="caption"
            fsVar="--sg-fs-caption"
            lhVar="--sg-lh-caption"
            font="body"
          />
          <TypeRow
            name="eyebrow"
            fsVar="--sg-fs-eyebrow"
            lhVar="--sg-lh-eyebrow"
            font="eyebrow"
            sample="Primo passo"
          />
          <TypeRow
            name="button"
            fsVar="--sg-fs-button"
            lhVar="--sg-lh-button"
            font="button"
            sample="Prenota un primo colloquio"
          />
        </ul>

        <h3 className={styles.subsectionHeading}>Italic emphasis technique</h3>
        <p className={styles.emphasisBodySpecimen}>
          A volte basta{" "}
          <em className={styles.emphasisBodyWord}>nominare</em> ciò che si
          prova per iniziare a capirlo.
        </p>
        <p className={styles.caption}>
          Emphasis = Source Sans 3 italic 400 + --sg-accent-text (never
          bold/semibold), pensata per una o due parole per sezione. La
          dimensione mobile si vede ridimensionando la finestra — nessun
          secondo blocco statico. / Sized for one or two words per
          section; resize the window to see the mobile size — no second
          static block.
        </p>

        <h3 className={styles.subsectionHeading}>
          Heading emphasis — Variant A / B / C
        </h3>
        <div className={styles.headingVariantStack}>
          <div className={styles.headingVariantRow}>
            <p className={styles.headingVariantLabel}>
              Variant A — quiet (Marcellus, colored, no italic)
            </p>
            <h3 className={styles.emphasisHeadingMarcellus}>
              Da dove possiamo{" "}
              <em className={styles.emphasisQuiet}>iniziare</em>?
            </h3>
          </div>

          <div className={styles.headingVariantRow}>
            <p className={styles.headingVariantLabel}>
              Variant B — Cyprus-style shine (Marcellus + Cormorant italic
              shine)
            </p>
            <h3 className={styles.emphasisHeadingMarcellus}>
              Da dove possiamo{" "}
              <em className={styles.emphasisShine}>iniziare</em>?
            </h3>
            <p className={styles.caption}>
              Riservato a un massimo di un titolo per pagina (l&apos;hero). /
              Reserved for at most one heading per page (the hero).
            </p>
          </div>

          <div className={styles.headingVariantRow}>
            <p className={styles.headingVariantLabel}>
              Variant C — single-family candidate (Cormorant entirely)
            </p>
            <h3 className={styles.emphasisHeadingCormorant}>
              Da dove possiamo{" "}
              <em className={styles.emphasisShine}>iniziare</em>?
            </h3>
            <p className={styles.caption}>
              Candidate: replacing Marcellus entirely — a genre shift from
              inscriptional to old-style serif; the client asked to keep
              Marcellus, so this is shown only for comparison.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 4. Accent anatomy ================= */}
      <section className={styles.section} aria-labelledby="sg-anatomy-heading">
        <h2 id="sg-anatomy-heading" className={styles.sectionHeading}>
          Accent anatomy
        </h2>
        <div className={styles.anatomyGrid}>
          <AnatomyItem label="Active nav item">
            <span className={styles.anatomyNavActive}>Chi sono</span>
          </AnatomyItem>

          <AnatomyItem label="Eyebrow label">
            <p className={styles.anatomyEyebrow}>Primo passo</p>
          </AnatomyItem>

          <AnatomyItem label="Italic emphasis in a Marcellus heading">
            <h3 className={styles.emphasisHeadingMarcellusSmall}>
              Da dove <em className={styles.emphasisQuiet}>iniziare</em>?
            </h3>
          </AnatomyItem>

          <AnatomyItem label="Primary CTA — default / hover / focus / disabled">
            <div className={styles.anatomyButtonRow}>
              <button type="button" className={styles.anatomyButton}>
                Scrivimi
              </button>
              <button
                type="button"
                className={`${styles.anatomyButton} ${styles.anatomyButtonHoverDemo}`}
              >
                Scrivimi
              </button>
              <button
                type="button"
                className={`${styles.anatomyButton} ${styles.anatomyButtonFocusDemo}`}
              >
                Scrivimi
              </button>
              <button type="button" className={styles.anatomyButton} disabled>
                Scrivimi
              </button>
            </div>
          </AnatomyItem>

          <AnatomyItem label="Text link with arrow — default / hover">
            <div className={styles.anatomyLinkRow}>
              <a href="#" className={styles.anatomyLink}>
                Approfondisci →
              </a>
              <a
                href="#"
                className={`${styles.anatomyLink} ${styles.anatomyLinkHoverDemo}`}
              >
                Approfondisci →
              </a>
            </div>
          </AnatomyItem>

          <AnatomyItem label="Decorative oversized quote mark">
            <span className={styles.anatomyQuoteMark} aria-hidden="true">
              &ldquo;
            </span>
          </AnatomyItem>

          <AnatomyItem label="Card with left accent border — default / hover">
            <div className={styles.anatomyCardRow}>
              <div className={styles.anatomyCard}>
                <h4 className={styles.anatomyCardTitle}>Ansia</h4>
                <p className={styles.anatomyCardBody}>
                  Quando il pensiero anticipa sempre il peggio.
                </p>
              </div>
              <div
                className={`${styles.anatomyCard} ${styles.anatomyCardHoverDemo}`}
              >
                <h4 className={styles.anatomyCardTitle}>Ansia</h4>
                <p className={styles.anatomyCardBody}>
                  Quando il pensiero anticipa sempre il peggio.
                </p>
              </div>
            </div>
          </AnatomyItem>

          <AnatomyItem label="Form input — default / focus / error">
            <div className={styles.anatomyInputRow}>
              <label className={styles.anatomyInputWrap}>
                <span className={styles.anatomyInputLabel}>Il tuo nome</span>
                <input type="text" className={styles.anatomyInput} />
              </label>
              <label className={styles.anatomyInputWrap}>
                <span className={styles.anatomyInputLabel}>Email</span>
                <input
                  type="email"
                  className={`${styles.anatomyInput} ${styles.anatomyInputFocusDemo}`}
                />
              </label>
              <label className={styles.anatomyInputWrap}>
                <span className={styles.anatomyInputLabel}>Email</span>
                <input
                  type="email"
                  className={`${styles.anatomyInput} ${styles.anatomyInputErrorDemo}`}
                  aria-invalid="true"
                />
                <span className={styles.anatomyInputError}>
                  Controlla l&apos;indirizzo email.
                </span>
              </label>
            </div>
          </AnatomyItem>

          <AnatomyItem label="Oversized faint section numeral">
            <span className={styles.anatomyNumeral} aria-hidden="true">
              02
            </span>
          </AnatomyItem>
        </div>
      </section>

      {/* ================= 5. Dark band sample ================= */}
      <section className={styles.section} aria-labelledby="sg-dark-heading">
        <h2 id="sg-dark-heading" className={styles.sectionHeading}>
          Dark band sample
        </h2>
        <div className={styles.darkBand}>
          <p className={styles.darkBandEyebrow}>LE COSE POSSONO CAMBIARE</p>
          <h3 className={styles.darkBandHeading}>
            Non è sempre stato così. E non deve restare così.
          </h3>
        </div>
        <div className={styles.darkBand2}>
          <div className={styles.videoPlaceholder}>
            <span className={styles.playButton} aria-hidden="true">
              <span className={styles.playButtonGlyph} />
            </span>
          </div>
        </div>
      </section>

      {/* ================= 6. Mini-page preview ================= */}
      <section className={styles.section} aria-labelledby="sg-mini-heading">
        <h2 id="sg-mini-heading" className={styles.sectionHeading}>
          Mini-page preview
        </h2>
        <MiniPagePreview />
      </section>

      {/* ================= 7. Token table ================= */}
      <section className={styles.section} aria-labelledby="sg-tokens-heading">
        <h2 id="sg-tokens-heading" className={styles.sectionHeading}>
          Token table
        </h2>
        <TokenTable />
      </section>
    </PaletteRoot>
  );
}

function BgStop({ token, label }: { token: string; label: string }) {
  return (
    <div className={styles.bgStop}>
      <span
        className={styles.bgStopSwatch}
        style={{ background: `var(${token})` }}
      />
      <span className={styles.bgStopLabel}>{label}</span>
      <code className={styles.bgStopVar}>{token}</code>
    </div>
  );
}

function TypeRow({
  name,
  fsVar,
  lhVar,
  font,
  sample,
}: {
  name: string;
  fsVar: string;
  lhVar: string;
  font: "display" | "body" | "numeral" | "eyebrow" | "button";
  sample?: string;
}) {
  const fontClass =
    font === "display" || font === "numeral"
      ? styles.typeSampleDisplay
      : font === "eyebrow"
        ? styles.typeSampleEyebrow
        : font === "button"
          ? styles.typeSampleButton
          : styles.typeSampleBody;

  return (
    <li className={styles.typeSpecRow}>
      <p className={styles.typeSpecLabel}>
        <code>{name}</code>{" "}
        <span className={styles.typeSpecMeta}>
          <code>{fsVar}</code> / <code>{lhVar}</code>
        </span>
      </p>
      <p
        className={fontClass}
        style={{ fontSize: `var(${fsVar})`, lineHeight: `var(${lhVar})` }}
      >
        {sample ?? "Disturbi d'ansia, attacchi di panico"}
      </p>
    </li>
  );
}

function AnatomyItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.anatomyItem}>
      <p className={styles.anatomyItemLabel}>{label}</p>
      {children}
    </div>
  );
}

function MiniPagePreview() {
  return (
    <div className={styles.miniPage}>
      {/* Hero */}
      <div className={styles.miniHero}>
        <span className={styles.miniHeroTag}>video ambientale</span>
        <p className={styles.miniHeroEyebrow}>Primo passo</p>
        <h3 className={styles.miniHeroHeading}>
          Da dove possiamo{" "}
          <em className={styles.emphasisQuiet}>iniziare</em>?
        </h3>
        <p className={styles.miniHeroSub}>
          Uno spazio per capire cosa stai vivendo e cosa puoi farci, con
          calma e senza fretta.
        </p>
      </div>

      {/* Quote */}
      <div className={styles.miniQuote}>
        <span className={styles.miniQuoteMark} aria-hidden="true">
          &ldquo;
        </span>
        <p className={styles.miniQuoteText}>
          Mi sveglio già stanco, e non so nemmeno perché.
        </p>
      </div>

      {/* Dark band */}
      <div className={styles.miniDarkBand}>
        <p className={styles.miniDarkBandEyebrow}>LE COSE POSSONO CAMBIARE</p>
        <h4 className={styles.miniDarkBandHeading}>
          Non è sempre stato così. E non deve restare così.
        </h4>
      </div>

      {/* Three-step row */}
      <div className={styles.miniSteps}>
        {["Il primo contatto", "Capire insieme cosa succede", "Un lavoro con obiettivi chiari"].map(
          (step, index) => (
            <div key={step} className={styles.miniStep}>
              <span className={styles.miniStepNumeral}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className={styles.miniStepText}>{step}</p>
            </div>
          ),
        )}
      </div>

      {/* Photo + bio row */}
      <div className={styles.miniBioRow}>
        <div className={styles.miniPhoto} />
        <div className={styles.miniBioText}>
          <p className={styles.miniBioEyebrow}>Chi sono</p>
          <p className={styles.miniBioBody}>
            Psicologo Psicoterapeuta — un percorso costruito insieme, un
            passo alla volta.
          </p>
        </div>
      </div>

      {/* Three cards */}
      <div className={styles.miniCards}>
        {["Ansia", "Attacchi di panico", "Rimuginio"].map((title) => (
          <div key={title} className={styles.miniCard}>
            <h4 className={styles.miniCardTitle}>{title}</h4>
            <a href="#" className={styles.anatomyLink}>
              Approfondisci →
            </a>
          </div>
        ))}
      </div>

      {/* Form + CTA */}
      <div className={styles.miniFormBand}>
        <p className={styles.miniFormHeading}>Scrivimi</p>
        <div className={styles.miniForm}>
          <label className={styles.anatomyInputWrap}>
            <span className={styles.anatomyInputLabel}>Il tuo nome</span>
            <input type="text" className={styles.anatomyInput} />
          </label>
          <label className={styles.anatomyInputWrap}>
            <span className={styles.anatomyInputLabel}>Email</span>
            <input type="email" className={styles.anatomyInput} />
          </label>
          <button type="button" className={styles.anatomyButton}>
            Invia
          </button>
        </div>
      </div>

      {/* Footer strip */}
      <div className={styles.miniFooter}>
        <span>Giuseppe Iannone</span>
        <span>© 2026</span>
      </div>
    </div>
  );
}
