# Feature spec: Booked-slot awareness & edit/delete guards

**Surface:** `src/app/pages/availability/availability.component.*` (therapist availability calendar).
**Goal:** Show, inside each availability block, how many of its generated slots already have an appointment, and **prevent any edit or deletion that would orphan a booked slot** (i.e. leave an appointment without an availability that honors it).

Design reference: `Availability Booked Slots.html` (open it) + `availability-booked.css` (production-ready styles, already in CARE tokens). The prototype is React; you implement in the existing Angular component.

---

## 1. Core rule (the invariant)
> **Every booked slot is an anchor.** After any create/edit/move/resize/delete, every existing appointment must still fall on a generated slot of some availability block with: the **same date/weekday**, the **same start time**, a **start-aligned duration** that still produces that slot, and a **service** that still includes the appointment's service.

If an operation would break that for any appointment, **block the operation** and explain why inline. Never silently drop a booked slot.

---

## 2. Data you need

### 2.1 Fetch appointments for the professional
`ApiService` currently only has `getUserAppointments(userEmail)` (client side). Add a professional-side fetch:

```ts
// api.service.ts
getProfessionalAppointments(professionalId: number): Observable<Appointment[]> {
  return this.http.get<Appointment[]>(
    `${environment.apiUrl}/api/appointments/professional/${professionalId}`,
    { withCredentials: true },
  );
}
```
(Backend endpoint may need adding — confirm. The booked flag could alternatively ride on `AvailabilityModel` per-slot; see 2.3.)

`Appointment` (existing) already has: `availabilityId`, `professionalServiceId`, `modality`, `startDate`, `startTime`, `endTime`, `isRecurring`, `dayOfWeek`.

### 2.2 Load into a signal
```ts
appointments = signal<Appointment[]>([]);

// in ngOnInit, after loading blocks:
this.apiService.getProfessionalAppointments(userId).subscribe({
  next: (appts) => this.appointments.set(appts),
  error: () => {},
});
```

### 2.3 Map appointments → slots of a block
A slot is identified by **(block, slotStartTime)**. An appointment belongs to a block's slot when:
- It targets the same calendar position:
  - recurring block: `appointment.dayOfWeek === block.weekdays[0]` (and recurring), **or**
  - single block: `appointment.startDate === block.startDate`;
- `appointment.startTime` is one of `generateSlots(block.startTime, block.endTime, block.sessionDuration)`;
- (defensive) `appointment.startTime >= block.startTime` and `< block.endTime`.

> Prefer matching by `appointment.availabilityId === block.backendId` when the backend sets it — it's the most reliable link. Fall back to date/weekday+time matching only if `availabilityId` isn't populated for the slot.

Add a computed map and helpers:

```ts
interface SlotInfo {
  time: string;            // '14:00'
  booked: boolean;
  appointment?: Appointment;
  patientName?: string;    // if backend returns it; else fetch/display id
  serviceName?: string;
}

bookedSlotsForBlock(block: TherapistBlock): SlotInfo[] {
  const slots = generateSlots(block.startTime, block.endTime, block.sessionDuration);
  const appts = this.appointmentsForBlock(block);
  return slots.map(time => {
    const appt = appts.find(a => a.startTime === time);
    return { time, booked: !!appt, appointment: appt };
  });
}

appointmentsForBlock(block: TherapistBlock): Appointment[] {
  return this.appointments().filter(a => {
    if (block.backendId != null && a.availabilityId === block.backendId) return true;
    const sameDay = block.isRecurring
      ? (a.isRecurring && BACKEND_DOW_MAP[a.dayOfWeek as any] === block.weekdays[0])
      : (a.startDate === block.startDate);
    return sameDay && a.startTime >= block.startTime && a.startTime < block.endTime;
  });
}

bookedCount(block: TherapistBlock): number {
  return this.bookedSlotsForBlock(block).filter(s => s.booked).length;
}

// minutes the block can't shrink past = end of the LAST booked slot
lastBookedEndMin(block: TherapistBlock): number | null {
  const booked = this.bookedSlotsForBlock(block).filter(s => s.booked);
  if (booked.length === 0) return null;
  const lastStart = Math.max(...booked.map(s => timeToMin(s.time)));
  return lastStart + block.sessionDuration;
}

hasBookings(block: TherapistBlock): boolean { return this.bookedCount(block) > 0; }
```

---

## 3. Visual changes (calendar block) — per-slot bands, no header, no lock

Reference: `.block` rules in `availability-booked.css` and the prototype's `CalBlock`. **The block has no header.** It renders its generated slots as a vertical stack of equal bands; each band is self-describing. Modality is conveyed by the **block colour only** (no icon/label). There is no occupancy count.

