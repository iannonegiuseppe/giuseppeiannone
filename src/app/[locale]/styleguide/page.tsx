import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isProductionDeployment, resolveRobots } from "@/sanity/metadata";
import { ContrastTable } from "./ContrastTable";
import { TokenTable } from "./TokenTable";
import styles from "./styleguide.module.scss";

// Global restyle pass: collapses the four-palette explorer (terracotta/
// plum/olive/bronze — a pre-decision comparison tool) into the single,
// permanent design reference for the ONE live system now shipped
// site-wide (taupe/ivory palette, EB Garamond + Source Sans 3). No more
// palette switcher, no more --sg-* proxy tokens, no more Cormorant/
// Marcellus comparison rows — every value on this page reads the real
// global --color-*/--font-*/--fs-*/--lh-* tokens from
// src/styles/_tokens.scss directly (this route sits under
// [locale]/layout.tsx, so it already inherits the real EB Garamond/
// Source Sans 3 CSS variables applied to <html> — no separate scoped
// font load needed at all).
//
// Still gated exactly as before: hard 404 in production
// (isProductionDeployment()), noindex as a redundant second layer for
// the window while reachable on preview deployments.
export const metadata: Metadata = {
  title: "Style guide (internal) — Design System",
  robots: resolveRobots(true),
};

