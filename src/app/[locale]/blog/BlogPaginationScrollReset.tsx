"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLenisRef } from "@/components/LenisProvider";

// Item 3 — id BlogIndexView.tsx puts on the dark <section> (featured +
// grid + pagination), shared here so this component can target it without
// either file guessing the other's string.
export const BLOG_LIST_SECTION_ID = "blog-list";

// Blog index redesign pass — scrolls to the top of the dark list section
// after a pagination navigation (/blog/page/N), NOT to the very top of the
// page (that would jump past the section back up into the light hero,
// which the user never asked to revisit). Driven via the site's own
// shared Lenis instance rather than window.scrollTo directly (same "drive
// scroll through Lenis, not a second mechanism" rule every other
// scroll-driven piece of this site follows — see LenisProvider.tsx's own
// comment). offset:-96 clears the fixed header, same convention
// SediInteractive.tsx's own scrollTo already uses for the identical
// "target's top edge must not land under the fixed header" problem.
// Suppressed under reduced motion for free: LenisProvider never
// constructs an instance in that case, so lenisRef.current stays null and
// this becomes a no-op — matching Next's own default (unanimated) scroll
// restoration on navigation instead of adding a second, conflicting jump.
//
// Renders nothing — a bare effect component, colocated with
// BlogPagination rather than folded into LenisProvider itself, since this
// behaviour is specific to this one listing's pagination, not sitewide.
export function BlogPaginationScrollReset() {
  const lenisRef = useLenisRef();
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // don't jump on initial mount, only on subsequent navigations
    }
    const target = document.getElementById(BLOG_LIST_SECTION_ID);
    if (target) {
      lenisRef?.current?.scrollTo(target, { offset: -96 });
    } else {
      lenisRef?.current?.scrollTo(0);
    }
  }, [pathname, lenisRef]);

  return null;
}
