"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Shared activeId state between SediInteractive (address list + map) and
// LocationsMarquee (the photo strip below it) — the two are siblings in
// DesignLabHomepage.tsx, not nested, so a click on either side needs a
// single source of truth to stay in sync (same reasoning LocationsMap.tsx
// itself already documents for its own list<->map sync, just extended one
// level further out to cover the strip too). Scoped narrowly around only
// these two blocks in DesignLabHomepage.tsx, not the whole page.
//
// Correction pass, items 2b/2c: `scroll` was added to distinguish WHERE a
// selection came from. The list and strip are both potentially off-screen
// from the map, so selecting from either should scroll the map into view
// first (SediInteractive.tsx's own effect sequences that). A pin clicked
// directly ON the map needs no such scroll — the map is already in view —
// and per this pass's own "do not change map behaviour" constraint, a pin
// click's own reaction must stay exactly as immediate as it already was.
// SediMap's own onActiveChange is wired (in SediInteractive.tsx) to pass
// scroll:false for that one case; every other caller keeps the default.
type SediMapSelection = { id: string | null; scroll: boolean };
type SediMapContextValue = {
  activeId: string | null;
  scrollRequested: boolean;
  selectLocation: (id: string | null, opts?: { scroll?: boolean }) => void;
};

const SediMapContext = createContext<SediMapContextValue | null>(null);

export function SediMapProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<SediMapSelection>({ id: null, scroll: false });

  function selectLocation(id: string | null, opts?: { scroll?: boolean }) {
    setSelection({ id, scroll: opts?.scroll ?? true });
  }

  return (
    <SediMapContext.Provider value={{ activeId: selection.id, scrollRequested: selection.scroll, selectLocation }}>
      {children}
    </SediMapContext.Provider>
  );
}

export function useSediMapContext(): SediMapContextValue {
  const ctx = useContext(SediMapContext);
  if (!ctx) {
    throw new Error("useSediMapContext must be used within a SediMapProvider");
  }
  return ctx;
}
