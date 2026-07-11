# DESIGN ENRICHMENT BRIEF — Homepage feels flat; propose (don't build yet)

> Paste into Claude Code on the `dev` branch. This is a PROPOSAL task, not an
> implementation task. Read the design brief and references, then come back with concrete
> visual proposals + mockups for review. Do NOT modify the existing homepage code until
> the proposals are approved.

## The problem

The homepage currently reads as flat and dated ("2010s template", not modern-premium)
even accounting for placeholder content. The client (a psychotherapist) and I both want
it to feel calm AND expensive/premium. Right now it doesn't feel expensive. Your job in
this task is to diagnose WHY and propose how to fix it — as proposals and mockups first,
not code.

## Hard constraints (read `docs/design-direction.md` in full first — these override any
## reference site)

- **Audience is anxious patients.** Premium here means *calm* premium. NO aggressive
  motion. Specifically FORBIDDEN because they cheapen the site AND raise arousal in
  anxious visitors: carousels/sliders, aggressive parallax, autoplay motion that jumps,
  ticker/counter animations, anything "attention-grabbing". These are markers of cheap
  themes, not premium sites — note that thebalance.care and paracelsus-recovery.com (the
  client's own premium references) use NONE of these.
- **Keep the approved design system:** Marcellus (display, ≥24px, regular-only) + Lato,
  ivory `#F7F4EE` base, pine-green `#22423A` accent, the full token set. This is
  ENRICHMENT of composition, not a new visual identity. You may propose ADDING tokens
  (e.g. more surface shades, a darker section background, shadow tokens) but not
  replacing the palette or fonts.
- **All §9 deontology exclusions still apply** (no testimonials, no stats/counters, no
  promo/urgency, no outcome claims).
- **Everything must stay SSG/ISR-static and pass the quality floor** (WCAG AA, reduced-
  motion, 360px, CLS-safe).

## Critical material constraint (this shapes the whole approach)

The doctor will likely only have his existing AMATEUR photos at launch (mixed quality,
some phone portraits on busy backgrounds, some white-coat clinical shots we're avoiding).
**We cannot lean on big photography/video for premium feel — the raw material won't
support it.** So premium must come from what we fully control: typography, composition,
rhythm, whitespace, color depth, and restrained motion — the editorial/luxury-with-
minimal-imagery approach, which also matches the client's "I like the fonts" refs
(askit, paracelsus).

In your proposal, explicitly address: what specific improvement ONE good professional
photo (a single hero portrait) would unlock vs. working purely with what we have — so I
can decide whether to recommend the client invest in one shot.

## What I want you to actually diagnose

The current homepage is: heading + card, heading + card, heading + card — uniform blocks,
one background color, no rhythm, no depth, no focal hierarchy. Diagnose the real reasons
it reads flat (I suspect: no sectional rhythm, no background alternation, no depth/layering,
weak typographic contrast, too-even spacing, no atmospheric anchor) and propose fixes for
each.

## Deliverable — PROPOSALS + MOCKUPS, not implementation

1. A short written diagnosis (why it reads flat/dated) — specific, not generic.
2. 3–5 concrete enrichment directions, each with: what it changes, why it adds premium
   feel WITHOUT violating the constraints, and the effort/risk. Examples of the RIGHT
   kind of move (illustrative, propose your own): sectional background alternation
   (ivory / surface-tint / deep-green full-bleed sections) for rhythm; a full-height hero
   with better typographic scale and composition; generous asymmetry; layered depth via
   subtle shadows and overlap; slow, tasteful scroll-reveals extended beyond care-pathway;
   a stronger type hierarchy; an atmospheric section (e.g. the deep-green "philosophy"
   band the client liked on thebalance). Use the `frontend-design` skill's guidance on
   distinctive-vs-templated design.
3. Visual mockups I can actually look at: build them on a THROWAWAY `/design-lab` route
   (or a few numbered variants) so I can see the directions rendered, WITHOUT touching
   the real homepage. Screenshot them to `.review/`. Static/isolated, deleted after we
   decide.
4. A recommendation: which combination you'd pick and why, given the amateur-photo
   constraint.

## What NOT to do
- Do NOT rebuild or modify the real homepage/components yet.
- Do NOT add sliders, parallax, carousels, or heavy JS animation libraries.
- Do NOT introduce a new color palette or fonts.
- Do NOT use placeholder "premium stock" imagery in mockups that we won't have — mock
  with the real constraint (our actual photo quality, or tasteful no-photo compositions).

## On "depth" and gradients (important nuance)

The flatness needs DEPTH, but do NOT solve it with decorative color gradients — those
read as cheap/templated and the client's own premium references (thebalance, paracelsus)
use none. Instead, propose depth via premium-appropriate means: sectional background
alternation (ivory / surface-tint / a deep pine-green full-bleed section), very subtle
shadow tokens for gentle layering (not chunky 2010s drop-shadows), overlap/asymmetry,
and — at most — an almost-imperceptible tonal shift within a section (a 2–3% warmth
gradient that reads as "light/atmosphere", never as a colored gradient). A deep-green
atmospheric "philosophy" band (which the client liked on thebalance) is a strong,
on-brand way to add depth and richness. Flat, confident color blocks read more expensive
than any color gradient.

Start with the written diagnosis, then show me the enrichment directions before building
any mockups — I want to approve the directions before you spend effort rendering them.
