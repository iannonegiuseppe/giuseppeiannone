# DESIGN DIRECTION — Stage 3 Input (Tokens, Typography, Components)

> Purpose: the authoritative visual brief for Stage 3. When Stage 3 starts, this file
> is given to Claude Code together with the phase prompt. Decisions marked ⚑ need
> Aliaksandr's confirmation before Stage 3 begins.

## 1. Aesthetic thesis

A calm, editorial, quietly premium site for a psychotherapist — closer to a well-set
book than to a clinic brochure, and nothing like a corporate consulting page. The
visitor is often anxious; every design choice should lower arousal: warm light
surfaces, generous whitespace, long readable measure, one soft accent, no urgency
devices anywhere (no countdowns, no promo badges, no aggressive CTAs).

Reference mapping (structure only — tone always from the calm cluster):
- **thebalance.care** → primary mood anchor: warm neutral palette, calm imagery,
  locations strip, "care pathway" storytelling, clinical-philosophy page structure
- **paracelsus-recovery.com** → restrained premium: deep dark accent on ivory,
  large display serif, unhurried pacing
- **williamson (ThemeREX)** → ONLY the whitespace discipline; none of its corporate
  tone, gold buttons, or hero forms
- Hero reference screenshots (consulting + law firm) → ONLY the split-hero layout
  skeleton; explicitly NOT their progress bars, client counts, or promo CTAs

## 2. Color tokens

Warm ivory base with one deep accent. Deliberately NOT the generic AI combo of cream +
terracotta: the accent is a deep pine-ink green — clinical calm, pairs with the
doctor's dark-jacket photography, and differentiates from the sea of warm-clay sites.

```scss
--color-bg:            #F7F4EE;  // ivory — page background, warm but not yellow
--color-surface:       #FFFFFF;  // cards, form fields
--color-surface-tint:  #EFEAE0;  // alternating sections, quiet blocks
--color-accent:        #22423A;  // deep pine-ink green — links, buttons, display headings accents
--color-accent-hover:  #2E5348;
--color-accent-soft:   #E4EAE6;  // accent-tinted backgrounds (key takeaways box, pathway steps)
--color-text:          #26231F;  // warm near-black — body text
--color-text-muted:    #6B655C;  // secondary text, captions, breadcrumbs
--color-hairline:      #E3DDD1;  // borders, dividers
--color-focus:         #2E5348;  // focus rings — visible, not decorative
```

Accent CONFIRMED as the deep pine-ink green `#22423A` — decided against the photos:
the doctor's wardrobe is navy/light-blue (dark polo, blue shirts, blue blazer, white
coat over dark) and the backgrounds are cool (grey walls, pale-blue abstract art,
ivory surfaces). The green bridges the cool blues and the warm ivory without competing,
and avoids "another blue-and-white medical site". The espresso alternative is dropped.
Note for photo-hero sections: the navy clothing sits close to the dark text neutrals —
watch contrast if dark text or buttons overlay a photograph.

Contrast floor: body text and muted text must pass WCAG AA on `--color-bg` and
`--color-surface-tint` (the values above do; re-check if adjusted).

## 3. Typography

CONFIRMED pairing (approved by the client): **Marcellus** (display/headings) +
**Lato** (body/UI). Both self-hosted via `next/font`, no CDN. Both fully cover Italian
diacritics (à è é ì ò ù).

Constraints that MUST be encoded:
- **Marcellus is Regular-only — there is no bold weight.** Never fake-bold it. Heading
  hierarchy is expressed by SIZE, never by weight. Do not apply font-weight >400 to
  Marcellus.
- **Marcellus is a delicate display serif — use it large only (≥24px).** H1 and H2 in
  Marcellus. H3 and anything smaller: use Lato (600) rather than shrinking Marcellus,
  which loses legibility at small sizes.
- Lato carries ALL body text, UI labels, captions, breadcrumbs, buttons, form fields.
- Fallback stacks: `Marcellus, Georgia, serif` / `Lato, system-ui, sans-serif`.

