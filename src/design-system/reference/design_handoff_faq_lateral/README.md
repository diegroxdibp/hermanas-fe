# FAQ — “Lateral” direction · Claude Code handoff

Implementation package for **option 2 (Lateral)** of the new CARE FAQ.

## What this is

A FAQ section with two layouts driven by one breakpoint (`768px`):

- **Desktop (≥768px):** a sticky left rail of topics + the selected topic’s questions
  in the right column. One topic selected at a time; questions are a single-level
  accordion of answers.
- **Mobile (<768px):** a **nested accordion**. At rest only the four topic rows show
  (name + question count + chevron). Tapping a topic expands it **in place** to reveal
  its questions on a pale `surface-tint` panel; tapping a question reveals its answer.
  **One topic open at a time**, and opening a topic resets its open question.

A “Ainda com alguma dúvida?” contact prompt closes the section in both layouts.

## Files

```
angular/
  faq.component.ts      ← standalone component: signals + state logic + the FAQ data
  faq.component.html    ← template (desktop rail + mobile nested accordion + contact)
  faq.component.scss    ← styles; design-system values at the top, map to your tokens
reference/
  Lateral-FAQ.html      ← open in a browser to see the exact target (desktop + mobile,
                          fully interactive). This is the source of truth for visuals.
```

Open `reference/Lateral-FAQ.html` first — it renders the desktop and a phone-framed
mobile side by side so you can click through the real interaction.

## Wiring into the Angular app

1. Drop the three `angular/` files into e.g. `src/app/features/faq/`.
2. Replace the inline `faq: FaqTopic[]` array in `faq.component.ts` with your real source
   (`AppConstants.faq`, a resolver, or an `@Input()`). The shape matches your existing
   `FaqTopic` / `FaqItem` interfaces. **The two placeholder topics (“Clínica” Q2/Q3 and
   “Política de privacidade” Q2/Q3) and the joke answers from the codebase
   (“Chama a puliça.”, “Com magia negra.”, “Sei lá.”) have been replaced with plausible
   copy — review against final content.**
3. Point the contact CTA `routerLink` (currently `/contato`) at your real route.
4. Fix the illustration path — the template references `assets/images/hands6.svg`
   (matches the codebase `assets/images/` convention).

## Implementation notes

- **State** uses Angular signals: `selectedTopic` (desktop), `openTopic` (mobile),
  `openQuestion` (both). A `qKey(topic, i)` keys the open question so the same helper
  works in both layouts.
- **Breakpoint** is tracked with a `isMobile` signal + `@HostListener('window:resize')`.
  If you prefer, swap this for Angular CDK `BreakpointObserver` — the template only reads
  `isMobile()`.
- **Animation:** the expand/collapse uses an Angular `[@expand]` trigger animating real
  `height: *`. This is deliberate — the HTML prototype used a CSS `grid-template-rows:
  0fr → 1fr` trick, which **collapses to 0 when nested** (a flexible grid track inside
  another flexible grid track resolves to zero). Angular’s height animation has no such
  problem, so the nested topic→question reveal works cleanly. If you ever port this to
  plain CSS, animate `max-height` on the outer (topic) reveal, not `grid-template-rows`.
  Each animated wrapper needs `overflow: hidden` (already set on `.faq__answer` and
  `.faq__topicBody`).
- **Tokens:** the SCSS hardcodes design-system values (blue `#22326E`, purple `#8E7FAE`,
  indigo `#42458E`, muted `#8897AD`, `surface-tint #F6F7FB`, etc.) at the top of the file
  for clarity. Map these to your existing `palette.scss` variables where they exist.
- **Type:** Source Sans 3, 400/600/700 — matches production.
- The chevron uses the exact `<path>` from your codebase; the plus/minus mark is the
  alternative toggle used on the question rows.

## Accessibility

- Every toggle is a real `<button>` with `[attr.aria-expanded]`.
- Reduced-motion: transitions are disabled under `prefers-reduced-motion: reduce`; the
  Angular `[@expand]` trigger respects the OS setting via Angular’s animations module
  (ensure `provideAnimations()` — not `provideNoopAnimations()` — is in your bootstrap;
  Angular auto-disables animations when the user prefers reduced motion).
