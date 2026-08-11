"use client";

import { useState } from "react";
import {
  PiDoorOpen,
  PiReceipt,
  PiMapPin,
  PiStethoscope,
  PiWaveSine,
  PiPulse,
  PiUsersThree,
  PiHeartStraight,
  PiGauge,
  PiHourglassSimple,
} from "react-icons/pi";
import { FaqAccordion, type FaqAccordionPair } from "@/components/FaqAccordion";
import styles from "./faq.module.scss";

// One icon per section, by PAGE ORDER (not by Sanity _key) — matches the
// brief's own "per section, in page order" spec exactly. Coupled to
// today's fixed 10-section content; if a section is added, removed, or
// reordered in Sanity, this array silently misaligns rather than erroring
// (sections[i] gets SECTION_ICONS[i], whatever that happens to be) — no
// safeguard against that exists here, flagged rather than hidden.
const SECTION_ICONS = [
  PiDoorOpen, // 1 Il primo incontro
  PiReceipt, // 2 Costi e pagamenti
  PiMapPin, // 3 Online e sedi
  PiStethoscope, // 4 Farmaci e medico curante
  PiWaveSine, // 5 Ansia
  PiPulse, // 6 Panico e agorafobia
  PiUsersThree, // 7 Relazioni e coppia
  PiHeartStraight, // 8 Sessualità
  PiGauge, // 9 Stress e burnout
  PiHourglassSimple, // 10 Trauma
] as const;

export interface FaqExplorerSection {
  _key: string;
  title: string;
  description: string;
  items: FaqAccordionPair[];
}

// Single shared open-state for the WHOLE page, exclusive across all 10
// sections — not one Set per section, not independent per-section state:
// opening a question in section 7 must close whatever was open in
// section 2. One composite key ("sectionKey:localIndex" — see
// FaqAccordion's own comment on why indices are local to each instance's
// `pairs` array, not a flat global index) or null (nothing open — a
// valid state here, unlike on pillar pages, which stay uncontrolled and
// default-open at index 0). Deliberately NOT ten independent
// uncontrolled FaqAccordions: that component's default is useState(0),
// so ten uncontrolled instances would render ten simultaneously-open
// answers, the opposite of exclusive. Controlled mode is still the only
// way to get one page-wide source of truth.
export function FaqExplorer({ sections }: { sections: FaqExplorerSection[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  function sectionOpenIndices(sectionKey: string): Set<number> {
    if (openKey === null) return new Set();
    const prefix = `${sectionKey}:`;
    if (!openKey.startsWith(prefix)) return new Set();
    return new Set([Number(openKey.slice(prefix.length))]);
  }

  function sectionToggleHandler(sectionKey: string) {
    return (localIndex: number) => {
      const key = `${sectionKey}:${localIndex}`;
      setOpenKey((prev) => (prev === key ? null : key));
    };
  }

  return (
    <div className={styles.explorer}>
      {sections.map((section, index) => {
        const SectionIcon = SECTION_ICONS[index];
        return (
          <section key={section._key} className={styles.section} aria-labelledby={`${section._key}-heading`}>
            <div className={styles.sectionHeader}>
              {SectionIcon ? <SectionIcon aria-hidden="true" className={styles.sectionIcon} /> : null}
              <h2 id={`${section._key}-heading`} className={styles.sectionTitle}>
                {section.title}
              </h2>
              <p className={styles.sectionDescription}>{section.description}</p>
            </div>
            <FaqAccordion
              pairs={section.items}
              openIndices={sectionOpenIndices(section._key)}
              onToggle={sectionToggleHandler(section._key)}
              answerWidth="full"
            />
          </section>
        );
      })}
    </div>
  );
}
