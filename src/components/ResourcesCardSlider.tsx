"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { articlePath, type Locale } from "@/sanity/paths";
import styles from "./resourcesLab.module.scss";

// coverUrl is a plain, already-resolved string, not a raw SanityImage —
// see ResourcesLab.tsx's own comment on why: this is a client component,
// and @/sanity/image's urlFor transitively imports @/sanity/client.ts,
// which reads next/headers (draftMode), a server-only API Next.js
// correctly refuses to bundle here. Resolving the URL server-side and
// passing the string across the boundary avoids needing any
// Sanity-aware import on this side at all.
export type ResolvedArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  category: string;
  excerpt?: string;
  coverUrl?: string;
};

function formatArticleDate(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// Dot-label/track-label dictionary — a site-mechanism string (the
// carousel's own accessible name), not editorial copy, so it lives here
// the same way MobileMenuOverlay.tsx's own MOBILE_SUBMENU_TOGGLE_LABEL
// does rather than adding new Sanity/messages fields for it.
const DOT_LABEL: Record<Locale, (index: number, count: number) => string> = {
  it: (index, count) => `Vai all'articolo ${index + 1} di ${count}`,
  en: (index, count) => `Go to article ${index + 1} of ${count}`,
};
const TRACK_LABEL: Record<Locale, string> = {
  it: "Articoli",
  en: "Articles",
};

function Card({ locale, article, href }: { locale: Locale; article: ResolvedArticle; href: string }) {
  const date = formatArticleDate(article.publishedAt, locale);

  return (
    <a href={href} className={styles.card} aria-label={article.title}>
      {article.coverUrl ? (
        <div className={styles.cardImageWrap}>
          <Image
            src={article.coverUrl}
            alt=""
            fill
            sizes="(min-width: 48rem) 33vw, 100vw"
            className={styles.cardImage}
          />
        </div>
      ) : (
        <div className={styles.cardImagePlaceholder} aria-hidden="true">
          <span>{locale === "it" ? "Immagine [segnaposto]" : "Image [placeholder]"}</span>
        </div>
      )}
      <p className={styles.cardMeta}>{date ? `${article.category} · ${date}` : article.category}</p>
      <h3 className={styles.cardTitle}>{article.title}</h3>
      {article.excerpt ? <p className={styles.cardExcerpt}>{article.excerpt}</p> : null}
    </a>
  );
}

// Mobile slider pass — reuses the site's own proven horizontal-scroll
// mechanism (DiplomiSlider.tsx/diplomiSlider.module.scss's own
// scroll-snap-type: x mandatory track: native scroll-snap gives real
// touch swipe for free, no gesture library, no reimplementation).
// What's genuinely new here — nothing on this site had it before, so
// this isn't reused from anywhere — is the dot pagination: real
// <button>s (not divs with a click handler), each with its own
// aria-label ("Go to article N of M"), 44px tap target, active state
// tracked via IntersectionObserver against the track (which entry has
// the highest intersection ratio) rather than a raw scroll-position
// calculation, so it stays correct regardless of card width/gap.
// resourcesLab.module.scss keeps .cardsGrid's existing grid layout at
// md+ (768px) completely unchanged — this component only switches it to
// a snap track below that, via CSS, and only renders the dots there too
// (display:none at md+) — desktop/tablet render the identical grid
// markup and CSS they always did.
export function ResourcesCardSlider({
  locale,
  cards,
}: {
  locale: Locale;
  cards: ResolvedArticle[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || cards.length < 2) return;
    const cardEls = Array.from(track.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
        if (best && best.intersectionRatio > 0) {
          const index = cardEls.indexOf(best.target as HTMLElement);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { root: track, threshold: [0.5, 0.75, 1] },
    );
    for (const el of cardEls) observer.observe(el);
    return () => observer.disconnect();
  }, [cards.length]);

  function goToIndex(index: number) {
    const track = trackRef.current;
    const target = track?.children[index] as HTMLElement | undefined;
    if (!track || !target) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", inline: "start", block: "nearest" });
  }

  // Keyboard — the track itself is a real scroll container, so a mouse/
  // trackpad user already scrolls it natively; this adds explicit
  // Left/Right paging for a keyboard user who has tabbed onto it,
  // mirroring what the dots below do on click.
  function handleTrackKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToIndex(Math.min(activeIndex + 1, cards.length - 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToIndex(Math.max(activeIndex - 1, 0));
    }
  }

  return (
    <>
      <div
        ref={trackRef}
        className={styles.cardsGrid}
        data-card-count={cards.length}
        tabIndex={cards.length > 1 ? 0 : undefined}
        aria-label={cards.length > 1 ? TRACK_LABEL[locale] : undefined}
        onKeyDown={cards.length > 1 ? handleTrackKeyDown : undefined}
      >
        {cards.map((article) => (
          <Card key={article._id} locale={locale} article={article} href={articlePath(locale, article.slug)} />
        ))}
      </div>

      {cards.length > 1 ? (
        <div className={styles.dots} aria-label={TRACK_LABEL[locale]}>
          {cards.map((article, index) => (
            <button
              key={article._id}
              type="button"
              className={styles.dot}
              data-active={index === activeIndex ? "true" : undefined}
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={DOT_LABEL[locale](index, cards.length)}
              onClick={() => goToIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