Structure (`.block` is `display:flex; flex-direction:column; padding:0; overflow:hidden`):
- `.b-bands` (`flex:1`): one `.b-band` per generated slot (`flex:1` each → they split the block height evenly and stay aligned to the hour axis). Each band has three parts:
  - `.bd-row` — a top row holding `.bd-time` (left) + `.bd-rec` (right). Below it, left-aligned: booked → `.bd-svc` (service, small uppercase) then `.bd-name` (patient); free → italic "livre". Service sits **under** the time, left-aligned, so longer names get the full band width.
  - `.bd-rec` — **per-slot** recurrence: `event_repeat` (semanal) or a **plain filled white `push_pin`** (data única) — same flat glyph style as the repeat icon, no surrounding circle.
- **booked band** = solid block colour; **free band** = washed lighter via `.free::before`.

### 3.1 Recurrence is per-slot, not per-block
A block can contain a mix of recurring and single-date slots, so the recurrence indicator lives on **each band** (`.bd-rec`), driven by that slot/appointment's own `isRecurring` — not on the block. (Implication for the data model: if your backend stores recurrence only at the availability level, a "block" in this calendar may actually group slots from more than one availability record; render each slot's own recurrence.)

### 3.2 Service on booked slots
Once a slot is booked, show its **service name** as a small uppercase label on top of the patient name inside the band (`.bd-svc`). Use a short alias when long (e.g. "Somatic Experience®" → "Somatic"). Free slots show no service. The block no longer shows a single block-level service (a block may offer several — they live in the editor chips).

### 3.3 Adaptive sizing
- **Dense** blocks (many short slots, computed `bandHeight = blockHeight / slotCount < 30px` → add class `dense`): hide `.bd-svc` + `.bd-name`, keep time + recurrence so rows stay readable.
- A 1-hour / single-slot block is just one band (time + service + patient + recurrence) — verified to fit ~46px with no overflow.

Mobile (`.m-block`): identical model — `.mb-bands` / `.mb-band` with the same `.bd-time`/`.bd-main`(`.bd-svc`+`.bd-name`)/`.bd-rec`.

Legend: modality colour swatches (Presencial/Remoto/Qualquer) + recurrence glyphs (`event_repeat` Semanal / `push_pin` Data única). No lock, no occupancy swatch.

---

## 4. Visual + behavioral changes (editor / sheet)

### 4.1 New "Sessões geradas" section
Add a `.slots-section` to the shared `#formSections` template (so it shows in both the desktop editor and the mobile sheet), rendered **only when editing an existing block** (`selectedBlockId() !== null`):

- Header: label "Sessões geradas" + count chip ("2 de 4 reservadas" in green, or "4 livres" muted).
- `.slot-list` with one `.slot-row` per slot:
  - **free:** a hollow dashed `.s-dot` (no icon), muted time, "Livre".
  - **booked:** `.booked` row (soft green tint), a **patient-initial avatar** `.s-av.c{0..3}` (colour by index — replaces the lock), time, patient name + "{service} · {dur} min", and a `chevron_right` to open the appointment detail.

Drive it from `bookedSlotsForBlock(selectedBlock())`. The avatar is the warm, brand-aligned signal of "who has this slot" — do **not** use a padlock anywhere.

### 4.2 Reservas notice
When `hasBookings(selectedBlock())`, show `.book-notice` (green-tinted, `event_available` icon — not a lock) at the top of `.be-body` / `.sh-body`: "**N sessões reservadas** neste bloco. Para as proteger, alguns campos ficam fixos. Pode estender o horário e adicionar serviços livremente."

### 4.3 Which controls are fixed (when the block has bookings)
"Fixed" controls are dimmed (`.fixed` → opacity + `pointer-events:none`) with a plain muted **"fixo"** pill (`.fixed-tag`) in their label — **no padlock icon**.
| Control | Rule |
|--------|------|
| **Serviço** | Services used by a booked appointment use `.chip.booked-svc` (kept on, non-removable, marked with a small green `.bdot` — no padlock). Other services can still be added/removed. |
| **Modalidade** | Lock to the booked modality if appointments depend on it (LOCAL/REMOTE); `ANY` stays flexible. Otherwise `.fixed`. |
| **Frequência** (once/weekly) | `.fixed` entirely — changing it moves every slot. |
| **Dias da semana / Data** | `.fixed` — changing the day orphans the appointment. |
| **Duração** | `.fixed` — re-slicing changes slot boundaries. |
| **Início (start time)** | `.fixed` — moving start shifts all slot boundaries. |
| **Fim (end time)** | **Allowed to _grow_**; may only shrink down to `lastBookedEndMin` (never below). |

