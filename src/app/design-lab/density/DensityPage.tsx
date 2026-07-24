import {
  AREE,
  CHI_SONO,
  CREDENTIALS,
  DIPLOMI,
  LOCATIONS_STATIC,
  MARQUEE_ITEMS,
  METODO,
  PAGE_HEADER,
  THE_SPACE,
  type DensityLocale,
} from "./content";
import { CertificatesMarquee } from "./CertificatesMarquee";
import { DiplomiBlock } from "./DiplomiBlock";
import { MetodoInteractive } from "./MetodoInteractive";
import { ParallaxFrame } from "./ParallaxFrame";
import { ScrambleValue } from "./ScrambleValue";
import styles from "./density.module.scss";

// Shared between the /design-lab/density (it) and /design-lab/density/en
// routes — same pattern reasoning as [locale]/page.tsx sharing logic
// across it/en, just without next-intl (this route lives outside that
// tree entirely, see layout.tsx's own comment).
export function DensityPage({ locale }: { locale: DensityLocale }) {
  const chiSono = CHI_SONO[locale];
  const metodo = METODO[locale];
  const credentials = CREDENTIALS[locale];
  const aree = AREE[locale];
  const theSpace = THE_SPACE[locale];
  const locations = LOCATIONS_STATIC[locale];

  return (
    <div className={styles.root}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{PAGE_HEADER.title}</h1>
        {PAGE_HEADER.lines.map((line) => (
          <p key={line} className={styles.pageNote}>
            {line}
          </p>
        ))}
      </header>

      <section className={styles.section} aria-labelledby="s1-heading">
        <p className={styles.sectionLabel}>{metodo.label}</p>

        <div className={styles.metodoHeader}>
          <div className={styles.sectionHeadingCol}>
            <p className={styles.metodoKicker}>{metodo.kicker}</p>
            <h2 id="s1-heading" className={styles.metodoHeading}>
              {metodo.heading}
            </h2>
          </div>
          <p className={`${styles.metodoParagraph} ${styles.sectionIntro}`}>{metodo.paragraph}</p>
        </div>

        <MetodoInteractive steps={metodo.steps} />
      </section>

      <section className={styles.section} aria-labelledby="s2-heading">
        <p className={styles.sectionLabel}>{chiSono.label}</p>

        <h2 id="s2-heading" className={styles.heading}>
          {chiSono.title} <em className={styles.emphasis}>{chiSono.emphasis}</em>
          {chiSono.titleEnd}
        </h2>

        <div className={styles.textBlock}>
          {chiSono.paragraphsBeforePhoto.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </div>

        <figure className={styles.photoBreak}>
          <div className={styles.photoPlaceholder}>
            <span>{chiSono.photoLabel}</span>
          </div>
          <figcaption className={styles.photoCaption}>{chiSono.photoCaption}</figcaption>
        </figure>

        <div className={styles.textBlock}>
          {chiSono.paragraphsAfterPhoto.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.credentialsBand} aria-label={credentials.label}>
        <div className={styles.credentialsGrain} aria-hidden="true" />
        <div className={styles.credentialsInner}>
          <p className={styles.credentialsLabel}>{credentials.label}</p>
          <ul className={styles.credentialsList}>
            {credentials.items.map((item) => (
              <li key={item.detail} className={styles.credentialsItem}>
                <p className={styles.credentialsValue}>
                  <ScrambleValue value={item.value} />
                </p>
                <p className={styles.credentialsCaption}>
                  {item.unit ? `${item.unit} ${item.detail}` : item.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="s4-heading">
        <p className={styles.sectionLabel}>{aree.label}</p>

        <div className={styles.metodoHeader}>
          <div className={styles.sectionHeadingCol}>
            <p className={styles.metodoKicker}>{aree.kicker}</p>
            <h2 id="s4-heading" className={styles.metodoHeading}>
              {aree.heading}
            </h2>
          </div>
          <p className={`${styles.metodoParagraph} ${styles.sectionIntro}`}>{aree.intro}</p>
        </div>

        <ol className={styles.areeList}>
          {aree.rows.map((row, index) => (
            <li key={row.title} className={styles.areeRow}>
              <p className={styles.areeNumeral} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <p className={styles.areeRowTitle}>{row.title}</p>
                <p className={styles.areeRowDetail}>{row.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="s5-heading">
        <p className={styles.sectionLabel}>{theSpace.label}</p>
        <p className={styles.metodoKicker} id="s5-heading">
          {theSpace.kicker}
        </p>

        <div className={styles.spaceBlock}>
          <div className={styles.spaceText}>
            <h3 className={styles.spaceHeading}>{theSpace.blocks[0]?.heading}</h3>
            <p className={styles.spaceParagraph}>{theSpace.blocks[0]?.paragraph}</p>
          </div>
          <figure className={styles.fullBleedFrame}>
            <ParallaxFrame
              aspect={theSpace.blocks[0]?.aspect}
              label={`Frame A — ${theSpace.blocks[0]?.aspect}`}
            />
          </figure>
          <p className={styles.photoCaption}>{theSpace.blocks[0]?.caption}</p>
        </div>

        <div className={styles.spaceBlock}>
          <div className={styles.spaceText}>
            <h3 className={styles.spaceHeading}>{theSpace.blocks[1]?.heading}</h3>
            <p className={styles.spaceParagraph}>{theSpace.blocks[1]?.paragraph}</p>
          </div>
          <div className={styles.spaceFrameB}>
            <figure className={styles.spaceFrameBPlaceholder}>
              <div
                className={styles.photoPlaceholder}
                style={{ aspectRatio: theSpace.blocks[1]?.aspect }}
              >
                <span>Frame B — {theSpace.blocks[1]?.aspect}</span>
              </div>
              <figcaption className={styles.photoCaption}>{theSpace.blocks[1]?.caption}</figcaption>
            </figure>
            <div aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="s6-heading">
        <p className={styles.sectionLabel}>{DIPLOMI.label}</p>
        <DiplomiBlock kicker={DIPLOMI.kicker} heading={DIPLOMI.heading} items={DIPLOMI.items} headingId="s6-heading" />
      </section>

      <CertificatesMarquee items={MARQUEE_ITEMS} />

      <section className={styles.section} aria-labelledby="s-map-heading">
        <p className={styles.sectionLabel}>{locations.label}</p>
        <h2 id="s-map-heading" className={styles.metodoHeading}>
          {locations.heading}
        </h2>

        {/* Rework pass: kept container-width rather than full-bleed —
            once Diplomi + the marquee were inserted above, a full-bleed
            map frame here would sit directly after the marquee's own
            full-bleed strip. Section 05's Frame A stays full-bleed
            unchanged (its neighbors, Aree and Diplomi, are both
            container-width, so no adjacency issue there). See the final
            report's background-rhythm sequence. */}
        <figure className={styles.mapFrame}>
          <div className={styles.photoPlaceholder} style={{ aspectRatio: "21 / 9" }}>
            <span>{locations.caption}</span>
          </div>
        </figure>

        <ul className={styles.locationsList}>
          {locations.entries.map((entry) => (
            <li key={entry.name}>
              <p className={styles.locationsName}>{entry.name}</p>
              {entry.lines.map((line) => (
                <p key={line} className={styles.locationsLine}>
                  {line}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
