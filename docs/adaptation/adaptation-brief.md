# WILLIAMSON-ADAPTATION BRIEF — Homepage redesign in the williamson style, made ours

> Paste into Claude Code on `dev`, together with docs/design-direction.md. This REPLACES
> the flat enrichment approach. We're adapting the composition language of
> williamson.themerex.net (a law-firm ThemeForest theme the client chose as reference) —
> but stripped of its deontology-violating blocks and rebuilt in OUR system. Build on the
> throwaway /design-lab route first with REAL photos. Do not touch the real homepage until
> approved.

## The core idea

williamson looks expensive because of: large photography with overlap/asymmetry (photos
break out of their columns, overlap adjacent blocks), big oversized faint section
numerals, strong serif type, dark atmospheric full-bleed bands, and generous whitespace.
We take THAT compositional language. We do NOT take its slider, its testimonials, its
"free consultation" promo, its awards/counters, or its team section — those are either
cheap-theme markers or prohibited for an Italian psychologist.

We now have a real professional photo set (uploaded), so this is achievable — the earlier
flatness was largely empty placeholders, not wrong design.

## Photography — real assets now available

Photos are a professional shoot: studio portraits, in-office, session scenes, online-
therapy scenes. Suggested mapping (adjust with judgment):

- **Hero (overlap composition):** photo 01 — horizontal, subject to the right, clean space
  to the left for a large Marcellus headline. The williamson "person emerges from the edge,
  text to the side" move. Let the image bleed to the right/top edge; headline overlaps.
- **Chi sono / About (photo overlapping a color block):** photo 04 (white shirt, dark bg) or
  03 — overlap it with a pine-green block the way williamson overlaps with red.
- **Therapy sessions / how-it-works / methods atmosphere:** photos 11, 12, 13 (real session
  scenes, clients shown from behind — no identifiable faces, ethically fine).
- **Online therapy / locations:** photos 05, 06, 07, 08 (at the laptop).
- **Concept image (photo 10 — skeleton/flowers):** strong but heavy for anxious visitors —
  do NOT put it in the hero or above the fold; at most a blog/philosophy accent. Flag to me
  before using it anywhere prominent.

**Unifying treatment (important for premium cohesion):** the photos have different
backgrounds/tones (grey, bluish, warm). williamson unifies via desaturation. Apply ONE
consistent tonal treatment across all photos — a gentle desaturation toward warm, or soft
duotone toward the ivory/green palette — so they read as one expensive set, not a mixed
gallery. Do it via CSS filter (reversible, tweakable) in the lab so I can judge intensity.
Show me both the raw and the treated version of the hero so I can pick the amount.

## Block-by-block mapping (williamson block → what we build)

| williamson block | our block |
|---|---|
| Hero slider (photo + "High quality law advice") | STATIC hero: photo 01 with overlap, name in Marcellus, one-line positioning, ONE soft CTA "Prenota un primo colloquio", Ordine number as quiet trust line. NO slider, NO form, NO "free". |
| "Your personal legal resource… years of trust" + overlapped portrait + "01" | "Chi sono" intro: overlapped portrait (photo 04) on a green block, large faint "01", real bio text. |
| "We have the experience… " + video play button | "Come lavoro / methods" atmospheric row using a session photo; NO fake video-play unless we have real video (we don't yet — leave a photo). |
| "Awards and Accomplishments" + logos (dark band) | REPLACE with dark-green band: either the philosophy statement (already built) OR a factual credentials strip (years, training, supervision). NO awards, NO counters, NO client numbers. |
| "We offer a broad range of law services" 01–04 list | "Di cosa mi occupo" — concerns/services with the big faint numerals treatment. Real concern names. |
| "What our clients say" (testimonials) | REMOVE ENTIRELY. Client decided: a discreet "Trovami su Google" outbound link only (footer). Do not build a testimonials block in any form. |
| "About me and my team" + team member cards | "Chi sono" expanded — ONLY Giuseppe. NO team cards. Overlap composition with photo. |
| Dark quote band "No man is above the law" + "Get free consultation" | Dark-green atmospheric band with a calm philosophy line (NO "free consultation" CTA — a neutral "Prenota un primo colloquio" at most). |
| "Latest news and articles" | "Risorse / dal blog" — knowledge-base cards (already auto-queried). |
| "Contact us" + map + photo | Final contact block + locations (Online/Milano/Monza). Map belongs on location pages, keep home light. |

## Composition techniques to actually implement (this is what makes it "not flat")

- **Overlap & break-out:** images and color blocks overlap adjacent sections / bleed past
  the container edge. This is the single biggest "expensive" cue — use it on hero and about.
- **Oversized faint numerals** behind/beside section starts (bigger and more present than the
  current timid "01/02/03").
- **Asymmetry:** offset text columns, uneven whitespace, not everything centered/even.
- **Dark-green full-bleed bands** for atmosphere and rhythm (replaces williamson's dark bands).
- **Large Marcellus headlines** with generous scale contrast against Lato body.
- **Depth via soft shadows** on overlapping elements (one shadow token, restrained).
- Slow, reduced-motion-gated reveals (reuse the Care Pathway mechanism), NO sliders/parallax.

## Hard constraints (unchanged, non-negotiable)

- Keep the system: Marcellus (display, ≥24px, regular-only) + Lato, ivory #F7F4EE,
  pine-green #22423A, sand #f4e3ca. You may add shadow/tone tokens; do not replace palette/fonts.
- ALL §9 deontology exclusions: no testimonials, no free/discount, no stats/counters/client-
  numbers, no urgency, no outcome claims. If a williamson block implies one, replace per the
  table — never reproduce it.
- SSG/ISR static, WCAG AA (check contrast of text over photos — add scrims/overlays where
  needed), reduced-motion, 360px responsive, CLS-safe (explicit image dimensions).
- Photos in Sanity long-term, but for the lab you may reference the uploaded files directly.

## Deliverable

Build a full-length homepage mockup on /design-lab using the real photos and the williamson-
adaptation composition. Screenshot desktop + 360px to .review/. Show me:
1. the hero raw vs. tonally-treated (to pick the photo treatment),
2. the full page flow,
3. the two overlap compositions (hero, about) up close.
Real homepage stays untouched until I approve. Then we port approved pieces to the real
components + move photos into Sanity.

Start with the hero (overlap + photo treatment) and show me that ALONE first — it sets the
whole language; I want to rule on it before you build the rest.
