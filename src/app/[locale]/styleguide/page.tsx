import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { isProductionDeployment, resolveRobots } from "@/sanity/metadata";
import { SedesMapDemo } from "./SedesMapDemo";
import styles from "./styleguide.module.scss";

// Internal design-review tool for Stage 3 — never meant to be public.
// Gated out of production entirely (not just noindexed) so it can't be
// stumbled into once the real site is live; noindex is a second, redundant
// layer for the window while it's reachable on preview deployments.
export const metadata: Metadata = {
  title: "Style guide (internal)",
  robots: resolveRobots(true),
};

// Same placeholder set as FormazioneBand.tsx (design-lab) — facts only,
// per docs/design-direction.md §9, all [segnaposto] pending real data.
const credentialItems = [
  "Iscrizione all'Albo degli Psicologi della Lombardia — n. [segnaposto]",
  "Psicologo Psicoterapeuta — indirizzo cognitivo-comportamentale",
  "Laurea in Psicologia — [università, segnaposto]",
  "[Società o associazione professionale — segnaposto]",
];

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

// Group B refinement pass: the neutral scale, anchored to the approved
// hero photo's warm backdrop hue (~28°). This is the source-of-truth
// swatch set for that rule — see docs/design-direction.md §7 and the
// _tokens.scss comment on --color-sand for the measured hue/contrast
// numbers.
const neutralScaleTokens = [
  { name: "--color-bg", label: "Ivory" },
  { name: "--color-sand", label: "Sand" },
  { name: "--color-sand-deep", label: "Sand deep" },
  { name: "--color-greige", label: "Greige" },
  { name: "--color-line", label: "Line" },
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

      <h2>Neutral scale (Group B)</h2>
      <p>
        Anchored to the approved hero photo&apos;s warm backdrop hue (~28°) —
        every warm neutral on the page sits at hue 26-30°, sat ≤35%.
      </p>
      <ul className={styles.swatchGrid}>
        {neutralScaleTokens.map((token) => (
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

      <h2>Buttons (Group B refinement pass)</h2>
      <p>
        Exactly two variants — Primary and Secondary — each with an
        inverted-on-pine state. Padding/font-size/weight come from the new
        --button-* tokens in _tokens.scss. Font-weight uses 700 (Lato has
        no real 600 cut in this project) rather than the spec&apos;s literal
        &quot;600&quot;, which would have to be synthesized.
      </p>
      <p>
        <strong>Note:</strong> these are new local classes demonstrating the
        refined system — the real Button.tsx component (used elsewhere on
        the site) is unchanged in this pass; porting it to match is a later
        step, once Group B is approved. The old Button/ButtonLink demo
        (solid/outline) previously shown here is superseded by this section.
      </p>
      <div className={styles.buttonRow}>
        <a href="#" className={styles.btnPrimary}>
          Primary
        </a>
        <a href="#" className={styles.btnSecondary}>
          Secondary
        </a>
      </div>
      <div className={`${styles.buttonRow} ${styles.buttonRowInverted}`}>
        <a href="#" className={styles.btnPrimaryInverted}>
          Primary, inverted
        </a>
        <a href="#" className={styles.btnSecondaryInverted}>
          Secondary, inverted
        </a>
      </div>

      <h2>Header devices (single-block pass)</h2>
      <p>
        The fixed lab header&apos;s two end states, static (the live header
        interpolates continuously between them via a single --header-progress
        custom property, driven by scroll — see the pass&apos;s final report
        for the full mechanism). Transparent (progress 0, over the hero):
        includes the legibility wash needed to keep nav links AA-readable
        over the hero photo&apos;s darkest point (measured 1.20:1 without it,
        5.68:1 with it) and the Secondary conversion button. Collapsed
        (progress 1): ivory-glass background + blur, Primary button. Below
        that: the &quot;Aree&quot; submenu panel, forced open, and the
        channel-picker popup card.
      </p>

      <p className={styles.typeLabel}>Header — transparent (over hero)</p>
      <div className={styles.headerDemoBar}>
        <p className={styles.headerDemoWordmark}>Giuseppe Iannone</p>
        <nav className={styles.headerDemoNav}>
          <span className={styles.headerDemoNavLink}>Chi sono</span>
          <span className={styles.headerDemoNavLink}>Metodo</span>
          <span className={styles.headerDemoNavLink}>Aree</span>
        </nav>
        <a href="#" className={styles.btnSecondary}>
          Prenota un primo colloquio
        </a>
      </div>

      <p className={styles.typeLabel}>Header — collapsed (scrolled)</p>
      <div className={`${styles.headerDemoBar} ${styles.headerDemoBarCollapsed}`}>
        <p className={styles.headerDemoWordmark}>Giuseppe Iannone</p>
        <nav className={styles.headerDemoNav}>
          <span className={styles.headerDemoNavLink}>Chi sono</span>
          <span className={styles.headerDemoNavLink}>Metodo</span>
          <span className={styles.headerDemoNavLink}>Aree</span>
        </nav>
        <a href="#" className={styles.btnPrimary}>
          Prenota un primo colloquio
        </a>
      </div>

      <p className={styles.typeLabel}>&quot;Aree&quot; submenu panel (forced open)</p>
      <div className={styles.headerDemoSubmenuWrap}>
        <div className={styles.headerDemoSubmenuPanel}>
          <span className={styles.headerDemoSubmenuLink}>Ansia</span>
          <span className={styles.headerDemoSubmenuLink}>Depressione</span>
          <span className={styles.headerDemoSubmenuLink}>Stress</span>
          <span className={styles.headerDemoSubmenuLink}>Cambiamenti di vita</span>
        </div>
      </div>

      <p className={styles.typeLabel}>Channel-picker popup card (Part B)</p>
      <div className={styles.channelDialogDemoCard}>
        <span className={styles.channelDialogDemoClose} aria-hidden="true">
          ×
        </span>
        <p className={styles.channelDialogDemoKicker}>Primo contatto</p>
        <p className={styles.channelDialogDemoHeading}>Scrivimi come ti è più comodo.</p>
        <div className={styles.channelDialogDemoChannels}>
          <a href="#" className={styles.btnSecondary}>
            Scrivimi su WhatsApp
          </a>
          <span className={styles.channelDialogDemoLink}>[segnaposto — telefono]</span>
          <span className={styles.channelDialogDemoLink}>[segnaposto — email]</span>
        </div>
      </div>

      <h2>Ti riconosci? devices (single-block pass, v3)</h2>
      <p>
        v3 replaces the v2 autoplay slider entirely — timer, dots, crossfade
        stage, all gone. Five vignettes now render as an always-visible
        vertical list; the one whose vertical center is nearest the
        viewport center is &quot;lit&quot; (full ink; its label at the
        corrected AA value, ink@65%), the rest are dimmed (ink@30%, label
        ink@20%) with a 400ms color-only transition. Reduced motion: all
        five render fully lit, statically, with no scroll listener attached
        at all — this is also the low-vision safety valve, since dimmed is
        an emphasis effect, not the reading state. Below: one dimmed item
        and one lit item, static reference (the live section drives this
        via scroll position; see the pass&apos;s final report for the
        highlight-mechanics verification).
      </p>

      <ul className={styles.recognitionListDemo}>
        <li className={styles.recognitionItemDemo} data-lit="false">
          <p className={styles.recognitionItemDemoVignette}>
            Mi sveglio già stanco, e la giornata non è ancora iniziata. Il
            caffè non aiuta; la lista delle cose da fare, invece, cresce da
            sola.
          </p>
          <span className={styles.recognitionItemDemoLabel}>Stress</span>
        </li>
        <li className={styles.recognitionItemDemo} data-lit="true">
          <p className={styles.recognitionItemDemoVignette}>
            Il cuore accelera senza un motivo apparente. Controllo che sia
            tutto a posto — ed è tutto a posto. Ma il corpo non ci crede.
          </p>
          <span className={styles.recognitionItemDemoLabel}>Ansia</span>
        </li>
      </ul>

      <h2>Mini-contact band devices (single-block pass)</h2>
      <p>
        NEW section (block 10, right after Ti riconosci?): a quiet
        low-threshold contact option, not the main CTA. Kicker/heading/body
        on the left, one WhatsApp button plus phone/email text links on the
        right — exactly one button in the band, per spec; the rest are
        plain text links (the same 13px caps text-link component used
        elsewhere, e.g. Di cosa mi occupo&apos;s arrow link, minus the
        arrow).
      </p>
      <div className={styles.miniContactBandDemo}>
        <div className={styles.miniContactBandDemoLeft}>
          <p className={styles.miniContactBandDemoKicker}>Primo contatto</p>
          <p className={styles.miniContactBandDemoHeading}>
            Non serve arrivare con una richiesta chiara.
          </p>
        </div>
        <div className={styles.miniContactBandDemoRight}>
          <a href="#" className={styles.btnSecondary}>
            Scrivimi su WhatsApp
          </a>
          <a href="#" className={styles.miniContactBandDemoLink}>
            [segnaposto — telefono]
          </a>
          <a href="#" className={styles.miniContactBandDemoLink}>
            [segnaposto — email]
          </a>
        </div>
      </div>

      <h2>Chi sono devices (single-block pass)</h2>
      <p>
        New devices introduced by the Chi sono rebuild: a watermark word and
        a watermark numeral, a brand-shadow photo plate, a kicker with an
        inline rule, a CSS-only drop cap, and one shared arrow text-link.
        Watermark type below is shown at a reduced demo scale — real desktop
        sizes are 140px (word) and 160px (numeral); see
        design-lab.module.scss for the full responsive scale.
      </p>

      <p className={styles.typeLabel}>Watermark word + heading overlap</p>
      <div className={styles.watermarkDemo}>
        <p className={styles.watermarkWord} aria-hidden="true">
          Benvenuto
        </p>
        <p className={styles.watermarkLabel}>Statement heading</p>
      </div>

      <p className={styles.typeLabel}>Watermark numeral</p>
      <div className={styles.watermarkDemo}>
        <span className={styles.watermarkNumeral} aria-hidden="true">
          01
        </span>
      </div>

      <p className={styles.typeLabel}>Brand-shadow photo</p>
      <div className={styles.brandShadowDemo}>
        <div className={styles.brandShadowPlate} />
        <div className={styles.brandShadowPhoto} />
      </div>

      <p className={styles.typeLabel}>Kicker</p>
      <p className={styles.kickerDemo}>
        <span className={styles.kickerRule} aria-hidden="true" />
        Il percorso
      </p>

      <p className={styles.typeLabel}>Drop cap</p>
      <p className={styles.dropCapDemo}>
        Da anni accompagno persone che attraversano ansia, cambiamenti di
        vita e momenti di difficoltà.
      </p>

      <p className={styles.typeLabel}>Text link</p>
      <a href="#" className={styles.arrowLink}>
        Scrivimi
        <span className={styles.arrowLinkGlyph} aria-hidden="true">
          ⟶
        </span>
      </a>

      <h2>Come funziona devices (single-block pass)</h2>
      <p>
        The MediaBand component supports two modes with the same
        intersection-gated play/pause and prefers-reduced-motion behavior.{" "}
        <strong>Image mode</strong> is demoed below with the real session
        photo. <strong>Video mode</strong>{" "}
        is fully implemented in MediaBand.tsx (muted/loop/playsInline,
        preload=&quot;none&quot;, IntersectionObserver play at 25%
        visibility, poster fallback under reduced motion) but is not demoed
        here — no video asset exists anywhere in the repo&apos;s public
        folder (checked: only the numbered .webp stills), and per the
        honesty rule a mismatched placeholder wasn&apos;t substituted for
        it.
      </p>

      <p className={styles.typeLabel}>MediaBand — image mode</p>
      <div className={styles.mediaBandDemo}>
        <Image
          src="/design-lab/12.webp"
          alt=""
          fill
          sizes="20rem"
          className={styles.mediaBandDemoImg}
        />
      </div>

      <h2>Formazione devices (single-block pass)</h2>
      <p>
        The credentials marquee: a centered, inverted (ivory-on-pine) kicker
        with a rule on each side, and a pure-CSS looping track (no JS). Two
        states below — the first respects your OS&apos;s actual
        reduced-motion setting (real production behavior); the second is
        forced static for reference, since not every reviewer has that
        setting on.
      </p>

      <p className={styles.typeLabel}>Marquee — live (respects your OS motion setting)</p>
      <div className={styles.marqueeDemo}>
        <p className={styles.marqueeKicker}>
          <span className={styles.marqueeKickerRule} aria-hidden="true" />
          Formazione e iscrizioni
          <span className={styles.marqueeKickerRule} aria-hidden="true" />
        </p>
        <div className={styles.marqueeTrackWrap}>
          <div className={styles.marqueeTrack}>
            <ul className={styles.marqueeList}>
              {credentialItems.map((item) => (
                <li key={item} className={styles.marqueeItem}>
                  {item}
                  <span className={styles.marqueeSeparator} aria-hidden="true" />
                </li>
              ))}
            </ul>
            <ul className={`${styles.marqueeList} ${styles.marqueeListDuplicate}`} aria-hidden="true">
              {credentialItems.map((item) => (
                <li key={item} className={styles.marqueeItem}>
                  {item}
                  <span className={styles.marqueeSeparator} aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className={styles.typeLabel}>Marquee — reduced-motion state (forced, for reference)</p>
      <div className={styles.marqueeDemo}>
        <p className={styles.marqueeKicker}>
          <span className={styles.marqueeKickerRule} aria-hidden="true" />
          Formazione e iscrizioni
          <span className={styles.marqueeKickerRule} aria-hidden="true" />
        </p>
        <div className={styles.marqueeTrackWrapStatic}>
          <ul className={styles.marqueeListStatic}>
            {credentialItems.map((item) => (
              <li key={item} className={styles.marqueeItem}>
                {item}
                <span className={styles.marqueeSeparator} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.typeLabel}>Counter stat (v2 addition) — static, final-value demo</p>
      <p>
        The count-up counter row (FormazioneCounters.tsx): Marcellus
        number, label 12px below in the same voice as the kicker. Width is
        locked to the final value via a hidden sizing element so the
        count never shifts layout (see the live section for the animated
        version and the pass&apos;s final report for the zero-CLS
        verification). Shown here at its final, settled value — no
        animation in this static styleguide demo.
      </p>
      <div className={styles.counterStatDemoRow}>
        <div className={styles.counterStatDemo}>
          <p className={styles.counterStatDemoNumber}>10</p>
          <p className={styles.counterStatDemoLabel}>Anni di esperienza clinica</p>
        </div>
        <div className={styles.counterStatDemo}>
          <p className={styles.counterStatDemoNumber}>2500</p>
          <p className={styles.counterStatDemoLabel}>Ore di formazione</p>
        </div>
      </div>

      <h2>Di cosa mi occupo devices (single-block pass)</h2>
      <p>
        The indexed list item (IndexedListItem.tsx): a numeral in its own
        fixed-width column, baseline-aligned with the title, sub-items
        listed below the title with a short pine dash. Demoed here with one
        example area — see the live section for all four.
      </p>

      <p className={styles.typeLabel}>Indexed list item</p>
      <div className={styles.indexedItemDemo}>
        <span className={styles.indexedItemDemoNumeral} aria-hidden="true">
          01
        </span>
        <div className={styles.indexedItemDemoBody}>
          <h3 className={styles.indexedItemDemoTitle}>Ansia</h3>
          <ul className={styles.indexedItemDemoSubList}>
            {["Attacchi di panico", "Preoccupazione costante", "Ansia sociale"].map((item) => (
              <li key={item} className={styles.indexedItemDemoSubItem}>
                <span className={styles.indexedItemDemoDash} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2>Statement devices (single-block pass)</h2>
      <p>
        Giuseppe&apos;s own signed statement — not a testimonial (no
        carousel, no quote marks; see StatementBand.tsx). Demoed with the
        placeholder copy from the live section.
      </p>

      <p className={styles.typeLabel}>Statement block</p>
      <div className={styles.statementDemo}>
        <div className={styles.statementDemoTextWrap}>
          <p className={styles.statementDemoNumeral} aria-hidden="true">
            04
          </p>
          <p className={styles.statementDemoText}>
            Il mio lavoro non è dare risposte pronte, ma costruire insieme un
            modo di stare nelle cose — più chiaro, più sostenibile.
          </p>
        </div>
        <p className={styles.statementDemoSignature}>— Giuseppe Iannone</p>
        <p className={styles.statementDemoRole}>Psicologo Psicoterapeuta</p>
      </div>

      <h2>Diplomi devices (single-block pass)</h2>
      <p>
        The passe-partout diploma card: white background, 1px border,
        subtle shadow (same family as the Sedi panel), image
        object-fit:contain — documents are deliberately NOT run through
        the tonal filter used elsewhere for photos; the frame provides
        the uniformity instead. Demoed statically (no lightbox JS on this
        page) — see the live section for the click-to-open behavior.
      </p>
      <p>
        <strong>Viewer note:</strong> revision round 3 replaced the
        third-party lightbox (yet-another-react-lightbox) with an OWN
        viewer, DiplomiViewerModal.tsx, built on the exact native{" "}
        <code>&lt;dialog&gt;</code> infrastructure the channel-picker popup
        already proved out (::backdrop pine@92%, ivory controls,
        Esc/focus-trap/focus-return, the fixed-position scroll lock with
        explicit scrollY capture/restore). Adds click/tap-to-zoom
        (scale 1↔2, origin at the click point), drag-to-pan while zoomed,
        and touch swipe navigation — none of which the library offered.
        Not reproduced live here since it opens from a real card click,
        not a static demo.
      </p>

      <p className={styles.typeLabel}>Diploma card</p>
      <div className={styles.diplomaCardDemo}>
        <div className={styles.diplomaCardDemoImageWrap}>
          <Image
            src="/design-lab/diploma-01.svg"
            alt=""
            fill
            sizes="20rem"
            className={styles.diplomaCardDemoImage}
          />
        </div>
        <div className={styles.diplomaCardDemoCaption}>
          <p className={styles.diplomaCardDemoTitle}>[segnaposto — laurea in Psicologia]</p>
          <p className={styles.diplomaCardDemoMeta}>[segnaposto — università]</p>
          <p className={styles.diplomaCardDemoMeta}>2012</p>
        </div>
      </div>

      <h2>Come si svolge un percorso devices (single-block pass)</h2>
      <p>
        The zigzag timeline&apos;s three devices, demoed statically (no
        scroll logic here — see Timeline.tsx for the live scroll-driven
        version): a card, a node in both its inactive/active states, and a
        segment of the progress line partially filled.
      </p>

      <p className={styles.typeLabel}>Timeline card</p>
      <div className={styles.timelineCardDemo}>
        <h3 className={styles.timelineCardDemoTitle}>Primo colloquio</h3>
        <p className={styles.timelineCardDemoText}>
          Un incontro per conoscersi e capire la richiesta. 50 minuti, senza
          impegno di proseguire.
        </p>
      </div>

      <p className={styles.typeLabel}>Timeline node — inactive / active</p>
      <div className={styles.timelineNodeDemoRow}>
        <div className={styles.timelineNodeDemo}>
          <span className={styles.timelineNodeDemoNumeral}>01</span>
        </div>
        <div className={`${styles.timelineNodeDemo} ${styles.timelineNodeDemoActive}`}>
          <span className={styles.timelineNodeDemoNumeral}>02</span>
        </div>
      </div>

      <p className={styles.typeLabel}>Progress line (partially filled)</p>
      <div className={styles.timelineLineDemo}>
        <div className={styles.timelineLineDemoFill} />
      </div>

      <h2>Quanto costa un percorso devices (single-block pass)</h2>
      <p>
        The price line (restaurant-menu pattern): label, a dotted leader
        (a border, not &quot;.&quot; characters — confirmed via the
        accessibility tree, which reads it as &quot;label, price
        unit&quot; with no dot characters announced), then price and unit
        on one baseline. Demoed in both of PricingSection&apos;s
        showPrices modes.
      </p>

      <p className={styles.typeLabel}>Price lines — showPrices=true</p>
      <ul className={styles.priceListDemo}>
        <li className={styles.priceLineDemo}>
          <span className={styles.priceLineDemoLabel}>Colloquio individuale</span>
          <span className={styles.priceLineDemoLeader} aria-hidden="true" />
          <span className={styles.priceLineDemoValue}>
            <span className={styles.priceLineDemoPrice}>€ [segnaposto]</span>{" "}
            <span className={styles.priceLineDemoUnit}>/ 50 min</span>
          </span>
        </li>
        <li className={styles.priceLineDemo}>
          <span className={styles.priceLineDemoLabel}>Seduta online</span>
          <span className={styles.priceLineDemoLeader} aria-hidden="true" />
          <span className={styles.priceLineDemoValue}>
            <span className={styles.priceLineDemoPrice}>€ [segnaposto]</span>{" "}
            <span className={styles.priceLineDemoUnit}>/ 50 min</span>
          </span>
        </li>
      </ul>

      <p className={styles.typeLabel}>showPrices=false (single sentence, same typography as the intro paragraph)</p>
      <p className={styles.priceNoPricesDemo}>
        Il costo viene comunicato con chiarezza al primo contatto, prima di
        qualsiasi impegno.
      </p>

      <h2>Risorse devices (single-block pass)</h2>
      <p>
        The article panel (ArticlePanel.tsx): cover image, bottom scrim
        (measured to pass AA against the title — see the pass&apos;s
        final report for the exact ratios), category pill + date, and a
        max-3-line title. The whole panel is one link. Static demo only
        (no live Sanity data here) — hover to see the scrim deepen and the
        image scale.
      </p>

      <p className={styles.typeLabel}>Article panel</p>
      <a href="#" className={styles.articlePanelDemo}>
        <Image
          src="/design-lab/06.webp"
          alt=""
          fill
          sizes="20rem"
          className={`${styles.articlePanelDemoImg} ${styles.mediaBandDemoImg}`}
        />
        <span className={styles.articlePanelDemoScrim} aria-hidden="true" />
        <span className={styles.articlePanelDemoContent}>
          <span className={styles.articlePanelDemoMeta}>
            <span className={styles.articlePanelDemoPill}>Ansia</span>
            <span className={styles.articlePanelDemoDate}>30 gen 2026</span>
          </span>
          <span className={styles.articlePanelDemoTitle}>Riconoscere i primi segnali dell&apos;ansia</span>
        </span>
      </a>

      <h2>La prima seduta — video player (video-section pass)</h2>
      <p>
        No real video asset exists in the repo yet (checked: only the
        numbered .webp stills, same situation MediaBand&apos;s own video
        mode was in) — the section itself is built to render nothing at
        all on the live homepage until an editor publishes one (see
        VideoSection.tsx&apos;s own early return). Per this pass&apos;s own
        spec, the player is demoed here instead with a synthetically
        generated clip (canvas + MediaRecorder, ~4s, recorded via
        Playwright — no ffmpeg available in this environment and no
        repo asset to reuse) purely to exercise the custom controls
        below: idle poster + play button, the progress bar
        (click/drag/arrow-key seek), play/pause, mute, captions (a
        matching sample .vtt), and fullscreen. None of this — the clip,
        the poster, the captions text — is real content.
      </p>
      <p className={styles.typeLabel}>Video player</p>
      <div className={styles.videoPlayerDemo}>
        <VideoPlayer
          src="/design-lab/prima-seduta-demo.webm"
          poster="/design-lab/09.webp"
          posterAlt=""
          captionsSrc="/design-lab/prima-seduta-demo.vtt"
        />
      </div>

      <h2>Final CTA band devices (single-block pass)</h2>
      <p>
        The media-anchored closing band: a photo zone (tonal filter + a 35%
        pine multiply overlay + an edge melt gradient — right edge on
        tablet/desktop, bottom edge on mobile, not shown separately here)
        and a left-aligned content zone with an inverted kicker, heading,
        paragraph, the single Primary-inverted CTA, two quiet microcopy
        lines, and a deliberately demoted &quot;Trovami su Google&quot;
        link. Static demo at a compact fixed size — see the live section
        for the full viewport-bleed photo and the responsive column split.
      </p>

      <p className={styles.typeLabel}>Media-anchored CTA band</p>
      <div className={styles.ctaBandDemo}>
        <div className={styles.ctaBandDemoPhotoZone}>
          <Image
            src="/design-lab/11.webp"
            alt=""
            fill
            sizes="10rem"
            className={styles.ctaBandDemoPhotoImg}
          />
          <span className={styles.ctaBandDemoPhotoOverlay} aria-hidden="true" />
          <span className={styles.ctaBandDemoPhotoMelt} aria-hidden="true" />
        </div>
        <div className={styles.ctaBandDemoContent}>
          <p className={styles.ctaBandDemoKicker}>
            <span className={styles.ctaBandDemoKickerRule} aria-hidden="true" />
            Primo passo
          </p>
          <h3 className={styles.ctaBandDemoHeading}>Non sai da dove iniziare?</h3>
          <p className={styles.ctaBandDemoBody}>
            Se ti riconosci in questi temi, scrivimi: possiamo capire
            insieme da dove partire.
          </p>
          <a href="#" className={`${styles.btnPrimaryInverted} ${styles.ctaBandDemoCta}`}>
            Prenota un primo colloquio
          </a>
          <div className={styles.ctaBandDemoQuietLines}>
            <p className={styles.ctaBandDemoQuietLine}>
              I tuoi dati saranno trattati con la massima riservatezza.
            </p>
            <p className={styles.ctaBandDemoQuietLine}>
              Rispondo di persona, in genere entro [segnaposto] giorni.
            </p>
          </div>
          <a href="#" className={styles.ctaBandDemoGoogle}>
            Trovami su Google
          </a>
        </div>
      </div>

      <h2>FAQ mini v2 devices (single-block pass)</h2>
      <p>
        The accordion row: a fixed index column, question (Lato 20px/700),
        and a plus-to-x icon (two CSS bars, no icon font/SVG), closed and
        open states shown statically below (no button/JS here — see
        FaqAccordion.tsx for the live component: exclusive-open, CSS
        grid-rows 0fr/1fr height animation, delayed text fade-in). The
        live section adds a sticky header column at desktop and a FAQPage
        JSON-LD block generated from the same data (see the pass&apos;s
        final report for the injection point and the animation notes).
      </p>

      <p className={styles.typeLabel}>Accordion row — closed / open</p>
      <div className={styles.faqAccordionDemo}>
        <div className={styles.faqRowDemo}>
          <div className={styles.faqRowDemoHeader}>
            <span className={styles.faqRowDemoIndex} aria-hidden="true">01</span>
            <span className={styles.faqRowDemoQuestion}>Come funziona il primo colloquio?</span>
            <span className={styles.faqRowDemoIcon} aria-hidden="true">
              <span className={styles.faqRowDemoIconBarH} />
              <span className={styles.faqRowDemoIconBarV} />
            </span>
          </div>
        </div>
        <div className={styles.faqRowDemo}>
          <div className={styles.faqRowDemoHeader}>
            <span className={styles.faqRowDemoIndex} aria-hidden="true">02</span>
            <span className={styles.faqRowDemoQuestion}>Quanto dura una seduta?</span>
            <span className={`${styles.faqRowDemoIcon} ${styles.faqRowDemoIconOpen}`} aria-hidden="true">
              <span className={styles.faqRowDemoIconBarH} />
              <span className={styles.faqRowDemoIconBarV} />
            </span>
          </div>
          <p className={styles.faqRowDemoAnswer}>
            Una seduta dura in genere 50 minuti. [segnaposto]
          </p>
        </div>
      </div>

      <h2>Sedi devices (single-block pass)</h2>
      <p>
        The scene panel (ivory@96%, standard radius/shadow) and the styled
        Leaflet map — real CARTO Positron tiles behind the brand tint
        filter, custom divIcon markers (14px pine circle, 2px ivory ring;
        the left one shown at the 1.25× active-city scale), zoom/drag/
        scroll-zoom disabled, attribution visible but restyled small/muted.
        Static demo, fixed size, no scroll-driving or flyTo — see the
        live section for the sticky scroll scenario and the pass&apos;s
        final report for the tuned filter values and the geocoding notes.
      </p>

      <p className={styles.typeLabel}>Scene panel + styled map (static)</p>
      <div className={styles.sedesDemoRow}>
        <div className={styles.sedesPanelDemo}>
          <h3 className={styles.sedesPanelDemoCity}>Cernusco sul Naviglio</h3>
          <p className={styles.sedesPanelDemoCenterName}>Centro Andrologico Italiano</p>
          <p className={styles.sedesPanelDemoAddress}>Via Brescia 23</p>
          <p className={styles.sedesPanelDemoCenterName}>Centro di Psicologia</p>
          <p className={styles.sedesPanelDemoAddress}>Via Torino 24/11</p>
        </div>
        <SedesMapDemo />
      </div>

      <h2>Footer devices (single-block pass)</h2>
      <p>
        The footer column (inverted kicker + link list, on pine — same
        treatment as the FAQ/CTA sections&apos; own inverted kicker) and the
        bottom bar (copyright, IT/EN locale switcher, quiet developer
        credit). Contrast note: the bottom bar&apos;s literal spec value
        (ivory@55%) measured 4.25:1 on pine, below AA for 12px text — 60%
        (4.74:1) is used instead, same substitution procedure as every
        other contrast fix on this page. This is DesignLabFooter.tsx, a
        design-lab-only preview — not the real, shared Footer.tsx (see
        the pass&apos;s final report).
      </p>

      <p className={styles.typeLabel}>Footer column</p>
      <div className={styles.footerColumnDemo}>
        <p className={styles.footerColumnDemoKicker}>
          <span className={styles.footerColumnDemoKickerRule} aria-hidden="true" />
          Esplora
        </p>
        <ul className={styles.footerColumnDemoList}>
          <li>
            <a href="#" className={styles.footerColumnDemoLink}>Home</a>
          </li>
          <li>
            <a href="#" className={styles.footerColumnDemoLink}>Chi sono</a>
          </li>
          <li>
            <a href="#" className={styles.footerColumnDemoLink}>Metodo</a>
          </li>
        </ul>
      </div>

      <p className={styles.typeLabel}>Bottom bar</p>
      <div className={styles.footerBottomBarDemo}>
        <p className={styles.footerBottomBarDemoText}>© 2026 Giuseppe Iannone — Tutti i diritti riservati.</p>
        <p className={styles.footerBottomBarDemoText}>
          <span className={styles.footerBottomBarDemoCurrent}>IT</span> / <a href="#" className={styles.footerBottomBarDemoLink}>EN</a>
        </p>
        <a href="#" className={styles.footerBottomBarDemoLink}>Sito: [segnaposto — nome/link sviluppatore]</a>
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
