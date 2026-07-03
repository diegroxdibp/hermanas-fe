# Handoff: Therapist Session Availability (CARE)

## Overview
This feature lets a **therapist (profissional)** open the blocks of time they are available, inside the **scheduling area** of the CARE app. Each availability **block** is automatically split into bookable **sessions (slots)** that patients then see and book on the existing patient scheduling screen.

There are two surfaces:
1. **Desktop** — a weekly calendar (paint/select blocks) with a persistent right-hand **block editor**.
2. **Mobile** — a Microsoft-Teams-style calendar with a floating **+** button that opens the create form as a **bottom sheet**.

The data a block produces is exactly what the **patient** scheduling flow already consumes (serviço → profissional → data → slot → modalidade), so this feature is the therapist-side producer of that same data.

---

## About the Design Files
The files in `design-files/` are **design references created in HTML/React+Babel** — runnable prototypes that show the intended **look and behavior**. They are **not** production code to copy directly.

Your task is to **recreate these designs in the CARE codebase** (`hermanas-fe`, an **Angular 17+ standalone-components** app using **Angular Material**, SCSS, and signals) using its established patterns — not to ship the prototype's React/Babel code. Where the prototype uses inline React state, map it to Angular signals/reactive forms. Where it hand-rolls a control that Angular Material already provides, prefer the Material component **styled to match** the mock.

If you are implementing in a different stack, treat the prototypes as the visual + behavioral source of truth and use that stack's idiomatic patterns.

---

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and interactions are final and brand-correct (they use the CARE design tokens in `design-files/colors_and_type.css`). Recreate the UI pixel-closely using the codebase's components. Copy is in **Portuguese (pt-PT)** and is intended as the real copy.

---

## Existing codebase context (important)
These already exist in `hermanas-fe` — reuse, do not reinvent:

- **`SchedulingComponent`** (`src/app/core/pages/scheduling/`) — the patient booking screen. It already implements a **custom month calendar** (signals: `calendarViewDate`, `calendarDays()`, `monthLabel()`, `prevMonth/nextMonth`, `toKey`), a **filled-field** dropdown style, **slot cards**, and a **modality segmented control**. The therapist availability UI should share this visual language and ideally these helpers.
- **`AvailabilitiesComponent`** (`src/app/shared/components/availabilities/`) — currently renders availabilities as a patient-facing accordion with a `mat-button-toggle-group` for modality. The model it binds is the one to extend.
- **Enums**: `Modality` (`ANY`/`LOCAL`/`REMOTE`), `ProfessionalServiceModality`, `ProfessionalSessionService`, `DayOfWeek`.
- **Models**: `AvailabilityModel` (has `startTime`, `endTime`, `services[]` with `modality`, `professionalName`, `dayOfWeek`, `isRecurring`, `startDate`).
- **`ApiService`** — `getServices()`, `getProfessionalByService()`, `getAvailabilitiesByProfessionalId()`, `setAppointment()`. You will need new endpoints (see API section).
- **Date utils**: `date-helper.util.ts` (`formatTime`, `parseDate`). Consider `date-fns` for week math if not already present.

---

## Screens / Views

### 1. Desktop — Weekly calendar + block editor
**File:** `design-files/availability-week.jsx` + `availability-week.css` (+ shared controls in `availability-styles.css`)
**Component in mock:** `AvailabilityWeek`
**Artboard size:** 1380×920 (content is fluid; the calendar is `1fr`, the editor is a fixed `380px`).

**Purpose:** Therapist sees their week at a glance and creates/edits availability blocks.

**Layout:**
- Panel header (`.panel-head`): kicker (uppercase, lilac, italic) + serif italic H1 + muted subtitle.
- Body is a CSS grid `.merge-layout`: `grid-template-columns: 1fr 380px; gap: 28px; align-items: start;`
  - **Left:** toolbar + calendar + hint.
  - **Right:** sticky block editor (`position: sticky; top: 0`).

**Calendar (the part to get exactly right — alignment was a real bug):**
- Container `.cal` (white, 1px `--color-border-soft`, radius `--radius-lg`, `overflow:hidden`).
- **Header row** `.cal-head`: `grid-template-columns: 64px repeat(7, 1fr)`. First cell is an empty `.corner`; then 7 `.dh` day-heads (uppercase weekday `--color-muted`; serif day number `--color-primary-blue`; `.today` → number turns lilac).
- **Body** `.cal-body`: **same** `grid-template-columns: 64px repeat(7, 1fr)`.
  - Column 1 = `.cal-gutter`, a stack of 13 `.tcell` hour labels (08:00–20:00). Each `.tcell` is `height: 52px; border-top: 1px solid --color-border-soft;` (first has no border-top). Label sits at the **top** of its own cell — **no transform**.
  - Columns 2–8 = `.daycol` (each `position: relative; border-left: 1px`). Inside each: 12–13 `.hcell` background cells (`height: 52px; border-top: 1px`) **plus** absolutely-positioned `.block`s.
