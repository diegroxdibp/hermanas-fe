# Handoff: Scheduling Page (Agendar consulta)

## Overview
This is the patient-facing **session scheduling** screen for CARE (Clínica Ampliada Ressignificações). A signed-in patient picks a **service**, a **professional**, reviews the professional's profile, picks a **date** from a calendar, then expands an availability slot, chooses a **modality** (presencial / remoto / qualquer), and confirms with **Agendar**. On confirmation a toast appears and the slot turns into a "Confirmado" success state.

## About the Design Files
The files in this bundle are **design references created in HTML/React (Babel-in-browser)** — a working prototype that demonstrates the intended look and behavior. They are **not production code to ship directly**.

Your task is to **recreate this design inside the target codebase's existing environment**. The source product (`hermanas-fe`) is an **Angular 20** app, so the natural target is Angular components + SCSS using Angular Material (`<mat-icon>`, `<mat-menu>`, `<mat-datepicker>` etc.). If you are building somewhere else, use that stack's idioms. Either way, lift the **exact tokens, spacing, copy, and interaction rules** documented below — don't copy the prototype's React structure verbatim.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, and interactions are final and pulled directly from the CARE design system (`colors_and_type.css`). Recreate the UI pixel-for-pixel using the codebase's existing component library, then bind it to real data and APIs. This package covers **two breakpoints**: desktop (centered 760px column, inline popovers) and mobile (≤~480px, bottom-sheet pickers + hamburger) — see the **Mobile breakpoint** section. Build them as one responsive component.

---

## Screen: Agendar (Schedule a session)