export default function StyleguidePage() {
  if (isProductionDeployment()) {
    notFound();
  }

  return (
    <div className={styles.root}>
      {/* ================= 1. Header strip ================= */}
      <header className={styles.headerStrip}>
        <h1 className={styles.headerStripTitle}>Design System</h1>
        <p className={styles.headerStripNote}>
          Pagina di riferimento interna — non collegata pubblicamente, non
          indicizzata. Unica fonte di verità per palette, tipografia e
          componenti reali del sito. / Internal reference page — not
          publicly linked, not indexed. Single source of truth for the
          real, live palette/typography/components.
        </p>
      </header>

      {/* ================= 2. Background progression ================= */}
      <section className={styles.section} aria-labelledby="sg-bg-heading">
        <h2 id="sg-bg-heading" className={styles.sectionHeading}>
          Background progression
        </h2>
        <div className={styles.bgStrip}>
          {(
            [
              ["--color-bg", "bg"],
              ["--color-sand", "sand"],
              ["--color-greige", "greige"],
              ["--color-surface-tint", "surface-tint"],
              ["--color-sand-deep", "sand-deep"],
            ] as const
          ).map(([token, label]) => (
            <BgStop key={token} token={token} label={label} />
          ))}
        </div>
        <p className={styles.caption}>
          Il hero non è in questa progressione — è sempre una foto piena
          pagina, non un colore. / The hero isn&apos;t part of this
          progression — it&apos;s always a full-bleed photo, never a solid
          color. <code>--color-sand-deep</code> is defined but not
          currently consumed by any component — kept available for a
          future deeper band.
        </p>
      </section>

      {/* ================= 3. Typography specimen ================= */}
      <section className={styles.section} aria-labelledby="sg-type-heading">
        <h2 id="sg-type-heading" className={styles.sectionHeading}>
          Typography specimen
        </h2>

        <h3 className={styles.subsectionHeading}>Display — EB Garamond 400</h3>
        <ul className={styles.typeSpecList}>
          <TypeRow
            name="display"
            fsVar="--fs-display"
            lhVar="--lh-display"
            font="display"
            note="clamp(2.5rem, 5vw, 3.75rem) — fluid, not a fixed mobile/desktop pair"
          />
          <TypeRow name="h2" fsVar="--fs-h2" lhVar="--lh-h2" font="display" note="clamp(1.75rem, 3vw, 2.25rem)" />
          <TypeRow
            name="numeral"
            fsVar={undefined}
            lhVar={undefined}
            font="numeral"
            sample="01"
            note="6rem mobile / 7.5rem tablet+, as implemented in ChiSonoOverlap — no global --fs-numeral token"
          />
        </ul>

        <h3 className={styles.subsectionHeading}>Body &amp; UI — Source Sans 3</h3>
        <p className={styles.caption} style={{ marginTop: 0, marginBottom: "1rem" }}>
          <code>h3</code> uses the body font, not the display font — too
          small at that size for EB Garamond to stay legible (see
          _tokens.scss&apos;s own comment). / <code>h3</code> is
          deliberately body-font, not display-font.
        </p>
        <ul className={styles.typeSpecList}>
          <TypeRow name="h3" fsVar="--fs-h3" lhVar="--lh-h3" font="body" />
          <TypeRow name="body-lg" fsVar="--fs-body-lg" lhVar="--lh-body-lg" font="body" />
          <TypeRow name="body" fsVar="--fs-body" lhVar="--lh-body" font="body" />
          <TypeRow name="small" fsVar="--fs-small" lhVar="--lh-small" font="body" />
          <TypeRow
            name="eyebrow"
            fsVar={undefined}
            lhVar={undefined}
            font="eyebrow"
            sample="Primo passo"
            note="0.875rem / 700 / --color-accent, as implemented in HeroOverlap — sizes like this are set per-component, not a single global token"
          />
          <TypeRow
            name="button"
            fsVar="--button-font-size"
            lhVar={undefined}
            font="button"
            sample="Prenota un primo colloquio"
          />
        </ul>

        <h3 className={styles.subsectionHeading}>Italic emphasis technique</h3>
        <p className={styles.emphasisBodySpecimen}>
          A volte basta{" "}
          <em className={styles.emphasisWord}>nominare</em> ciò che si
          prova per iniziare a capirlo.
        </p>
        <p className={styles.caption}>
          EB Garamond italic 400 + <code>--color-accent</code>, mai
          bold/semibold — pensata per una o due parole per sezione. Tecnica
          disponibile (EB Garamond carica un vero corsivo, cosa che
          Marcellus non aveva mai avuto) ma non ancora usata in nessun
          componente reale — questa è la specifica di riferimento, non una
          copia da un blocco già live. / Sized for one or two words per
          section. The technique is available (EB Garamond loads a real
          italic cut, which Marcellus never had) but nothing live uses it
          yet — this is the reference spec, not a copy of a shipped block.
        </p>
      </section>

      {/* ================= 4. Component anatomy ================= */}
      <section className={styles.section} aria-labelledby="sg-anatomy-heading">
        <h2 id="sg-anatomy-heading" className={styles.sectionHeading}>
          Component anatomy
        </h2>
        <div className={styles.anatomyGrid}>
          <AnatomyItem label="Active nav item (generic pattern — no page currently implements a current-page indicator)">
            <span className={styles.anatomyNavActive}>Chi sono</span>
          </AnatomyItem>

          <AnatomyItem label="Eyebrow label — HeroOverlap">
            <p className={styles.anatomyEyebrow}>Primo passo</p>
          </AnatomyItem>

          <AnatomyItem label="Primary CTA — default / hover / focus / disabled (Button.module.scss .solid)">
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

          <AnatomyItem label="Text link with arrow — default / hover (ChiSonoOverlap ArrowLink)">
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

          <AnatomyItem label="Card with left accent border — default / hover (ConcernsSection pattern)">
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

          <AnatomyItem label="Form input — default / focus / error (ContactForm, as actually implemented: ivory-on-accent, never a light card)">
            <div className={styles.anatomyFormDemo}>
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
            </div>
          </AnatomyItem>

          <AnatomyItem label="Oversized faint numeral — color-mix(--color-text 6%), as implemented in ChiSonoOverlap/RecognitionSection">
            <span className={styles.anatomyNumeral} aria-hidden="true">
              02
            </span>
          </AnatomyItem>
        </div>
      </section>

      {/* ================= 5. Accent band sample ================= */}
      <section className={styles.section} aria-labelledby="sg-accentband-heading">
        <h2 id="sg-accentband-heading" className={styles.sectionHeading}>
          Accent band sample
        </h2>
        <p className={styles.caption} style={{ marginTop: 0 }}>
          Non esiste un secondo livello &quot;scuro&quot; separato — le sezioni a
          tinta piena del sito reale (FinalContactSection, Footer,
          HopeSection) usano tutte lo stesso <code>--color-accent</code>{" "}
          con <code>--color-accent-contrast</code> (avorio) sopra. / There
          is no separate darker tier — every solid-fill band on the real
          site (FinalContactSection, Footer, HopeSection) uses this exact
          same <code>--color-accent</code> / <code>--color-accent-contrast</code>{" "}
          pairing.
        </p>
        <div className={styles.accentBand}>
          <p className={styles.accentBandEyebrow}>LE COSE POSSONO CAMBIARE</p>
          <h3 className={styles.accentBandHeading}>
            Non è sempre stato così. E non deve restare così.
          </h3>
        </div>
        <div className={styles.accentBand2}>
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
        <p className={styles.caption} style={{ marginTop: 0 }}>
          Composizione compatta a scopo dimostrativo — non è uno specchio
          della homepage reale (quello è la homepage stessa). / A compact
          demo composition, not a mirror of the real homepage (that&apos;s
          the homepage itself).
        </p>
        <MiniPagePreview />
      </section>

      {/* ================= 7. Token table ================= */}
      <section className={styles.section} aria-labelledby="sg-tokens-heading">
        <h2 id="sg-tokens-heading" className={styles.sectionHeading}>
          Token table
        </h2>
        <TokenTable />
      </section>

      {/* ================= 8. Contrast audit ================= */}
      <section className={styles.section} aria-labelledby="sg-contrast-heading">
        <h2 id="sg-contrast-heading" className={styles.sectionHeading}>
          Contrast audit
        </h2>
        <p className={styles.caption} style={{ marginTop: 0 }}>
          Calcolato live, ad ogni caricamento, dai valori reali dei token —
          non una tabella scritta a mano. / Computed live, on every page
          load, from the real token values — not a hand-typed table.
        </p>
        <ContrastTable />
      </section>
    </div>
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
  note,
}: {
  name: string;
  fsVar?: string;
  lhVar?: string;
  font: "display" | "body" | "numeral" | "eyebrow" | "button";
  sample?: string;
  note?: string;
}) {
  const fontClass =
    font === "display"
      ? styles.typeSampleDisplay
      : font === "numeral"
        ? `${styles.typeSampleDisplay} ${styles.typeSampleNumeralSize}`
        : font === "eyebrow"
          ? styles.typeSampleEyebrow
          : font === "button"
            ? styles.typeSampleButton
            : styles.typeSampleBody;

  // Rows without a named global token (numeral, eyebrow) get their real,
  // fixed values from a dedicated class instead — see each call site's
  // own `note` and styleguide.module.scss's own comment on those classes.
  const style =
    font === "numeral" || font === "eyebrow"
      ? undefined
      : ({
          fontSize: fsVar ? `var(${fsVar})` : undefined,
          lineHeight: lhVar ? `var(${lhVar})` : undefined,
        } as const);

  return (
    <li className={styles.typeSpecRow}>
      <p className={styles.typeSpecLabel}>
        <code>{name}</code>{" "}
        <span className={styles.typeSpecMeta}>
          {fsVar ? <code>{fsVar}</code> : null}
          {fsVar && lhVar ? " / " : null}
          {lhVar ? <code>{lhVar}</code> : null}
        </span>
      </p>
      <p className={fontClass} style={style}>
        {sample ?? "Disturbi d'ansia, attacchi di panico"}
      </p>
      {note ? <p className={styles.typeSpecNote}>{note}</p> : null}
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
        <p className={styles.miniHeroEyebrow}>Primo passo</p>
        <h3 className={styles.miniHeroHeading}>
          Da dove possiamo <em className={styles.emphasisWord}>iniziare</em>?
        </h3>
        <p className={styles.miniHeroSub}>
          Uno spazio per capire cosa stai vivendo e cosa puoi farci, con
          calma e senza fretta.
        </p>
      </div>

      {/* Accent band */}
      <div className={styles.miniAccentBand}>
        <p className={styles.miniAccentBandEyebrow}>LE COSE POSSONO CAMBIARE</p>
        <h4 className={styles.miniAccentBandHeading}>
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
