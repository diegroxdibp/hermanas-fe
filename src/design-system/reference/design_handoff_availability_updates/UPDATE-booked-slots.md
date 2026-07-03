# UPDATE — Booked-slot awareness & edit guards

> **This is an incremental update to the availability feature you already have.**
> Your current state: `src/app/pages/availability/availability.component.{ts,html,scss}` with the weekly calendar, the right-hand block editor / mobile bottom sheet, `TherapistBlock`, `generateSlots()`, drag-create, block move, and resize. **Do not rebuild any of that.** This update only *adds* booked-slot visibility and guards on top of it.

Read `booked-slots-spec.md` for the full feature spec (data, guards, validation). This file is the **delta checklist** — what to change in the files you already have.

---

## What's new (scope of this update)
1. Each calendar block now renders its generated slots as **per-slot bands** (was a single summary block) — every slot shows its time, recurrence, and (when booked) the service + patient.
2. **Booked-slot awareness**: fetch appointments, map them to slots, show who's booked.
3. **Edit/delete guards** so a booked slot can never be orphaned.
4. Clicking a booked slot opens an **appointment-detail panel** in the right column.

---

## File-by-file delta

### `availability.component.ts`
- **Add** appointment loading: `appointments = signal<Appointment[]>([])`; fetch in `ngOnInit` via a new `ApiService.getProfessionalAppointments(professionalId)` (see spec §2.1). 
- **Add** helpers: `bookedSlotsForBlock(block)`, `appointmentsForBlock(block)`, `bookedCount(block)`, `hasBookings(block)`, `lastBookedEndMin(block)`, `validateHonorsBookings(block)` (spec §2.3, §5.4).
- **Add** right-column mode state: `selectedAppointment = signal<Appointment | null>(null)`; setter from a booked-band click, cleared on "back".
- **Guard existing handlers** (do not rewrite them — add early-returns/clamps):
  - `startMove`: `if (this.hasBookings(block)) { this.selectBlock(event, block); return; }`
  - `startResize`: clamp shrink floor to `lastBookedEndMin(block) ?? (startMin + dur)`.
  - `setEditorSessionDuration`: no-op when `hasBookings(selectedBlock())`.
  - `removeBlock`: early-return when `hasBookings`.
  - `saveBlock`: before persist, `if (!validateHonorsBookings(updated)) { snackbar + revert; return; }`.
- **Per-slot recurrence note**: bands render each slot's own `isRecurring`. If your backend stores recurrence only per-availability, a calendar "block" may group slots from >1 availability — render each slot's own flag (spec §3.1).

### `availability.component.html`
- **Replace the block's inner markup** (both desktop `.block` and mobile `.m-block`) with the **bands** structure from the prototype (`availability-booked.jsx` → `CalBlock` / `MobBlock`):
  - no header; `.b-bands` › one `.b-band.{booked|free}` per slot › `.bd-row`(`.bd-time` + `.bd-rec`) then `.bd-svc` + `.bd-name` (booked) or "livre" (free).
  - `.bd-rec` = `event_repeat` (recurring) or filled `push_pin` (single) — flat glyph, no circle.
  - add `dense` class when `blockHeight / slotCount < 30`.
- **Add to the editor / sheet** (inside the shared `#formSections` or alongside it): the **"Sessões geradas"** `.slot-list` (only when editing an existing block), the `.book-notice`, the `.fixed` tags on locked controls, the `.booked-svc` chips, and the `.remove-guard` replacing the remove button when booked. (Prototype: `SlotList`, the editor body in `BookedDesktop`.)
- **Add** the appointment-detail panel as the right-column's alternate state (`AppointmentDetail` in the prototype) — shown when `selectedAppointment()` is set.

### `availability.component.scss`
- **Append** the rules from `availability-booked.css`. They're already authored in CARE tokens and namespaced under `.av` / `.block` / `.m-block` / `.block-editor`, matching your component. Nothing to restyle — paste the file's contents into the component SCSS (or `@use` it).

---

## Design references (in `design-files/`)
- `availability-booked.css` — **the only new styles**; append to your component SCSS.
- `availability-booked.jsx` — the React prototype of the bands, editor guards, and appointment detail. **Reference for markup/structure**, not to ship — translate to your Angular template.
- `Availability Booked Slots.html` — open in a browser to interact: click a booked slot to see the detail panel; see the anatomy artboard (free / mixed-recurrence / 1-hour) and mobile.
- `booked-slots-spec.md` — full behavioral spec (appointment→slot matching, guard rules, validation, acceptance checklist).

## Don't regress
- Keep your existing drag-create, block move, resize, week nav, mobile sheet — this update only layers on them.
- Modality stays encoded by **block colour** (no icon). No occupancy counts. No lock icons.
- Verify the 1-hour / single-slot block still fits (one band, no overflow).
