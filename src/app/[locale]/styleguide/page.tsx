import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, ButtonLink } from "@/components/Button";
import { isProductionDeployment, resolveRobots } from "@/sanity/metadata";
import styles from "./styleguide.module.scss";

// Internal design-review tool for Stage 3 — never meant to be public.
// Gated out of production entirely (not just noindexed) so it can't be
// stumbled into once the real site is live; noindex is a second, redundant
// layer for the window while it's reachable on preview deployments.
export const metadata: Metadata = {
  title: "Style guide (internal)",
  robots: resolveRobots(true),
};

const colorTokens = [
  { name: "--color-bg", label: "Background" },
  { name: "--color-surface", label: "Surface" },
  { name: "--color-surface-tint", label: "Surface tint" },
  { name: "--color-accent", label: "Accent" },
  { name: "--color-accent-hover", label: "Accent hover" },
  { name: "--color-accent-soft", label: "Accent soft" },
  { name: "--color-text", label: "Text" },
  { name: "--color-text-muted", label: "Text muted" },
  { name: "--color-hairline", label: "Hairline" },
  { name: "--color-focus", label: "Focus" },
] as const;

const typeSpecimens = [
  { role: "Display / H1", fs: "--fs-display", lh: "--lh-display", font: "display" },
  { role: "H2", fs: "--fs-h2", lh: "--lh-h2", font: "display" },
  { role: "H3", fs: "--fs-h3", lh: "--lh-h3", font: "body" },
  { role: "Body large", fs: "--fs-body-lg", lh: "--lh-body-lg", font: "body" },
  { role: "Body", fs: "--fs-body", lh: "--lh-body", font: "body" },
  { role: "Small", fs: "--fs-small", lh: "--lh-small", font: "body" },
] as const;

const spaceTokens = [
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-7",
  "--space-8",
  "--space-9",
  "--space-10",
] as const;

const radiusTokens = [
  { name: "--radius-s", label: "Small (inputs, tags)" },
  { name: "--radius-m", label: "Medium (cards)" },
  { name: "--radius-l", label: "Large (imagery)" },
] as const;

export default function StyleguidePage() {
  if (isProductionDeployment()) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <h1>Style guide</h1>
      <p>
        Internal design-token review for Stage 3. Not linked from anywhere
        public, noindexed, and unreachable once the site is in production.
      </p>

      <h2>Colors</h2>
      <ul className={styles.swatchGrid}>
        {colorTokens.map((token) => (
          <li key={token.name} className={styles.swatchItem}>
            <span
              className={styles.swatch}
              style={{ background: `var(${token.name})` }}
            />
            <span className={styles.swatchLabel}>
              {token.label}
              <code>{token.name}</code>
            </span>
          </li>
        ))}
      </ul>

      <h2>Type scale</h2>
      <ul className={styles.typeList}>
        {typeSpecimens.map((specimen) => (
          <li key={specimen.role} className={styles.typeItem}>
            <p className={styles.typeLabel}>
              {specimen.role} <code>{specimen.fs}</code> / <code>{specimen.lh}</code>
            </p>
            <p
              className={
                specimen.font === "display"
                  ? styles.typeSpecimenDisplay
                  : styles.typeSpecimenBody
              }
              style={{
                fontSize: `var(${specimen.fs})`,
                lineHeight: `var(${specimen.lh})`,
              }}
            >
              Disturbi d&apos;ansia, attacchi di panico
            </p>
          </li>
        ))}
      </ul>

      <h2>Spacing scale</h2>
      <ul className={styles.spaceList}>
        {spaceTokens.map((token) => (
          <li key={token} className={styles.spaceItem}>
            <code>{token}</code>
            <span
              className={styles.spaceBar}
              style={{ width: `var(${token})` }}
            />
          </li>
        ))}
      </ul>

      <h2>Radii</h2>
      <ul className={styles.radiusGrid}>
        {radiusTokens.map((token) => (
          <li key={token.name} className={styles.radiusItem}>
            <span
              className={styles.radiusSwatch}
              style={{ borderRadius: `var(${token.name})` }}
            />
            <span>
              {token.label} <code>{token.name}</code>
            </span>
          </li>
        ))}
      </ul>

      <h2>Buttons</h2>
      <div className={styles.buttonRow}>
        <Button variant="solid">Invia</Button>
        <Button variant="outline">Annulla</Button>
        <ButtonLink href="#" variant="solid">
          Link stile pulsante
        </ButtonLink>
      </div>

      <h2>Links</h2>
      <p>
        Un paragrafo di prova con un{" "}
        <a className={styles.link} href="#">
          link in linea
        </a>{" "}
        dentro il testo.
      </p>

      <h2>Divider</h2>
      <hr className={styles.divider} />

      <h2>Grid</h2>
      <ul className={styles.gridDemo}>
        <li className={styles.gridItem}>Elemento 1</li>
        <li className={styles.gridItem}>Elemento 2</li>
        <li className={styles.gridItem}>Elemento 3</li>
      </ul>
    </main>
  );
}
