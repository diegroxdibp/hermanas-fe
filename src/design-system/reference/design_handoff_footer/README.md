# Handoff: Care — Site Footer

## Overview
A single global footer for the Care marketing site (Clínica Ampliada Ressignificações). It replaces the previous flat cyan band — which only held a copyright line and three icons — with a proper site index: brand mark, two navigation columns, and a contacts column. The cyan stays in the brand but is demoted to a thin decorative **wave divider** at the top, so all text sits on a pale ground and stays readable (the old indigo-on-cyan was low-contrast).

## About the Design Files
`Footer.html` in this bundle is a **design reference created in HTML** — a prototype that shows the intended look, structure, and behavior. It is **not** meant to be dropped into production as-is. Recreate it in the target codebase using that project's existing environment and conventions. Care's production app is **Angular 20** (`care-fe`, repo: https://github.com/diegroxdibp/hermanas-fe) with an existing `app-footer` component and SCSS — port this markup/styling into that component and its stylesheet, reusing the existing color/type tokens rather than re-declaring them. If implementing somewhere with no existing environment, pick the most appropriate framework and port it there.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and layout. Recreate pixel-faithfully using the codebase's existing design tokens and component patterns. The hex values and measurements below are exact.

## Screens / Views

### Footer (global)
- **Purpose:** Site index at the bottom of every page — lets a user who scrolled to the end find the FAQ, booking flow, legal pages, and contact channels.
- **Layout:**
  - Full-bleed wrapper with background `#f6f7fb` (`--color-surface-tint`).
  - **Wave divider** at the very top: a full-width inline SVG, 46px tall, `preserveAspectRatio="none"`, filled cyan `#77c5d5`. It spans the wrapper width and sits above the content.
  - Content is centered with `max-width:1280px; margin:0 auto`, horizontal padding `64px` (→ `24px` below 880px viewport).
  - **Top region:** CSS grid, `grid-template-columns: 1.5fr 1fr 1fr 1.3fr`, `gap:48px`, `align-items:start`, padding `24px 0 48px`.
    - Below 880px the grid collapses to `1fr 1fr` (2 columns).
  - **Bottom bar:** flex row, `justify-content:space-between`, `border-top:1px solid #d4d7e3`, padding `22px 0`.
- **Columns (left → right):**
  1. **Brand** — `logo-horizontal.svg`, height 42px, vertically centered in its cell (`align-self:center`).
  2. **Links Úteis** — heading + list: `FAQ`, `Agendar`.
  3. **Institucional** — heading + list: `Política de Privacidade`, `Termo de Uso`.
  4. **Contatos** (rightmost) — heading + list, each row = icon + label, icon precedes the text:
     - Email — envelope icon — `ola@care.pt` (`mailto:`)
     - Instagram — Instagram glyph — `@care` (links to `https://instagram.com/care`)
     - WhatsApp — WhatsApp glyph — `+351 915 784 896` (links to `https://wa.me/351915784896`)
- **Bottom bar copy:** `Todos os direitos reservados © Care 2026 · +351 915 784 896`

### Component details
- **Section headings (`h4`):** 13px, weight 700, `letter-spacing:1.6px`, `text-transform:uppercase`, color `--color-primary-blue` `#22326e`, margin-bottom 18px.
- **Link lists (`ul`):** no bullets, `display:flex; flex-direction:column; gap:11px`.
- **Links (`li a`):** 15px, weight 400, color `--color-secondary-indigo` `#42458e`, no underline. **Hover:** color → `--color-primary-purple` `#8e7fae`, `transition: color .2s cubic-bezier(.4,0,.2,1)`.
- **Contact rows:** each `<a>` is `display:flex; align-items:center; gap:11px`. Icon is an inline SVG, 18×18px, `fill:currentColor` (so it inherits the indigo link color and the purple hover), `flex:none`.
- **Bottom bar text:** 13.5px, color `#737a8c`.

## Interactions & Behavior
- **Link hover:** indigo → purple over 0.2s (`cubic-bezier(.4,0,.2,1)`). No underline. This matches Care's footer/link convention.
- **Social/contact links** open in a new tab (`target="_blank" rel="noopener"`); email uses `mailto:`, WhatsApp uses a `wa.me` deep link.
- **Responsive:** ≥880px the four columns sit in one row (`1.5fr 1fr 1fr 1.3fr`). <880px they reflow to a 2-column grid and side padding drops from 64px to 24px. The wave divider scales fluidly (`preserveAspectRatio="none"`).
- No animations on load; the wave is static. (Care's system favors slow, restrained motion — don't add bounce/parallax.)

## State Management
None. The footer is fully static/presentational — no state, no data fetching. Links point to existing routes/FAQ/legal pages in the app.

## Design Tokens
All from the Care design system (`colors_and_type.css`). Use the codebase's existing token names; values shown for reference:

| Token | Value | Use |
|---|---|---|
| `--color-primary-blue` | `#22326e` | headings, bar text base |
| `--color-secondary-indigo` | `#42458e` | links, contact icons (default) |
| `--color-primary-purple` | `#8e7fae` | link/icon hover |
| `--color-secondary-cyan` | `#77c5d5` | wave divider fill |
| `--color-surface-tint` | `#f6f7fb` | footer background |
| `--color-border` | `#d4d7e3` | bottom-bar top divider |
| muted gray (bar text) | `#737a8c` | copyright line |
| `--font-sans` | Source Sans 3 | all text |
| `--ease-care` | `cubic-bezier(.4,0,.2,1)` | hover transition |

Spacing used: grid gap 48px, list gap 11px, icon gap 11px, h4 margin-bottom 18px, top padding `24px 0 48px`, bar padding `22px 0`, wrapper padding 64px (24px mobile). Wave height 46px. Logo height 42px. Icon size 18px.

## Assets
- `assets/logo-horizontal.svg` — the horizontal Care logo (navy bird-and-wave mark). Included in this bundle. In production, reuse the existing logo asset already in `care-fe`.
- **Icons are inline SVG paths** (no icon library dependency): envelope (generic mail), Instagram, and WhatsApp glyphs are from Font Awesome's free brand/solid set. The Instagram and WhatsApp marks are the **complete official glyphs** (the previous mock had an incomplete WhatsApp bubble with no handset — that's been corrected). If the codebase already uses Material Symbols, you may substitute `mail`, but keep recognizable official brand marks for Instagram/WhatsApp. Keep them monochrome (indigo) per the brand — do not apply Instagram's gradient or WhatsApp green.
- **Wave divider** is an inline SVG path, not an image asset.

## Files
- `Footer.html` — standalone, self-contained reference (Footer 3, "Calm light + cyan wave"). Open it in a browser to see the exact target.
- `assets/logo-horizontal.svg` — logo used by `Footer.html`.

The wider exploration that this was chosen from lives in the project at `Footer Explorations.html` (four directions; this is direction #3).