- **Why this matters:** the gutter cells and the day cells share the **identical 52px row track + top-border**, so the hour lines line up perfectly across all 8 columns. Do **not** position hour labels with a negative `transform` (that was the original misalignment). `ROW_H = 52`.

**Block** (`.block`, absolutely placed inside its `.daycol`):
- `top = startHourIndex * 52 + 3`, `height = spanHours * 52 - 6`, `left/right: 4px`, `z-index: 2`.
- Background encodes **modality**: default/Presencial = `--color-primary-purple`; `.remoto` = `--color-secondary-green`; `.any` = `--color-secondary-cyan` (text becomes `--color-primary-blue`).
- Content: `.b-top` row = `.b-time` (start–end, bold, tabular) + `.b-badge`; then `.b-svc` (service, ellipsis); then `.b-slots` ("N sessões").
- **Recurrence marker** (requested feature): 
  - **Semanal (recurring):** `.b-badge` shows a low-key `event_repeat` glyph (opacity .85).
  - **Data única (single date):** `.block.unica .b-badge` is a **white circular chip (19px)** containing a **filled** `push_pin` (`font-variation-settings:'FILL' 1`) colored `--color-primary-blue`. This pops on every modality color. (An earlier dashed-border treatment was removed — don't use it.)
- Clicking a block selects it (`.selected` → `box-shadow: 0 0 0 2px #fff, 0 0 0 4px --color-primary-blue`) and loads it into the editor.

**Toolbar** `.cal-toolbar`: left = week nav (`Hoje` button + chevrons + serif italic week label "12 – 18 Maio · 2026"); right = `.legend` with modality swatches **and** the two recurrence markers (repeat glyph = Semanal; pin badge = Data única).

**Hint** `.cal-hint`: italic muted line — "Arraste verticalmente numa coluna para definir o intervalo de horas de um novo bloco."

### 2. Desktop — Block editor (right column)
**Component in mock:** the `<aside class="block-editor">` inside `AvailabilityWeek`.
This is the "Quando" panel from earlier design A, **plus** the previously-missing **Serviço** and **Modalidade** fields.

- `.be-head`: serif italic title ("Bloco de quarta"), muted subtitle (the date), and a `.be-chip` badge showing recurrence ("Semanal" with repeat icon / "Única" with pin).
- `.be-body` sections (each `.be-section`):
  1. **Serviço** `*` — multi-select `.chips` (a block may serve more than one service; the model's `services[]` is an array). Selected chip = filled `--color-primary-blue`, with a `check` glyph that animates in (width/opacity).
  2. **Modalidade** `*` — **full-width** segmented `.seg` (Presencial / Remoto / Qualquer). Full width fixes the earlier "pills wider than the track" look — the `.seg` background must contain the buttons (each button `flex: 1`). When not Remoto, show a **Local** filled-field below (consultório address).
  3. **Frequência** — segmented (Data única / Semanal). 
     - Semanal → show **Dias da semana** as 7 round `.weekday` chips (S T Q Q S S D). 
     - Data única → show a **Data** filled-field instead.
  4. **Intervalo de horas** — `.time-row` with two `.time-field`s (Início / Fim) + a **Duração de cada sessão** segmented (50 / 60 / 90 min). Then a **live preview**: `.hint` ("Gera 4 sessões agendáveis:") + `.slots-preview` pills. The preview is computed: `slotsCount = floor((end - start) / sessionDuration)`, one pill per generated start time.
- `.be-actions` (footer, sticky-ish, tinted): primary **Guardar bloco** (`.btn-add`) + secondary **Remover bloco** (`.btn-remove`, lilac text/outline).

### 3. Mobile — Calendar + FAB (Teams-style)
**File:** `design-files/availability-mobile.jsx` + `availability-mobile.css`
**Component in mock:** `MobileCalendar` (inner content `MobCalendarInner` + `MobNav`)
**Artboard size:** 390×844.

- `.m-top`: serif italic month ("Maio") with muted subline; right = a week-view icon button + avatar.
- `.m-strip`: 7-column week selector. Each `.m-day` = weekday letter + day number; selected day (`.sel`) → number in a filled `--color-primary-blue` circle; a lilac `.dot` under days that have availability.
- `.m-agenda`: scrollable day timeline. `.m-daylabel` (selected day, italic uppercase). `.m-tl` has left padding 60px for the hour gutter; `.m-hour` rows are **46px** with `border-top` (same alignment principle, `M_ROW = 46`); each `.m-hour .lbl` is the hour. `.m-block`s are absolutely placed (`top = start*46+3`, `height = span*46-6`), same modality colors + same recurrence badge rules as desktop, with a compact meta row (location, slots).
- **FAB** `.m-fab`: 58×58, radius 19, `--color-primary-blue`, `+` icon, fixed bottom-right above the nav, big shadow.
- `.m-nav`: 4-tab bottom nav (Início / Agenda [active] / Mensagens / Conta).

### 4. Mobile — Create bottom sheet
**Component in mock:** `MobileCreate` (renders `MobCalendarInner` dimmed, then scrim + sheet)

- Tapping the FAB opens `.m-scrim` (translucent navy `rgba(34,50,110,0.40)`) + `.m-sheet`.
- `.m-sheet`: bottom-anchored, `border-radius: 24px 24px 0 0`, `max-height: 90%`, big top shadow, with a drag `.handle`.
  - `.sh-head`: serif italic "Nova disponibilidade" + round close button.
  - `.sh-body` (scrolls): the **same fields as the desktop editor** — Serviço chips, Modalidade segmented, Frequência (+ weekday chips or date), horas, duração, slot preview. Reuse one form component across desktop editor and mobile sheet (single source of truth).
  - `.sh-foot` (pinned, tinted): full-width **Guardar disponibilidade**.
- **Animation:** sheet slides up from `translateY(100%)` → `0`; scrim fades `opacity 0 → 1`. Suggest `--dur-base (0.3s)` with `--ease-care` (`cubic-bezier(0.4,0,0.2,1)`). Dismiss on scrim tap, close button, or downward drag past a threshold.

---

## Interactions & Behavior

**Block lifecycle**
- **Create (desktop):** click-drag vertically down a `.daycol` → preview a block from the drag start hour to the release hour, then open the editor pre-filled with that day + time range. (The mock shows the end state; implement drag with pointer events: on `pointerdown` in a daycol record start row, on `pointermove` compute hovered row and draw a ghost block, on `pointerup` open the editor.) Snap to the hour (or 30-min if you add half-rows).
- **Create (mobile):** FAB → bottom sheet (no drag-to-create needed on mobile).
- **Edit:** click an existing block (desktop) → loads into the editor; fields reflect the block; `Guardar` persists; `Remover` deletes.
- **Select state:** only one block selected at a time (`selectedId`).

**Slot generation (core rule)**
- A block of `[start, end]` with `sessionDuration` produces `floor((end−start)/duration)` sessions, each `duration` long, back-to-back from `start`. Show them live in the editor (`.slots-preview`). These generated sessions are what patients book.
- If a generated session is already booked, mark it (the mock shows a "1 já agendada" / booked tag) and prevent deleting/shortening the block under a booked session (warn instead).

**Modality**
- `Presencial` (LOCAL) → require/show **Local**. `Remoto` (REMOTE) → hide Local, sessions are video. `Qualquer` (ANY) → patient chooses per booking (this mirrors the patient screen's per-slot modality toggle).

**Frequency / recurrence**
- `Semanal` → `isRecurring = true`, applies to each selected weekday indefinitely (until paused/deleted). Multiple weekdays in one rule = create one block per weekday (or one recurring rule with a weekday set — match your backend).
- `Data única` → `isRecurring = false`, a single `startDate`.
- Surfacing: recurring = repeat glyph; single = pin badge. Keep this consistent on desktop blocks, mobile blocks, and the editor's `.be-chip`.

**Validation**
- Serviço: ≥1 required. Modalidade: required. End > Start. Duration ≤ (end−start). Semanal: ≥1 weekday. Data única: a date required and not in the past. Prevent overlapping blocks on the same day/weekday (warn).

**Responsive**
- ≥ ~960px: two-pane (calendar + sticky editor).
- < ~960px: switch to the mobile calendar + FAB + bottom-sheet pattern (don't try to shoehorn the side editor).

---

## State Management
Map the prototype's React state to Angular signals / a reactive form:
- `selectedWeek` (or `calendarViewDate`) — drives the 7 visible days; reuse `SchedulingComponent`'s month helpers / `date-fns`.
- `blocks` — fetched availability blocks for the professional + visible range.
- `selectedBlockId` — currently-edited block (null = creating new).
- **Editor form** (reactive form / signals): `services: string[]`, `modality: Modality`, `frequency: 'once'|'weekly'`, `weekdays: DayOfWeek[]`, `date?: string`, `startTime`, `endTime`, `sessionDuration`, `local?`.
- Derived: `generatedSlots` (computed from start/end/duration), `isValid`.
- Mobile: `sheetOpen: boolean`.

---

## Design Tokens
All defined in `design-files/colors_and_type.css` (`:root`). Key ones used here:

**Colors**
- `--color-primary-blue: #22326e` (primary text, day numbers, primary buttons, selected ring)
- `--color-primary-purple: #8e7fae` (accents, kickers, lilac primary buttons, pin color)
- `--color-secondary-indigo: #42458e` (secondary text, section labels)
- `--color-secondary-green: #56b093` (Remoto modality, "pago/a receber" success)
- `--color-secondary-cyan: #77c5d5` (Qualquer modality, avatars)
- `--color-secondary-pink: #ccaed0` (illustrative accents)
- `--color-surface-tint: #f6f7fb` (field backgrounds, segmented track, tinted footers)
- `--color-border: #d4d7e3`, `--color-border-soft: #e6e8f1`
- `--color-muted: #8897ad` (placeholder / tertiary text)

**Type**
- Sans: **Source Sans 3** (`--font-sans`); Serif: **Source Serif 4** (`--font-serif`, used italic for titles/dates).
- Scale used: H1 ~34px serif italic; section labels 12–13px / 700 / `letter-spacing: 2–2.5px` / uppercase / italic; body 14–16px; block text 11–13px; tabular numerals for all times.

**Radius:** `--radius-sm: 8px`, `--radius-md: 10px`, `--radius-lg: 12px`, `--radius-xl: 16px`, `--radius-pill: 999px`.
**Shadow (CARE uses drop-shadows):** `--shadow-card`, `--shadow-floating` (filter-based; see file).
**Motion:** `--ease-care: cubic-bezier(0.4,0,0.2,1)`; `--dur-fast .2s`, `--dur-base .3s`.

**Calendar metrics:** desktop row height **52px**, gutter width **64px**; mobile row height **46px**, gutter **60px**.

---

## Assets / Icons
- **Icons:** Google **Material Symbols Outlined** (the codebase already uses Material Symbols). Load via `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:...` — **not** the legacy `/icon?family=` endpoint (that one does **not** serve the Symbols font and renders ligature text). Icons used: `event_repeat`, `push_pin` (filled), `schedule`, `location_on`, `videocam`, `medical_services`, `calendar_today`, `calendar_month`, `calendar_view_week`, `grid_view`, `hourglass_empty`, `chevron_left/right`, `add`, `check`, `close`, `delete`, `edit`, `info`, `touch_app`, `home`, `forum`, `person`.
- **Fonts:** Source Sans 3 + Source Serif 4 (already in `src/assets/font/`).
- **No raster assets** are required for this feature.

---

## Files (in this bundle, under `design-files/`)
- `Therapist Availability Calendar.html` — open this in a browser to see all artboards live (desktop editor + 2 mobile screens). Pan/zoom canvas; click blocks, chips, segmented controls, and FAB-state to feel the interactions.
- `availability-week.jsx` / `availability-week.css` — **desktop** calendar + block editor (primary reference).
- `availability-mobile.jsx` / `availability-mobile.css` — **mobile** calendar + bottom-sheet create.
- `availability-styles.css` — **shared control classes** (filled-field, `.seg`, `.chips`, `.weekday`, `.time-field`, `.btn-add`, `.slots-preview`, `.hint`, etc.). Used by both desktop and mobile.
- `availability-suggestions.jsx` — the three earlier exploration directions (A form+list, B week painter, C recurring rules). Useful background; the implemented direction is the B+A merge above.
- `app-availability-week.jsx` — how the artboards are composed on the design canvas (not needed for the app).
- `design-canvas.jsx` — prototype harness only (do not port).
- `colors_and_type.css` — the CARE design tokens (source of truth for colors/type/spacing).

> Reminder: these are **design references**. Implement them in `hermanas-fe` with Angular + Angular Material + signals/reactive forms, reusing `SchedulingComponent`'s calendar helpers and the existing `AvailabilityModel`. Build the weekly grid yourself (it's a 2-D CSS grid with absolutely-positioned blocks) rather than pulling in a calendar library; reach for a library only if you later need drag-resize or multi-view.
