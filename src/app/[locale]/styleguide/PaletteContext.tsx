"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_PALETTE, type Palette } from "./palettes";
import styles from "./styleguide.module.scss";

interface PaletteContextValue {
  palette: Palette;
  setPalette: (palette: Palette) => void;
}

const PaletteContext = createContext<PaletteContextValue>({
  palette: DEFAULT_PALETTE,
  setPalette: () => {},
});

export function usePalette() {
  return useContext(PaletteContext);
}

// The actual DOM root carrying data-palette — initialPalette comes from
// page.tsx's own server-side resolution of ?palette=, so the very first
// server-rendered HTML already has the correct value baked in (no flash
// of the wrong theme before hydration). Client-side, useState just takes
// over from that same starting point; PaletteSwitcher (a child, via
// context) is the only thing that ever calls setPalette after that.
export function PaletteRoot({
  initialPalette,
  rootClassName,
  children,
}: {
  initialPalette: Palette;
  rootClassName: string;
  children: ReactNode;
}) {
  const [palette, setPalette] = useState<Palette>(initialPalette);

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      <div className={`${styles.root} ${rootClassName}`} data-palette={palette}>
        {children}
      </div>
    </PaletteContext.Provider>
  );
}
