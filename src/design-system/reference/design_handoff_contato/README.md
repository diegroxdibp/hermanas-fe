# Handoff: Contato (Contact) Page — CARE

## Overview
A contact page for the CARE (Clínica Ampliada Ressignificações) platform, presented inside the authenticated app shell (logged-in patient view). The screen lets a signed-in user send a free-form message to the clinic via a four-field form. It consists of three regions stacked vertically: a sticky **app header**, a centered **contact form card** on a pale section background, and a **cyan footer**.

## About the Design Files
The files in `reference/` are a **design reference created in HTML/React (Babel-in-browser JSX)** — a prototype that demonstrates the intended look and behavior. They are **not** production code to ship directly. The task is to **recreate this design in the target codebase's environment** using its established patterns and libraries.

The production app this belongs to is an **Angular 20** app (`care-fe`, repo: https://github.com/diegroxdibp/hermanas-fe). If you are implementing there, build it as Angular components using Angular Material (`<mat-icon>`, `<mat-form-field>` if desired) and the existing SCSS token partials. If you are implementing in another framework, mirror the structure and tokens below using that framework's conventions.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, and interactions are final. Recreate the UI to match, using the codebase's existing component library where equivalents exist (e.g. swap the hand-rolled inputs for the app's standard text-field component, but keep the visual spec below).

---

## Design Tokens
All tokens live in `reference/colors_and_type.css` (mirrors the production `palette.scss` / `typography.scss`). The ones used on this page:

### Colors
| Token | Hex | Usage on this page |
|---|---|---|
| `--color-primary-blue` | `#22326e` | All text, headings, nav, avatar, focus border |
| `--color-primary-purple` | `#8e7fae` | Active nav underline, link/hover accent, footer chip hover |
| `--color-secondary-indigo` | `#42458e` | Footer copy text, footer icon-chip background |
| `--color-secondary-cyan` | `#77c5d5` | Footer background band |
| `--color-secondary-green` | `#56b093` | "Sent" success button state |
| `--color-secondary-pink` | `#ccaed0` | Notification dot, error field border |
| `--color-white` | `#ffffff` | Page bg, card bg, input bg, header bg |
| `--color-surface-tint` | `#f6f7fb` | Section background (current default), header bottom border |
| `--color-border` | `#d4d7e3` | Input borders, card divider |
| `--color-border-soft` | `#e6e8f1` | Dropdown menu border + divider |
| `--color-muted` | `#8897ad` | Placeholder text, user role label |

### Typography
- Family: **Source Sans 3** (`--font-sans`), fallbacks `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Weights used: `400` regular, `600` semibold (field labels), `700` bold (headings, nav, buttons).
- Italic 400 used for the fineprint lines.

### Radii
- `--radius-sm` `8px` — input fields
- `--radius-lg` `12px` — dropdown menu
- `--radius-xl` `16px` — form card
- `--radius-pill` `999px` — bell button, user chip, ENVIAR button

### Elevation (CARE uses CSS `filter: drop-shadow`, never `box-shadow`, except input focus ring)
- Card: `drop-shadow(0 10px 28px rgba(33, 51, 110, 0.20))`
- Dropdown menu: `--shadow-floating` = `drop-shadow(0 8px 24px rgba(34, 50, 110, 0.18))`
- ENVIAR button: `drop-shadow(0 2px 5px rgba(33, 51, 110, 0.14))`
- Input focus ring (the one box-shadow): `0 0 0 3px rgba(34, 50, 110, 0.12)`

### Motion
- `--dur-fast` `0.2s` — hover/focus transitions
- `--dur-base` `0.3s` — chevron rotate, chip color swap
- `--ease-care` `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Screens / Views

### Screen: Contato (single screen)
**Purpose:** A logged-in user sends a message to the clinic.

**Page layout:** `display: flex; flex-direction: column; min-height: 100vh`. Three children: header, `<main class="section">` (flex: 1), footer.

#### 1. App Header (sticky)
- `position: sticky; top: 0; z-index: 100`. Height **92px**, padding `0 40px`, white bg, `1px` bottom border in `--color-surface-tint`.
- Horizontal flex, `align-items: center`, `gap: 24px`.
- **Left — brand:** `logo-horizontal.svg` at `height: 56px` (auto width). This is the canonical navy/lilac CARE logo (bird-and-wave mark + "Care" wordmark). File in `reference/assets/logo-horizontal.svg`.
- **Center/right — nav** (`margin-left: auto`, flex, `gap: 40px`): links **Home, Sobre, Contato, Agendar**. Each: `21px`, weight `700`, color `--color-primary-blue`. Hover: color → `--color-primary-purple`, `transform: scale(1.05)`. Active link (**Contato**) keeps blue and shows a `3px` rounded underline bar in `--color-primary-purple`, `6px` below text.
- **Header tools** (flex, `gap: 20px`, `position: relative`):
  - **Notification bell:** `44×44` pill button, transparent bg → `--color-surface-tint` on hover. Bell icon (inline SVG, stroke `1.8`, `26px`) in primary blue. Pink dot badge: `9×9`, top-right, `--color-secondary-pink`, `2px` white border.
  - **User chip:** pill button, hover bg `--color-surface-tint`. Contains: a `48×48` circular **avatar** (primary-blue bg, white initials "DP", `17px`/700); a two-line meta block — name **"Diego"** (`17px`/700 blue) over role **"Paciente"** (`15px`/400 muted); a chevron icon (blue) that rotates `180°` when the menu is open.
  - **User dropdown menu** (toggled by chip): absolutely positioned `top: calc(100% + 10px); right: 0`, `min-width: 232px`, white, `1px` `--color-border-soft` border, `--radius-lg`, `8px` padding, `--shadow-floating`. Items (each flex, `gap: 12px`, `11px 12px` padding, `--radius-sm`, hover bg `--color-surface-tint`, `16px`/500 blue text, `20px` indigo icon): **Meu perfil** (person), **Meus agendamentos** (calendar), **Definições** (settings); a `1px` divider; **Terminar sessão** (logout) rendered in `--color-secondary-pink` (icon + text).

#### 2. Section + Form Card
- `<main class="section">`: `flex: 1`, full width, background driven by `--section-bg` (default `#f6f7fb`, tweakable). Padding `48px 24px 64px`, centers the card horizontally (`justify-content: center`), card aligned to top.
- **Card** (`<form class="contact-card">`): `width: 100%; max-width: 800px`, white bg, `--radius-xl`, card drop-shadow, padding `36px 40px 40px`.
  - **Card head:** title **"Contato"** — `30px`/700, primary blue, `0 0 4px` margin. Subtitle **"Tire suas dúvidas, envie-nos uma mensagem:"** — `18px`/400, primary blue.
  - **Divider:** `1px` line in `--color-border`, with `18px` space above and `28px` below (body padding-top).
  - **Card body:** `display: flex; flex-direction: column; gap: 18px`.

  **Fields** — four **outlined, label-above** fields (this is the requested input style; see spec below). In order:
  | id | Label | Type | Placeholder |
  |---|---|---|---|
  | `nome` | `Nome:` | text | `O seu nome` |
  | `telefone` | `Telefone:` | tel | `+351 915 784 896` |
  | `assunto` | `Assunto:` | text | `Sobre o que gostaria de falar?` |
  | `mensagem` | `Mensagem:` | textarea | `Escreva a sua mensagem` |

  **Field spec (`.field` / `.field-label` / `.field-input`):**
  - Wrapper: `display: flex; flex-direction: column; gap: 8px`.
  - Label: `15px`, weight `600` (`--fw-semibold`), color `--color-primary-blue`, `line-height: 1.2`. Includes the trailing colon (`Nome:`).
  - Input: full width, `1px solid --color-border`, `--radius-sm` (8px), white bg, `16px` text in primary blue, padding `13px 16px`. Placeholder color `--color-muted`.
  - Textarea (`mensagem`): `resize: vertical; min-height: 110px; line-height: 1.5`, `rows=4`.
  - Hover: border `#b7bcce`.
  - Focus: border `--color-primary-blue` + box-shadow `0 0 0 3px rgba(34,50,110,0.12)` (no glow blur beyond this ring). Transition `--dur-fast`.
  - Error state (`.field.is-error`): border `--color-secondary-pink`; focus ring `0 0 0 3px rgba(204,174,208,0.4)`.

  **ENVIAR button** (submit): `margin-top: 8px`, full width, padding `17px`, `1px solid --color-border`, `--radius-pill`, white bg, primary-blue text, `16px`/700, `letter-spacing: 0.1em`, `text-transform: uppercase`, button drop-shadow. Flex centered with `gap: 10px`.
  - Hover: `transform: scale(1.01)`, bg → `--color-primary-blue`, text → white, border → blue.
  - Active: `transform: scale(0.99)`.
  - Sent state (`.is-sent`): bg + border `--color-secondary-green`, white text, shows a check icon + label **"Mensagem enviada"**.

  **Fineprint** (`margin-top: 18px`, flex column, `gap: 6px`): two lines, each `17px`, **italic**, weight 400, primary blue, left-aligned, `line-height: 1.45`:
  1. "Ao enviar o email, aceito os termos de uso e política de privacidade."
  2. "Se quer agendar algum serviço, clique **aqui**." — where **aqui** is a bold italic link (primary blue, hover → `--fg-accent`).

#### 3. Footer
- Background `--color-secondary-cyan`, padding `22px 40px`, flex `space-between`, `align-items: center`, wraps on small screens.
- **Left copy** (color `--color-secondary-indigo`): line 1 **"Todos os direitos reservados ©"** (`16px`/700); line 2 **"Care · +351 915 784 896"** (`15px`/400, `2px` top margin).
- **Right socials:** three `42×42` chips, `--radius-sm`, `--color-secondary-indigo` bg, inline SVG glyph (`20px`, white): Instagram, WhatsApp, Email. Hover: bg → `--color-primary-purple`, glyph `scale(1.1)`. Active: chip `scale(0.95)`.

---

## Interactions & Behavior
- **User menu:** clicking the user chip toggles the dropdown (`menuOpen` state); chevron rotates 180° while open. (In production, also close on outside-click / Esc — not implemented in the prototype.)
- **Form validation:** on submit, each of the four fields is required (non-empty after `trim()`). Empty fields get `is-error` styling (pink border). No inline error messages in the prototype — add per the codebase's form conventions if needed.
- **Submit success:** when all valid, set `sent = true` → button switches to green "Mensagem enviada" with check icon, form fields reset, and after **3200ms** the button reverts to default. (Wire this to the real send-message API in production; the prototype does no network call.)
- **No page navigation** — nav links and footer links are placeholders (`href="#"`).
- **Transitions:** field border/ring `0.2s`; chevron `0.3s`; chip color `0.3s`; button `0.2s`. Easing per tokens.

## State Management
- `form`: `{ nome, telefone, assunto, mensagem }` — controlled inputs.
- `errors`: `{ [field]: boolean }` — set on failed submit, cleared per-field on change.
- `sent`: boolean — drives the success button state; auto-resets after 3.2s.
- `menuOpen`: boolean — header user dropdown.
- In production, replace the local `sent`/timeout with the real submission lifecycle (loading / success / error).

## Responsive Behavior
- `@media (max-width: 720px)`: header collapses to `70px` / `16px` padding, logo to `40px`; nav links and the user-meta text hide (avatar + chevron remain); section padding `24px 16px 40px`; card padding `24px 20px 28px`.

## Assets
- `reference/assets/logo-horizontal.svg` — the canonical CARE horizontal logo (navy/lilac bird-and-wave + wordmark). Use the brand's real asset; do not redraw.
- **Icons:** the prototype uses inline SVG icons (bell, chevron, person, calendar, settings, logout, check) for robustness — see the `Icon` component in `reference/contact.jsx`. In the Angular app these map to Angular Material symbols (`notifications`, `expand_more`, `account_circle`, `event`, `settings`, `logout`, `check`). Footer social glyphs are inline brand SVG paths (Instagram, WhatsApp, Email).
- Fonts: Source Sans 3 (ttf set referenced by `colors_and_type.css`).

## Files
In `reference/`:
- `Contato.html` — the full page (styles in a `<style>` block; mounts the React app). Open this to see the rendered design and read all CSS.
- `contact.jsx` — React components: `AppHeader`, `FilledField` (the outlined field), `ContactCard`, `AppFooter`, `Icon`.
- `colors_and_type.css` — design tokens + base type (source of truth for all values above).
- `tweaks-panel.jsx` — prototype-only tweak panel (section background color). **Not part of the production design** — ignore when implementing.
- `assets/logo-horizontal.svg` — logo.

### Notes / omissions to resolve in production
- Outside-click / Esc to close the user menu is not wired in the prototype.
- The send action is mocked (no API). Hook the ENVIAR button to the real endpoint with proper loading/error handling.
- Copy is PT-BR/PT-PT; keep the clinical-warm CARE voice. No emoji.
