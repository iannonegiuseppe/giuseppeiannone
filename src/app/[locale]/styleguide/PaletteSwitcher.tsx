"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePalette } from "./PaletteContext";
import { PALETTES } from "./palettes";
import styles from "./styleguide.module.scss";

// Real <input type="radio"> underneath (same technique as ContactForm's
// channel pills) — gives native arrow-key navigation between options and
// tab+enter/space selection for free, rather than reimplementing a
// roving-tabindex custom widget. Palette-neutral styling (charcoal/
// limestone — see styleguide-palettes.scss's shared, non-palette-
// conditional --sg-switcher-* vars) so the control itself never biases
// which theme reads as "nicer."
export function PaletteSwitcher() {
  const { palette, setPalette } = usePalette();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(value: (typeof PALETTES)[number]["value"]) {
    setPalette(value);
    router.replace(`${pathname}?palette=${value}`, { scroll: false });
  }

  return (
    <fieldset className={styles.switcherFieldset}>
      <legend className={styles.switcherLegend}>Palette</legend>
      <div className={styles.switcherGroup}>
        {PALETTES.map((option) => (
          <label
            key={option.value}
            className={styles.switcherPill}
            data-selected={palette === option.value}
          >
            <input
              type="radio"
              name="sg-palette"
              value={option.value}
              checked={palette === option.value}
              onChange={() => handleChange(option.value)}
              className={styles.switcherInput}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
