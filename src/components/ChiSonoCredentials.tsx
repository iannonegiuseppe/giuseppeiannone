import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./ChiSonoCredentials.module.scss";

export interface ChiSonoCredentialItem {
  institution?: string;
  role?: string;
}

// Substring-match emphasis, same technique as ChiSonoBodyBlocks.tsx's own
// renderEmphasis (itself matching PillarHero.tsx's) — duplicated per this
// codebase's established convention rather than extracted to a shared util.
function renderEmphasis(text: string | undefined, emphasisWord: string | undefined) {
  if (!text) return null;
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={styles.headingEmphasis}>{emphasisWord}</em>
      {after}
    </>
  );
}

// Institution names must read as two rows everywhere — not just wherever a
// narrow column happens to force a wrap (that left short names like
// "Maastricht University" sitting on one line, floating above empty
// reserved space instead of meeting the role directly). Splits at the
// space closest to the string's midpoint, so the break is generic (not a
// hardcoded per-name table) and lands in roughly the same place a person
// breaking the title by eye would choose — verified this pass against all
// five real names, both locales: it reproduces the exact break each one
// already fell on when its column happened to be narrow enough to wrap.
function splitTwoLines(text: string | undefined): [string, string | null] {
  if (!text) return ["", null];
  let bestIndex = -1;
  let bestDistance = Infinity;
  const midpoint = text.length / 2;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== " ") continue;
    const distance = Math.abs(i - midpoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  if (bestIndex === -1) return [text, null];
  return [text.slice(0, bestIndex), text.slice(bestIndex + 1)];
}

// Chi sono full rebuild — block 6, the institutions band. Text only, no
// logos: a logo strip would read as an endorsement row, which art. 40
// prohibits (see this component's own caller comment on why
// CredentialsBand.tsx — homePage's own four-number stat band — isn't
// reused here: different content shape entirely, not five institutions).
//
// Final structure pass — kicker, then heading (the former trailing
// tagline) full-width above, then the five institutions as one row
// spanning the container at lg+ (stacked below lg). Replaces the prior
// two-column layout (heading left / list right): that version worked but
// wasn't the shape asked for here — a title over a row of five, not two
// side-by-side peer columns. See this pass's own report for sizing/
// spacing reasoning.
//
// Two-rows-everywhere pass — every institution name is force-split via
// splitTwoLines (above) rather than left to wrap on its own, so every
// role starts on the same baseline for the same reason regardless of
// viewport: real two-line content, not a min-height reservation papering
// over a one-line name.
export function ChiSonoCredentials({
  kicker,
  tagline,
  taglineEmphasisWord,
  items,
}: {
  kicker?: string;
  tagline?: string;
  taglineEmphasisWord?: string;
  items: ChiSonoCredentialItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className={styles.band} aria-label={kicker ?? "Credenziali"}>
      <div className={styles.inner}>
        {kicker ? (
          <p className={styles.kicker}>
            <SectionKicker>{kicker}</SectionKicker>
          </p>
        ) : null}
        {tagline ? <h2 className={styles.heading}>{renderEmphasis(tagline, taglineEmphasisWord)}</h2> : null}
        <ul className={styles.row}>
          {items.map((item, index) => {
            const [line1, line2] = splitTwoLines(item.institution);
            return (
              <li key={index} className={styles.item}>
                <p className={styles.institution}>
                  {line1}
                  {line2 !== null ? (
                    <>
                      <br />
                      {line2}
                    </>
                  ) : null}
                </p>
                <p className={styles.role}>{item.role}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