Type scale (desktop / mobile), rem-based tokens:
```
--fs-display:  clamp(2.5rem, 5vw, 3.75rem);  // H1 — Marcellus 400, lh 1.15, tracking normal
--fs-h2:       clamp(1.75rem, 3vw, 2.25rem); // Marcellus 400, lh 1.25
--fs-h3:       1.375rem;                     // Lato 600 (NOT Marcellus — too small), lh 1.3
--fs-body-lg:  1.125rem;                     // Lato 400, intro paragraphs, lh 1.65
--fs-body:     1rem;                         // Lato 400, lh 1.7, max measure 68ch
--fs-small:    0.875rem;                     // Lato 400/500, captions, breadcrumbs, lh 1.5
```
Marcellus has generous natural letterspacing — do not add positive tracking to it.
Body text is never justified; paragraphs separated by space, not indents.

## 4. Space, radius, layout

```
--space: 4px base → scale 4/8/12/16/24/32/48/64/96/128
--radius-s: 6px (inputs, tags)  --radius-m: 12px (cards)  --radius-l: 20px (imagery)
--container: 1200px max, 24px gutters mobile / 48px desktop
```
Section rhythm: 96–128px vertical between homepage sections (desktop), 64px mobile.
One idea per viewport. Images get `--radius-l` and warm treatment; no hard 0-radius
broadsheet look, no glassmorphism, no gradients.

## 5. Signature element — BUILT & APPROVED (homepage)

**Il percorso (the care pathway).** Status: built in Step 5, approved. Content lives in
`siteSettings.carePathway` (shared, localized it/en). Verified: all 4 steps present with
no-JS, `prefers-reduced-motion` keeps opacity 1, normal motion triggers scroll-reveal.
Remaining: its SECOND appearance on the METHOD page (Step 7). One quiet visual motif owned by this site: a thin
vertical guide-line with soft nodes marking the steps of therapy (primo colloquio →
valutazione → percorso → verifica). It appears twice only: the homepage "how therapy
works" section and the METHOD page. It is calm structure — not a timeline gimmick:
numbered because therapy genuinely is a sequence, muted accent-soft nodes, generous
spacing, no animation beyond a gentle scroll-reveal (disabled under
prefers-reduced-motion). Everything else on the site stays quiet so this one element
carries the identity.

## 6. Component notes

- **Hero (home):** split layout — left: name, title line, one-sentence positioning,
  ONE soft CTA ("Prenota un primo colloquio"), trust line with Ordine registration
  number in `--fs-small` muted; right: photograph (warm, natural light). NO form, NO
  stats, NO percentage bars, NO client counts, NO "free" promo styling.
- **Locations strip:** ONLINE / Milano / Monza as three quiet cards linking to
  location pages; text-first, small map thumbnails at most.
- **Credentials strip:** factual only (years in practice, training, supervision) as
  plain text pairs — not animated counters.
- **Key Takeaways box:** `--color-accent-soft` background, `--radius-m`, small
  eyebrow label ("In breve" / "Key points"), 3–6 short lines. Sits high on long pages.
- **FAQ accordions:** hairline-divided, plus/minus indicator, generous padding;
  question in sans 500, answer in body. Rendered open-content in HTML (details/summary
  or accessible disclosure) — answers must exist in the DOM for crawlers.
- **Cards (condition/treatment/related):** surface white, hairline border, title +
  2-line description + quiet arrow link; hover = border darkens, no lift-shadows.
- **CTA block (in-content):** accent-soft background band, one sentence + one button;
  reassuring copy ("Se ti riconosci in questi sintomi, parliamone"), never urgency.
- **Footer:** deep accent background, ivory text; contact details, locations, legal
  links, and the crisis-support line (112 reference) in a clearly readable block.
- **Buttons:** solid accent, ivory text, `--radius-s`+2, 44px min touch target;
  secondary = hairline outline. No gradients, no icon-arrows-everywhere.