Apply `.fixed` to the `.be-section`/control and put a `.fixed-tag` ("fixo" pill, no icon) in its `.control-label`.

### 4.4 Remove button → guard
When `hasBookings`, **replace** the `.btn-remove` button with a `.remove-guard` card (green `event_busy` icon, no padlock): "**Este bloco não pode ser removido.** Tem N sessões reservadas — cancele ou reagende essas sessões primeiro."

`removeBlock()` must also defend server-side intent: early-return if `hasBookings(block)` (don't call `deleteAvailability`).

---

## 5. Behavioral guards on the calendar interactions

These hook into the existing pointer handlers in `availability.component.ts`.

### 5.1 Move (`startMove`)
If `hasBookings(block)` → **do not start a move**. Early-return at the top of `startMove` (keep `cursor: default` via the `.pinned` class on booked blocks). Rationale: any move changes day and/or time of booked slots.

```ts
startMove(event, block, colIndex) {
  if ((event.target as HTMLElement).closest('.b-resize-handle')) return;
  if (this.hasBookings(block)) { this.selectBlock(event, block); return; } // select, don't move
  // …existing move logic…
}
```

### 5.2 Resize (`startResize`)
Clamp the shrink lower-bound to `lastBookedEndMin(block)` instead of `startMin + dur`:

```ts
const floorMin = this.lastBookedEndMin(this._resizeBlock) ?? (startMin + dur);
const clamped = Math.max(floorMin, Math.min(20 * 60, snapped));
```
Growing is always allowed. While resizing a booked block, render the `.resize-floor` hatched overlay (height = `lastBookedEndMin → block bottom`) with a "mín." label so the therapist sees the limit. (See prototype artboard 2.)

### 5.3 Duration change (`setEditorSessionDuration`)
If editing a block with bookings → no-op (control is locked in UI; also guard in code).

### 5.4 Save (`saveBlock`) — final validation
Before persisting an edit to an existing block, run `validateHonorsBookings(updatedBlock)`:
- recompute slots of the **updated** block;
- assert every existing appointment for that block still matches a slot (same start time, still within range, duration aligned, service still present);
- if any fail → abort, show snackbar: "Esta alteração deixaria N sessão(ões) reservada(s) sem disponibilidade. Ajuste mantendo as sessões marcadas." and revert the optimistic update.

```ts
private validateHonorsBookings(updated: TherapistBlock): boolean {
  const appts = this.appointmentsForBlock(updated);
  if (appts.length === 0) return true;
  const slots = new Set(generateSlots(updated.startTime, updated.endTime, updated.sessionDuration));
  const svcIds = new Set(updated.services.map(s => s.id));
  return appts.every(a =>
    slots.has(a.startTime) &&
    (a.professionalServiceId == null || svcIds.has(a.professionalServiceId)),
  );
}
```

---

## 6. Appointment detail (click a booked slot)
Clicking a booked slot band swaps the right column from the block editor to an **appointment-detail panel** (`.appt-detail`, reference in prototype `AppointmentDetail`): a "Voltar ao bloco" back link, a patient header (avatar + name), info rows (serviço, horário, recorrência, modalidade, contacto), and actions **Reagendar sessão** / **Cancelar sessão**. These actions live on the appointment, not the availability. Cancelling frees the slot → it becomes editable again.

Implement as a right-column mode toggle: `selectedAppointment` signal; set it from a booked band's click, clear it on back. On mobile, present the same content as a sheet/route.

---

## 7. Acceptance checklist
- [ ] Blocks show lock chip + slot strip + "N reservadas · M livres" when any slot booked.
- [ ] Editor lists every slot with free/booked state and patient name on booked rows.
- [ ] Lock notice appears when bookings exist; locked controls are dimmed with a lock tag.
- [ ] Booked service chips can't be deselected.
- [ ] Frequency, weekday/date, duration, and start time are locked when bookings exist.
- [ ] End time can grow; can't shrink past the last booked slot (calendar resize respects the same floor, with the hatched `.resize-floor` shown).
- [ ] Booked blocks can't be dragged to move.
- [ ] Remove is replaced by the guard card; `removeBlock()` early-returns.
- [ ] `saveBlock()` runs `validateHonorsBookings` and reverts + warns on violation.
- [ ] Mobile sheet mirrors the slot list, lock notice, and remove guard.

## Files
- `availability-booked.css` — drop-in styles (CARE tokens), classes referenced above.
- `Availability Booked Slots.html` / `availability-booked.jsx` — runnable visual reference (desktop, anatomy, mobile).
- Reuse: existing `generateSlots`, `timeToMin`, `minToTime`, `COL_TO_DOW`, `BACKEND_DOW_MAP`, `ROW_H`.