### Layout
- **Fixed top header**, 70px tall (88px in the prototype's desktop comp — production header is `--header-h: 70px`; match production), white background, full-bleed. Logo left, nav + account controls right.
- **Single centered column** below the header. Max content width **760px**, horizontally centered (`margin: 0 auto`), with 24px side padding and ~40px top padding.
- The column is a vertical **flex stack with 16px gap**. Order, top to bottom:
  1. Service select (filled field)
  2. Professional select (filled field)
  3. Professional preview card
  4. Date field (filled field, opens calendar)
  5. One or more availability **slot cards**
- Responsive: the inner column simply narrows; below 720px the header compresses to 70px and hides the user's name/role text (avatar + chevron remain). A `≤1080px` breakpoint also hides the user-meta text to avoid nav overflow.

### Component: Header
- Height 70px, `background: #fff`, `position: fixed/sticky; top: 0; z-index: 50`. Side padding 32px.
- **Logo** left — `assets/logo-horizontal.svg`, ~56px tall (40px on mobile).
- **Nav** pushed right (`margin-left: auto`), horizontal flex, gap ~40px. Links: **Home, Sobre, Contato, Agendar**. Active = Agendar.
  - Link style: `font-weight: 700`, color `--color-primary-blue` (#22326e), size ~20–22px.
  - **Hover:** color shifts to `--color-primary-purple` (#8e7fae) + `transform: scale(1.05)`, `transition: .2s`. (Production scales to 1.1 — either is on-brand.)
- **Notification icon button** — Material Symbol `notifications`, 44×44 circular hit area, color blue. A 9px lilac (`--color-primary-purple`) dot with a 2px white border sits top-right as the unread indicator. Hover bg = `--color-surface-tint`.
- **User chip** — pill button, 44px+ tall, containing:
  - 46px circular **avatar**, `background: --color-primary-blue`, white bold initials (`DP`).
  - Two-line **meta**: name (`Diego`, bold blue 17px) + role (`Paciente`, regular blue 15px, 0.85 opacity).
  - `expand_more` chevron, 24px, blue.
  - Hover bg = `--color-surface-tint`.

### Component: Filled select field (Service / Professional / Date)
A custom "filled" field — **not** an outlined input. This is the core form control on the page.
- Container: `background: --color-surface-tint` (#f6f7fb), `border-radius: 6px`, padding `14px 18px 12px`, `border: 1px solid transparent`, full width, left-aligned, `cursor: pointer`.
- **Floating label** (top line): 13px, regular, color blue at 0.72 opacity. Required fields append a lilac asterisk (`--color-primary-purple`).
- **Value** (bottom line): 19px, `--fw-semibold` (600), blue. When empty, show placeholder text at `--fw-regular` in `--color-muted` (#8897ad).
- **Trailing icon**, right-centered, blue, 22px: `expand_more` for the two selects, `calendar_today` for the date field.
- **Hover:** border-color → `--color-border` (#d4d7e3).
- **Open:** border-color → `--color-primary-blue`, background → white, plus `box-shadow: inset 0 0 0 1px var(--color-primary-blue)`.

### Component: Dropdown popover (Service / Professional)
- Absolutely positioned 6px below the field, full field width, `background: #fff`, `border-radius: 8px`, `border: 1px solid --color-border-soft` (#e6e8f1), elevation `--shadow-floating` (`drop-shadow(0 8px 24px rgba(34,50,110,.18))`), `overflow: hidden`.
- Entry animation: `popIn` — opacity 0→1 + translateY(-4px→0) over 120ms.
- **Option row:** padding `12px 18px`, 17px blue text, flex with a right-aligned secondary `meta` (13px, `--color-muted`) — service duration for services, primary specialty for professionals. Hover bg `--color-surface-tint`. Selected row: bg `--color-surface-tint` + `--fw-semibold`.

### Component: Date field → Calendar popover
- Field same as above, trailing `calendar_today`. Default value in the prototype is **10/06/2026** (`dd/mm/aaaa` format).
- Popover width 320px containing a month calendar:
  - **Header:** `‹` / `›` chevron buttons (32px circular, hover bg `--color-surface-tint`) flanking a centered month label (`månad yyyy`, Portuguese month names, capitalized, 16px semibold blue).
  - **Grid:** 7 columns, 2px gap. Weekday header row `D S T Q Q S S` (11px, uppercase, `--color-muted`, 0.5px tracking).
  - **Day cell:** square (`aspect-ratio: 1`), circular on hover (`--color-surface-tint`), 14px medium blue.
    - Other-month days: muted + 0.4 opacity.
    - Today: `inset 0 0 0 1px --color-primary-blue` ring.
    - Selected: `background --color-primary-blue`, white text.
    - Past days: disabled, muted, `cursor: not-allowed`.
- **Portuguese month names:** janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro.
- **Production note:** Angular ships `@angular/material/datepicker` — prefer wiring `mat-datepicker` with a `pt-BR`/`pt-PT` locale and `DD/MM/YYYY` format rather than hand-rolling this calendar, then style it to the spec above.

### Component: Professional preview card
- `border: 1px solid --color-border-soft`, `border-radius: 8px`, `background: #fff`, padding 24px, `min-height: 320px`, `position: relative`, `overflow: hidden`.
- **Name:** 26px bold blue.
- **Role + bio:** 15px blue at 0.85 opacity, `line-height: 1.55`, left-aligned, `max-width: 60%` (so it doesn't run under the photo).
- **Credential tags:** flex-wrap row, 8px gap. Each tag: 12px semibold blue text, `background --color-surface-tint`, padding `6px 10px`, `border-radius: 999px`.
- **Photo:** 168px circle, right-centered (`position: absolute; right: 24px; top: 50%; translateY(-50%)`), `background #d9d9d9`, with a large `person` Material Symbol as placeholder. **Replace with the real professional photo** in production (warm, daylit, unsaturated per brand). Mobile: 110px circle.
- **Empty state** (no professional selected): centered muted text "Selecione um profissional para ver o perfil."

### Component: Availability slot card
- `border: 1px solid --color-border-soft`, `border-radius: 8px`, `background: #fff`, padding `14px 18px 16px`. Hover/open border → `--color-border`.
- **Header row** (always visible, clickable to toggle), flex align-center, gap 24px:
  - **Time range** — e.g. `09:00 AM – 10:00 AM`, 18px semibold blue, `min-width: 200px`.
  - **Date** — e.g. `10/06/2026`, 16px regular blue, flex-grows.
  - **Person icon** — `account_circle`, 26px blue.
  - **Toggle button** — `expand_more`, 22px blue; rotates 180° when open (`transition: transform --dur-base --ease-care`).
- **Body** (expand/collapse): uses a `grid-template-rows: 0fr → 1fr` height animation over `--dur-base` with `--ease-care`; inner wrapper has `overflow: hidden`. Body has 14px top padding and a flex row (space-between):
  - **Segmented control** (modality) — see below.
  - **Agendar button** — see below.
- **Confirmed state:** `border-color: --color-secondary-green` (#56b093), `background: #f3faf7`. The Agendar button shows "Confirmado" and is disabled. In the prototype this auto-reverts after 4s; in production keep it confirmed (or navigate to a confirmation view).

### Component: Segmented control (modality)
- Pill container: `display: inline-flex`, `border: 1px solid --color-border`, `border-radius: 999px`, `padding: 4px`, white bg.
- Three buttons: **Presencial**, **Remoto**, **Qualquer**. Each: 16px medium blue, padding `8px 18px`, `border-radius: 999px`, flex with optional leading `check` icon (20px) when selected.
  - **Selected:** `background: #e6e3f0` (a pale lilac wash), `--fw-semibold`, leading check icon.
  - **Hover (unselected):** bg `--color-surface-tint`.
  - **Disabled** options (modality the professional doesn't offer): 0.4 opacity, `cursor: not-allowed`. A professional's allowed modalities come from their record (`modes`); "Qualquer" is always enabled.

### Component: Agendar button (outlined pill)
- `border: 1px solid --color-border`, white bg, 17px semibold blue, padding `10px 28px`, `border-radius: 999px`.
- **Hover:** border → `--color-primary-blue`, bg → `--color-surface-tint`.
- **Active:** `transform: scale(0.97)`.
- **Disabled** (already confirmed): 0.5 opacity, not-allowed.
- **Brand note:** production buttons are normally **filled rectangles with 12px radius** (`--radius-lg`), not pills. This screen uses an outlined pill to read as a lighter inline action; if your team prefers the canonical button, swap to the filled `--radius-lg` style — confirm with design.

### Component: Toast (confirmation)
- Fixed, top-center (~110px from top), `background: --color-primary-blue`, white text 16px medium, padding `14px 22px`, `border-radius: 10px`, `--shadow-floating`, max-width 520px, `pointer-events: none`.
- Entry: fade + translateY(-8px→0) over 250ms. Auto-dismiss after ~2.8s.
- Copy pattern: `Sessão agendada · {Profissional} · {dd/mm/aaaa} · {hora} · {modalidade}.`

---

## Interactions & Behavior
- **Service select** opens a dropdown of services; choosing one sets the value and closes.
- **Professional select** is gated on a service being chosen — placeholder reads "Escolha um serviço primeiro" and the field won't open until a service is set.
- **Date field** opens the calendar; choosing a day sets the value and closes. Month nav via `‹`/`›`. Past dates disabled.
- **Slot card** header toggles expand/collapse. First slot starts expanded (configurable).
- **Modality** is a single-select segmented control, defaulting to a configured value; options the professional doesn't offer are disabled.
- **Agendar** confirms: fires the toast, flips the slot to the confirmed state, disables the button.
- **Changing service / professional / date resets** any confirmed state.
- **Click-outside** closes any open dropdown/calendar (implemented via a mousedown listener on document).

### Animations & transitions (all from the design system)
| Element | Property | Duration | Easing |
|---|---|---|---|
| Dropdown / calendar popover | opacity + translateY | 120ms | `ease` (`popIn`) |
| Slot expand/collapse | `grid-template-rows` 0fr→1fr | `--dur-base` (0.3s) | `--ease-care` |
| Chevron flip | `transform: rotate(180deg)` | `--dur-base` | `--ease-care` |
| Hover states (links, fields, buttons) | color / background / transform | `--dur-fast` (0.2s) | `ease` |
| Toast in | opacity + translateY | 250ms | `ease` |
| Button active | `transform: scale(0.97)` | `--dur-fast` | `ease` |

No bounces, no springs, no parallax — per CARE motion guidelines.

---

---

## Mobile breakpoint (≤ ~480px)

The mobile screen is **not just the desktop column reflowed** — it adopts native mobile patterns. Implement it as the small-viewport layout of the same route. Reference files: `Scheduling Mobile.html` + `mobile-scheduling-app.jsx` (the `ios-frame.jsx` device bezel is **presentation chrome only — do not port it**; it just frames the screenshot).

### What changes from desktop
- **Header → hamburger.** The full nav (Home / Sobre / Contato / Agendar) collapses. The 70px bar keeps the logo (left) + a notification bell (with unread dot) + a **menu icon** (right). Tapping either the bell or the menu opens a **slide-up menu sheet** listing the nav items, Notificações (with a count badge), and the account row. Active item (Agendar) is bold with a trailing `check`.
- **Page title.** A visible `h1` "Agendar consulta" (25px bold blue) sits above the form — there's no desktop page title, but mobile needs the wayfinding.
- **Pickers → bottom sheets.** The three filled fields no longer open inline popovers. Tapping a field opens a **bottom sheet** (`border-radius: 20px 20px 0 0`, slides up from the bottom, dimmed scrim `rgba(34,50,110,0.32)`, drag-grip pill at top, title + close button):
  - **Service sheet** — option rows with name + duration; selected row bold with trailing check.
  - **Professional sheet** — richer rows: 44px circular avatar (initials, blue bg) + name + primary specialty; selected row trailing check.
  - **Date sheet** — the full month calendar (same spec as desktop, slightly larger 15px day cells for touch).
  - Sheet animation: `transform: translateY(100% → 0)` + scrim fade over `--dur-base` with `--ease-care`. Sheet caps at 78% height and scrolls internally.
- **Fields.** Full-width, `border-radius: 8px`, 12px vertical padding, label 12px / value 17px. Otherwise identical token usage to desktop.
- **Professional card.** Vertical: avatar (64px circle) + name + role on top row, **bio below full-width**, tags wrap underneath. `border-radius: 10px`.
- **Slot card.** `account_circle` leads the header, time + date stack in the middle, chevron toggle right. Expanded body is a **vertical** stack (not a space-between row):
  - **Segmented control stretches full width** — the three buttons are `flex: 1`, 14px labels.
  - **Agendar is a full-width FILLED button** — `background: --color-primary-blue`, white text, `border-radius: 12px` (the brand's canonical button, not the desktop outlined pill). On confirm it fills `--color-secondary-green` and reads "Confirmado".
- **Spacing.** Sections in the stack use a **22px gap**; inside an expanded slot the segmented control and Agendar button are separated by a **20px gap**.
- **Toast.** Anchored bottom (`left/right: 16px; bottom: 24px`), full-width pill, slides up.

### Mobile spacing tokens (as built)
| Gap | Value |
|---|---|
| Between form sections (service / professional / card / date / slots) | 22px |
| Between segmented control and Agendar (expanded slot) | 20px |
| Field internal padding | `12px 16px` |
| Header padding | `… 18px` side (top offset clears the status bar in the device mock only) |

Everything else — colors, type ramp, radii, shadows, motion, copy — is **identical to desktop** and pulls from the same tokens. Build mobile and desktop as one responsive component, switching layout (sheet vs. popover, hamburger vs. nav, filled vs. outlined action) at your small breakpoint.

---

## State Management
State needed for the screen (names are illustrative):
- `service: string | null` — selected service id.
- `professionalId: string | null` — selected professional id (depends on `service`).
- `date: Date` — selected date (defaults to next available; prototype seeds 2026-06-10).
- `openControl` — which dropdown/calendar is open (or per-control booleans).
- Per-slot: `expanded: boolean`, `modality: 'presencial' | 'remoto' | 'qualquer'`.
- `confirmedSlotId: string | null` — drives the confirmed/disabled state.
- `toast: string | null` — confirmation message, auto-cleared on a timer.

### Data fetching (production)
- **Services** — GET list of services (id, name, duration).
- **Professionals** — GET professionals filtered by selected service; each carries `{ id, name, initials, role, bio, tags[], modes[] (presencial/remoto), photoUrl }`.
- **Availability** — GET slots for `(professionalId, date)`; each slot `{ id, start, end }`. (The prototype fakes this deterministically — replace with a real availability endpoint.)
- **Booking** — POST `(slotId, modality)` to create the appointment; on success show the toast / navigate to confirmation.

---

## Design Tokens
All values are CSS custom properties defined in `colors_and_type.css` (bundled). Use the token names, not raw hexes, in code.

### Colors
| Token | Value | Use here |
|---|---|---|
| `--color-primary-blue` | `#22326e` | All text, headings, avatar, toast bg, selected day |
| `--color-primary-purple` | `#8e7fae` | Required asterisk, notif dot, nav hover |
| `--color-secondary-green` | `#56b093` | Confirmed slot border |
| `--color-surface-tint` | `#f6f7fb` | Field bg, hover bg, tag bg |
| `--color-border` | `#d4d7e3` | Field/segmented/pill borders |
| `--color-border-soft` | `#e6e8f1` | Card + popover borders |
| `--color-muted` | `#8897ad` | Placeholders, meta text |
| `--color-white` | `#ffffff` | Page + card backgrounds |
| (literal) | `#e6e3f0` | Selected segmented-button wash (pale lilac) |
| (literal) | `#f3faf7` | Confirmed slot background |
| (literal) | `#d9d9d9` | Photo placeholder fill |

### Typography
- Family: `--font-sans` = `"Source Sans 3", system-ui, …`. Weights used: 400 (`--fw-regular`), 500 (`--fw-medium`), 600 (`--fw-semibold`), 700 (`--fw-bold`).
- Sizes on this screen: 26px (prof name), 22/20px (nav), 19px (field value), 18px (slot time), 17px (option / pill button), 16px (slot date / segmented / toast / role), 15px (bio), 13px (field label / option meta), 12px (tag), 11px (calendar weekday).

### Radii
- `6px` — filled fields. `8px` (`--radius-sm`) — cards, popovers. `999px` (`--radius-pill`) — segmented control, pills, avatar, notif dot. `10px` — toast.

### Shadows
- `--shadow-floating` = `drop-shadow(0 8px 24px rgba(34,50,110,.18))` — popovers, calendar, toast. CARE uses `filter: drop-shadow()`, never `box-shadow`.

### Motion
- `--ease-care` = `cubic-bezier(0.4,0,0.2,1)`; `--dur-fast` 0.2s; `--dur-base` 0.3s.

---

## Assets
- `assets/logo-horizontal.svg` — CARE horizontal logo (bundled). From the design system `assets/`.
- **Icons:** Material Symbols Outlined via Google CDN in the prototype (`notifications`, `account_circle`, `expand_more`, `calendar_today`, `chevron_left`, `chevron_right`, `check`, `person`). In production use Angular Material `<mat-icon>` (already in the codebase) with the same symbol names.
- **Professional photos:** placeholder grey circle in the prototype — supply real portraits (warm, daylit, unsaturated per brand).

## Files in this bundle
- `Scheduling.html` — desktop entry point; contains all page CSS in a `<style>` block and loads React + the app script.
- `scheduling-app.jsx` — the full desktop prototype: data, header, selects, calendar, professional card, slot card, toast, and the Tweaks panel.
- `Scheduling Mobile.html` — mobile entry point; all mobile CSS in a `<style>` block.
- `mobile-scheduling-app.jsx` — the mobile prototype: hamburger header, bottom-sheet pickers, stacked layout, full-width filled action.
- `ios-frame.jsx` — iPhone device bezel used only to present the mobile screen. **Presentation chrome — do not port.**
- `tweaks-panel.jsx` — the in-prototype controls panel (design-exploration only — **do not port**; it is not part of the product).
- `colors_and_type.css` — the CARE design tokens + base type (source of truth for all values above).
- `fonts/` — Source Sans 3 webfonts referenced by the CSS.

> **Prototype-only artifacts:** the desktop "Tweaks" panel and the `ios-frame.jsx` bezel exist purely for design review. Neither is a product feature — ignore both when implementing.

## Copy reference (PT-BR, exact strings)
- Field labels: `Escolha um serviço *`, `Escolha um profissional *`, `Escolha uma data`.
- Professional-select gated placeholder: `Escolha um serviço primeiro`.
- Modality options: `Presencial`, `Remoto`, `Qualquer`.
- Primary action: `Agendar` → `Confirmado` (after booking).
- Empty professional card: `Selecione um profissional para ver o perfil.`
- No-slots state: `Sem horários disponíveis para esta data.`
- Toast: `Sessão agendada · {Profissional} · {data} · {hora} · {modalidade}.`

Casing follows CARE: sentence case for labels and buttons (no ALL-CAPS here — that's reserved for the marketing accordion CTAs). No emoji.