## 7. Imagery & motion

Photography: warm natural light, real practice/portrait imagery of the doctor;
no stock handshakes, no brains/head-with-gears clichés, no despair-toned imagery of
people in distress. Illustrations only if consistent (thin-line, muted) — prefer none.
Motion: near-none. Allowed: gentle fade/translate scroll-reveals (≤300ms, once),
accordion transitions, focus-visible states. All gated by prefers-reduced-motion.

**Photo tonal treatment — CONFIRMED, site-wide, not a one-off (Stage 3 hero
approval, see docs/adaptation/adaptation-brief.md):** the real photo set has
mixed backgrounds/tones (grey, bluish, warm) and needs one consistent grade so
every photo reads as the same expensive set rather than a mixed gallery. Apply
this exact CSS filter to every site photo (portraits, session scenes, location
photos — anywhere a real photo appears, not just the hero):

```scss
filter: saturate(0.7) sepia(0.25) hue-rotate(-12deg) brightness(1.06) contrast(0.95);
```

This is a **filter only** — do not pair it with a color/blend-mode wash layer
(a soft-light tint over the image, tried during the hero build and rejected: it
amplifies the photo's own natural bright patches into a visible "fades to
ivory" artifact around any overlapping text). The filter alone grades the
whole image uniformly without that risk. Implement as a shared class/mixin
once real photos are wired into non-lab components — do not hand-roll the
filter value per component.

## 8. Copy register (microcopy)

Italian first, calm, plain verbs, sentence case. Buttons say what happens ("Prenota un
primo colloquio", "Scrivimi", "Leggi il percorso"). No exclamation marks, no scarcity,
no "gratis" styling. Forms: label above field, visible confidentiality note, errors that
say what to fix.

Register (tu vs Lei): NOT yet decided — the doctor will settle it when he reviews the
Italian. Until then, keep register-conjugated strings in the messages catalog
(messages/it.json) as single editable entries, and prefer register-neutral nouns where
possible ("Contatti", "Prenotazione") so switching tu/Lei later is one place, not a hunt.
Do NOT hardcode tu or Lei into components.

## 9. Hard exclusions (deontology + strategy — non-negotiable)

- No testimonials/reviews block in any form. SETTLED (client decided): reason is the
  Italian psychologist deontology prohibition, NOT a deferred feature — do not
  re-introduce it in any future session as a "missing" block. Instead, a discreet
  outbound link to the doctor's Google profile is allowed (see §11).
- No percentage bars, client counters, "500+" style claims, or "100%" claims
- No "free first session" promo framing; the neutral "primo colloquio conoscitivo" only
- No urgency devices, discount styling, or comparison-with-competitors copy
- No promises of outcomes anywhere in copy or visuals

## 10. Design charter — "not ordinary, and expensive-looking"

These rules are checkable. Every section must pass them before it ships.
If a rule blocks something we want, we change the rule deliberately —
not silently.

### 10.1 Scale contrast (revised)
Measure the ratio between a section's largest heading and its BODY text
(`--fs-body`). Kickers, eyebrows, captions, meta lines and labels are
excluded — they are labels, not typographic levels.

- Every section: ratio ≥ 2× against body text.
- The page as a whole: at least three sections must carry a genuine
  display-scale element (≥ `--fs-h2-lg`), and they must be spread across
  the page, not adjacent.
- List-item titles are content, not headings: they must stay below their
  own section's heading, and raising them to satisfy a ratio is a
  violation of this rule, not compliance with it.

### 10.2 One device per job

Each visual device has exactly one meaning sitewide:

- hairline = boundary between items in a list
- tinted surface (sand) = grouping of related content
- dark band = tonal punctuation, never decoration
- card = an item in a collection

No new device may be introduced without retiring one. Reusing a device
for a second meaning is the fastest way to look ordinary.

### 10.3 Asymmetry by default

Centred layouts are reserved for punctuation moments (pull quotes, the
CTA bridge, the signature). Maximum two centred sections per page.
Everything else is asymmetric, with intent.

### 10.4 Dark bands: rhythm, not decoration

Maximum four dark sections per page, never two adjacent, each separated
by at least two light sections. Every dark band must carry content that
justifies the emphasis.

### 10.5 Images bleed

Any section built around an image must touch at least one viewport edge,
or occupy at least 50% of the container width. Small images floating in
the middle of a container read as filler.

### 10.6 Whitespace is grouped, not uniform

Related elements sit close, unrelated ones far. Target ratio between
"inside a group" and "between groups" is at least 1:2.5. Equal padding
everywhere is what makes a page feel empty rather than airy.

### 10.7 Icons carry information or don't exist

An icon is allowed only when it conveys something the text cannot.
Generic conceptual icons (brain, heart, puzzle, lightbulb, head with
gears) are forbidden — they read as clip-art and undercut the site's
seriousness. Abstract geometric marks derived from the site's own
typography are acceptable.

### 10.8 Photography standard

Real photography only. No stock imagery, no AI-generated likenesses.
The client's own commissioned session photographs are permitted
(decision of 24.07.2026, agreed with the client); photographs of
unrelated models presented as clients are not.

### 10.9 One focal point per section

If a visitor can't say in one second what a section is about, the
section has two focal points and one must go.

### 10.10 Motion budget

Maximum four motion moments per page. Each must be reversible, respect
`prefers-reduced-motion`, and last ≤ 400 ms unless scroll-driven.
Motion that only decorates is removed.

### 10.11 Not everything lives in the container

Full-bleed is a deliberate tool, not an accident. Per page:

- at least two sections must break the container and touch both viewport
  edges (dark bands, image-led sections, the map);
- at most four, so the container's rhythm still reads as the default;
- never two full-bleed sections adjacent — the contained sections
  between them are what make the bleed legible;
- a section that bleeds must have a reason: tonal punctuation, an image
  that needs the width, or a surface that groups several blocks.

Contained content inside a full-bleed surface still respects the
container's inline padding — bleeding the background does not mean
bleeding the text.

## 11. Decisions logged during Stage 3

- **Google profile link:** the client chose a discreet outbound link to his Google
  profile (label "Trovami su Google" — neutral, never "recensioni"/"reviews"), rendered
  only when `siteSettings.googleProfileUrl` is populated, `rel="noopener noreferrer"`.
  NO reviews widget, NO Google API pull-back — outbound link only.
- **Copyright notice:** footer must show a copyright line (© doctor's name, current year
  dynamic, "tutti i diritti riservati") — promised to the client as authorship
  protection. No copy-blocking scripts (they harm accessibility and AI citeability and
  don't stop real copying).
- **Hero video:** hero slot accepts an OPTIONAL background video alongside the photo.
  Photo is the default and the poster/first frame. If a video is provided: muted, loop,
  autoplay, playsInline; MUST degrade to static photo under prefers-reduced-motion and
  on small viewports / save-data; must be LCP-safe (not block first paint). No video
  asset exists yet — renders as photo until provided.
- **WhatsApp:** contact channel (dedicated field, "Scrivimi su WhatsApp" action), NOT in
  the social-profiles list. Instagram is a normal social link (pending a quick check with
  the doctor that the account is professional/educational, not personal).
- **Crisis-support line:** required field in siteSettings, seeded with Italian 112 +
  Telefono Amico reference; must be genuinely readable in the footer, not tiny grey.

## 12. Quality floor

Responsive to 360px; keyboard focus visible everywhere; WCAG AA contrast; single H1
per page; landmarks (header/nav/main/footer); prefers-reduced-motion respected;
CLS-safe (explicit media dimensions); fonts via next/font with fallback stacks
(`Marcellus, Georgia, serif` / `Lato, system-ui, sans-serif`).
