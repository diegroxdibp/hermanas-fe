# Handoff: Auth, Onboarding & Account Edit

## Overview

Four screens for the **Care** product (mental-health platform, PT-BR/PT-PT, scheduling app + marketing site):

1. **Sign In** — email/password + Google OAuth
2. **Sign Up** — email/password with live validation rules + terms checkbox + Google OAuth
3. **Onboarding · Perfil** — collect name, birthdate, gender, country/phone after first sign-in
4. **Conta · editar** — authenticated dashboard account-edit view with profile picture, phone, and a destructive "delete account" action

Each screen has **desktop and mobile layouts**.

## About the Design Files

The HTML/JSX files in this bundle are **design references**, not production code to copy verbatim. They are React + Babel prototypes that render in a browser so you can see exact spacing, colors, and behavior.

Your task is to **recreate these designs in the Care codebase** — Angular 20 (`hermanas-fe`, repo: <https://github.com/diegroxdibp/hermanas-fe>) — using its existing patterns:
- Angular components (standalone or NgModule, whichever the rest of the codebase uses)
- Angular Material for inputs / select / date-picker / dialog
- SCSS in `src/assets/styles/` for shared styling
- Existing routes & guards (the codebase already has `AuthService`, `RouterModule`)

The tokens / colors / fonts in this bundle come from the existing `palette.scss` and `typography.scss` in that repo — they should already match.

## Fidelity

**High-fidelity.** All colors, spacing, type weights, radii, shadows, and copy match the existing Care design system. Recreate pixel-perfectly in Angular Material.

## Design Tokens

All tokens are already defined in `hermanas-fe/src/assets/styles/palette.scss` and `_card.css` here. The handoff includes `design-system/colors_and_type.css` which lists every token used.

Key values:

| Token | Value | Where used |
|---|---|---|
| `--color-primary-blue` | `#22326e` | Body text, headings, primary buttons, avatar |
| `--color-primary-purple` | `#8e7fae` | Hover / link accent / "selected" highlights |
| `--color-secondary-cyan` | `#77c5d5` | Footer background |
| `--color-secondary-indigo` | `#42458e` | Footer icon chip background, secondary text |
| `--color-surface-tint` | `#f6f7fb` | Pale wash, active sidebar item, stepper bg |
| `--color-border` | `#d4d7e3` | Input borders |
| `--color-muted` | `#8897ad` | Placeholder text, hints |
| `--color-success` | `#23a25b` | Password rule met |
| Danger color | `#c0392b` | "Apagar conta" — **not** in the base palette; introduced for this feature. Confirm with the team. |
| `--radius-md` | `10px` | Input fields, sidebar items, buttons |
| `--radius-lg` | `12px` | Card/form containers, primary buttons |
| `--radius-xl` | `16px` | Auth card |
| `--shadow-card` | `drop-shadow(0 2px 4px rgba(0,0,0,0.25))` | Auth & form cards |
| `--shadow-floating` | `drop-shadow(0 8px 24px rgba(34, 50, 110, 0.18))` | Dropdown menu, modal |
| Font family | `"Source Sans 3"` | Everything |
| Body | 17px / 1.65 / 400 | Marketing body |
| Form label | 15px / 500 | Field labels |
| Field input | 16px / 400 | All inputs |
| CTA button | 14px / 700, `letter-spacing: 0.08em`, `text-transform: uppercase` | "SAIBA MAIS", "AGENDAR", "Sign In", "Salvar alterações" |

## Screens

### 1. Sign In (`SignInScreen` / `MobileSignInScreen`)

**Desktop · 1320 × 900**

- Marketing-style header (logo left, Home/Sobre/Contato/Agendar nav, no Sign In button since we're already on it)
- Centered auth card on a pale-blue gradient background
- Card: 420 × auto, padding 36px, border-radius 16, white background, `--shadow-card`
- Card content (top to bottom):
  1. H1 "Bem-vindo de volta" — 28/700/navy
  2. P "Acesse sua conta para gerir os seus agendamentos." — 15/400/navy
  3. **Field: Email** — label "Email:", text input
  4. **Field: Password** — label "Password:", password input
  5. Italic link "Esqueci minha senha" right-aligned, 13/500/italic/lilac
  6. Primary button "Sign In" — full-width, navy fill, uppercase 14/700
  7. Divider with centered text "Or sign in with"
  8. Google button — pale cyan fill `#f3f9fa`, Google "G" SVG, sentence-case text
  9. Footer link "Don't you have an account? **Sign up**" — Sign up is lilac/bold
- Marketing footer (cyan band) at bottom

**Mobile · 390 × 780**

- Mobile header: logo + hamburger
- Card padding 22px; type sizes drop by ~2px
- Same content/order

### 2. Sign Up (`SignUpScreen` / `MobileSignUpScreen`)

**Desktop · 1320 × 900**

Same header/footer/layout shell as Sign In. Card is **460 wide**. Content:

1. H1 "Crie sua conta"
2. P "Um espaço para acolher quem cuida e quem precisa de cuidado."
3. **Field: Email**
4. **Field: Password** + live validation list:
   - Mínimo de 8 caracteres
   - Pelo menos 1 letra maiúscula
   - Pelo menos 1 número
   - Each rule has a 14px circle that fills green with a white check when the rule is met (CSS-only, no animation needed)
   - Pending state: navy at 45% opacity (`rgba(34, 50, 110, 0.45)`)
   - Met state: `--color-success` (`#23a25b`)
5. **Field: Confirme a password**
6. Terms checkbox — `accent-color: --color-primary-blue`, copy reads "Concordo com os **termos de uso** e a **política de privacidade**." (bold parts are lilac links)
7. Primary button "Sign Up"
8. Divider "Or sign up with"
9. Google button "Sign up with Google"
10. Footer "Já tem uma conta? **Sign in**"

**Mobile · 390 × 980** — same content, narrower card with 22px padding.

### 3. Onboarding · Perfil (`OnboardingScreen` / `MobileOnboardingScreen`)

Shown **immediately after first sign-up** before the user can access the dashboard. Authed header (avatar with "?" initial since the name isn't entered yet, role "Paciente").

**Desktop · 1320 × 900**

- Form card 580 wide centered
- H2 "Complete o seu perfil"
- Subhead "Estes dados ajudam o seu profissional a preparar a sessão."
- Fields:
  1. **Nome** (full width)
  2. **Data de nascimento** + **Gênero** (2-column grid) — date picker shows calendar icon at right; gender is a native select with chevron icon
  3. **País** + **Telefone** (2-column flex) — country select with flag + name + code; phone input has the dial code prefixed inside with a 1px right divider
- Buttons row: "Voltar" (outlined) + "Continuar" (primary, navy fill), both equal width

**Country picker** (`CountrySelect`):
- Closed: flag emoji + country name + "(+code)" + chevron, ellipsis if name overflows
- Open: dropdown with `--shadow-floating`, max-height 260, scroll, each row shows flag + name + code; selected row has lilac text on `--color-surface-tint` background with a checkmark on the right
- Floating label "País" lifts above the border when open (Material-style)

**Mobile · 390 × 900** — all fields stack vertically; same component logic.

### 4. Conta · Editar (`AccountEditScreen` / `MobileAccountEditScreen`)

The authenticated dashboard view. **This is the design the user originally circled in red.**

**Desktop · 1320 × 1320**

Layout:
- Authed header: logo + Home/Sobre/Contato/Agendar nav + bell icon + avatar pill (MX initials, "Mestre / Paciente", chevron). Right side acts as a user menu trigger.
- Body splits into:
  - **Sidebar (240 wide)** — "CONTA" eyebrow + 3 nav items: Agendamentos, Notificações, Conta (active). Active item has `--color-surface-tint` bg, 10px radius, bold weight.
  - **Main pane** with content max-width 760:
    1. H1 "A sua conta" + muted subhead
    2. **Profile picture row**:
       - 112×112 circular placeholder (silhouette SVG) with hover overlay (navy 55% opacity + camera icon + "ALTERAR" label)
       - Right side: primary "Alterar foto" button with upload icon + outlined "Remover" + hint "JPG ou PNG, até 5 MB."
       - **TODO:** wire to Cloudinary upload widget (user mentioned this is coming next)
    3. **Field grid** (2 columns):
       - Nome (full width)
       - Email (full width)
       - Data de nascimento (left col, date input with calendar icon)
       - Gênero (right col, select with chevron — options: Feminino, Masculino, Não-binário, Prefiro não responder, Outro)
       - Telefone (full width) — uses the same country-code + phone composite as onboarding
    4. **Save bar** at the bottom of the field grid, top-bordered:
       - Outlined "Cancelar"
       - Primary "Salvar alterações"
    5. **Zona de risco** section, top-bordered, 56px gap above:
       - Red eyebrow "ZONA DE RISCO" (12/700 letter-spaced)
       - Bold "Apagar a sua conta" + muted explanation
       - Right-aligned red outlined "Apagar conta" button
- Cyan footer

**Delete confirmation dialog** (`ConfirmDeleteDialog`):
- Modal overlay (navy 32% opacity)
- 440-wide white card, 32px padding, 16px radius
- H3 "Apagar a sua conta?"
- P explaining the consequence
- Input "Digite APAGAR para confirmar" — submit only enabled when input matches (currently visual only — wire the check)
- Cancel (ghost) + "Apagar conta" (red fill) buttons

**Mobile · 390 × 1480**

- Mobile header: logo + bell + avatar + hamburger
- Sidebar collapses into a horizontal pill tab strip (Agendamentos / Notificações / Conta) that scrolls horizontally
- Profile picture: 96px circle, centered with the buttons row underneath
- All form fields stack single-column
- Save bar: stacked buttons (primary first, then ghost cancel)
- Danger zone same layout, "Apagar conta" button is full-width

## Interactions & Behavior

| Interaction | Expected behavior |
|---|---|
| Sign In submit | POST to `/auth/login`; on success → `/dashboard/agendamentos`; on failure show toast with the existing `care-toast` style |
| Google buttons | Trigger Google OAuth (codebase already has `Sign in with Google` strings — backend integration TBD) |
| Sign Up submit | POST to `/auth/register`; on success → Onboarding |
| Onboarding submit | PATCH `/users/me`; on success → dashboard root. "Voltar" goes to nothing meaningful — could be removed if there's no previous step in your flow |
| Country select | Static client-side list. The CountrySelect in the prototype contains 10 countries — replace with a full ISO list (use `i18n-iso-countries` + dial codes) |
| Date inputs | Use Angular Material `MatDatepicker` (Care already has the package) |
| Profile picture click | Open file picker → upload to Cloudinary → PATCH `/users/me/avatar` with the resulting URL |
| "Alterar foto" button | Same as clicking the circle |
| "Remover" | Confirm + clear `avatarUrl` on the user |
| Telefone field | Strip non-digit characters before submit; preserve formatting in the display |
| Save alterações | PATCH `/users/me`; show success toast; if no changes pending, disable button |
| Apagar conta | Open `ConfirmDeleteDialog`; enable destructive button only after the user types `APAGAR`; on confirm → DELETE `/users/me`, sign out, redirect to `/` |
| Cancelar (account edit) | Reset form to last-saved values; do not navigate away |

## State Management

For each form, useState (or Angular form control) per field. The auth screens have purely local state. The onboarding and account-edit forms should hydrate from the current user (`AuthService.currentUser$`).

Validation:
- Email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: ≥8 chars, ≥1 uppercase, ≥1 digit
- Password confirmation: must equal password
- Phone: digits-only after stripping spaces/parens; min 6 digits
- All onboarding fields required to advance

## Animations & Transitions

The Care design system specifies:
- Hover transitions: 0.2s–0.3s `ease`
- Page entry: 1.4s `ease` `fade-in-up` (already in the codebase)
- No bounces, no springs, no parallax
- Country dropdown chevron rotates 180° on open (`transition: transform .2s ease`)
- Hover on profile picture: opacity transition on the overlay, 0.2s

## Assets

All assets are in `design-system/assets/`:
- `logo-horizontal.svg` — already exists in the codebase (`hermanas-fe/src/assets/images/logo-horizontal.svg`)
- `hands2.svg`, `hands5.svg` — also already in the codebase; not used by these screens but included in case the dev wants to dress up an empty state

Icons are inline SVGs (bell, calendar, hamburger, chevron, camera, pencil, upload, check) — feel free to swap for Angular Material `mat-icon` equivalents:

| Inline SVG | Material icon |
|---|---|
| Bell | `notifications` |
| Calendar | `calendar_today` |
| Hamburger | `menu` |
| Chevron-down | `expand_more` |
| Camera | `photo_camera` |
| Upload | `file_upload` |
| Check | `check` |

## Files in this bundle

```
design_handoff_auth_account/
├── README.md                       — you are here
├── index.html                      — opens the design canvas with all screens side-by-side
├── design-canvas.jsx               — pan/zoom canvas (developer reference only)
├── chrome.jsx                      — desktop Header, Footer, Sidebar, Field, input styles
├── auth.jsx                        — SignIn / SignUp / Onboarding desktop screens
├── account.jsx                     — Account edit desktop screen + delete dialog
├── mobile.jsx                      — All mobile screens
└── design-system/
    ├── colors_and_type.css         — every CSS token used
    ├── fonts/                      — Source Sans 3 + Source Serif 4 ttfs
    └── assets/
        └── logo-horizontal.svg
```

## Open questions for the founder

1. **Danger red** — `#c0392b` is a one-off introduction for "Apagar conta". Should this be added to `palette.scss` as `--color-danger`, or stay scoped?
2. **Language consistency** — Sign In / Sign Up / Sign in with Google strings stay in English (matching the rest of the codebase). Confirm before launching publicly.
3. **Cancelar button copy** — currently "Cancelar" / "Salvar alterações" in Portuguese while CTAs elsewhere use English. Match either way.
4. **Delete account flow** — does the user get an email confirmation? A 14-day grace period? Or is it immediate as designed?
5. **Profile picture** — should the avatar fall back to initials (like the header avatar) when no image is set, instead of the silhouette glyph?
