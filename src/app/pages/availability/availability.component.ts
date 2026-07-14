import { forkJoin, of } from 'rxjs';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Modality } from '../../shared/enums/modality.enum';
import { isModalityCompatible, normalizeModality, toBackendModality } from '../../shared/utils/modality-compatibility.util';
import { DayOfWeek } from '../../shared/enums/day-of-week.enum';
import { ProfessionalService } from '../../shared/models/professional-service.model';
import { ApiService, AvailabilityPayload } from '../../core/services/api.service';
import { AvailabilityModel } from '../../shared/models/availability.model';
import { Appointment } from '../../shared/models/appointment.model';
import { ScreenSizeService } from '../../shared/services/screen-size.service';
import { SessionService } from '../../shared/services/session.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { SchedulingService } from '../../shared/services/scheduling.service';
import { SchedulingSteps } from '../../shared/enums/scheduling-steps.enum';
import { SchedulingFormControls } from '../../shared/enums/scheduling-form-controls.enum';
import { ProfessionalSessionService } from '../../shared/enums/professional-session-service.enum';

// ─── Module-level constants ───────────────────────────────────────────────────

const PT_MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const PT_DOW_SHORT = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const PT_DOW_LONG = [
  'segunda-feira','terça-feira','quarta-feira',
  'quinta-feira','sexta-feira','sábado','domingo',
];
const PT_DOW_PLURAL = [
  'Segundas-feiras','Terças-feiras','Quartas-feiras',
  'Quintas-feiras','Sextas-feiras','Sábados','Domingos',
];
const HOURS = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00',
];
const HOURS_END = [...HOURS, '20:00'];
const MOB_HOURS = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00',
  '20:00','21:00','22:00','23:00',
];
const EDITOR_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30',
];
const EDITOR_HOURS_END = [...EDITOR_HOURS, '20:00'];
const ROW_H = 52;
const MOB_ROW_H = 80;
const COL_TO_DOW: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];
const SESSION_DURATIONS = [30, 60, 90] as const;
const WEEKDAYS = COL_TO_DOW;

// ─── Module-level helpers ─────────────────────────────────────────────────────

function getWeekStart(d: Date): Date {
  const day = new Date(d);
  const dow = day.getDay(); // 0=Sun,1=Mon...
  const diff = (dow === 0 ? -6 : 1 - dow); // shift to Monday
  day.setDate(day.getDate() + diff);
  day.setHours(0, 0, 0, 0);
  return day;
}

function stripSec(t: string): string {
  return t && t.length > 5 ? t.slice(0, 5) : t;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function hourRowIdx(t: string): number {
  return timeToMin(t) / 60 - 8; // '08:00' → 0
}

function generateSlots(start: string, end: string, dur: number): string[] {
  const startMin = timeToMin(start);
  const endMin = timeToMin(end);
  const count = Math.floor((endMin - startMin) / dur);
  const slots: string[] = [];
  for (let i = 0; i < count; i++) {
    slots.push(minToTime(startMin + i * dur));
  }
  return slots;
}

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Models ───────────────────────────────────────────────────────────────────

interface DragSelection {
  colIndex: number;
  startTime: string;
  endTime: string;
}

interface PreviewBlock {
  colIndex: number;
  startTime: string;
  endTime: string;
  hasConflict: boolean;
  modality: Modality;
}

interface SlotInfo {
  time: string;
  booked: boolean;
  appointment?: Appointment;
}

interface BackendSlot {
  slotTime: string;
  backendId: number;
  isBooked: boolean;
}

interface TherapistBlock {
  id: number;
  backendSlots: BackendSlot[];
  services: ProfessionalService[];
  modality: Modality;
  isRecurring: boolean;
  weekdays: DayOfWeek[];
  startDate?: string;
  startTime: string;
  endTime: string;
  sessionDuration: 30 | 60 | 90;
  local?: string;
}

// ─── Backend → frontend enum maps ─────────────────────────────────────────────

const BACKEND_DOW_MAP: Record<string, DayOfWeek> = {
  MONDAY: DayOfWeek.MONDAY,
  TUESDAY: DayOfWeek.TUESDAY,
  WEDNESDAY: DayOfWeek.WEDNESDAY,
  THURSDAY: DayOfWeek.THURSDAY,
  FRIDAY: DayOfWeek.FRIDAY,
  SATURDAY: DayOfWeek.SATURDAY,
  SUNDAY: DayOfWeek.SUNDAY,
};

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.scss',
})
export class AvailabilityComponent implements OnInit {
  // ─ Services
  private readonly apiService = inject(ApiService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly schedulingService = inject(SchedulingService);
  readonly screenSize = inject(ScreenSizeService);
  private readonly sessionService = inject(SessionService);
  private readonly dialog = inject(MatDialog);

  // ─ Expose to template
  readonly HOURS = HOURS;
  readonly HOURS_END = HOURS_END;
  readonly MOB_HOURS = MOB_HOURS;
  readonly EDITOR_HOURS = EDITOR_HOURS;
  readonly EDITOR_HOURS_END = EDITOR_HOURS_END;
  readonly ROW_H = ROW_H;
  readonly MOB_ROW_H = MOB_ROW_H;
  readonly Modality = Modality;
  readonly DayOfWeek = DayOfWeek;
  readonly PT_DOW_SHORT = PT_DOW_SHORT;
  readonly SESSION_DURATIONS = SESSION_DURATIONS;
  readonly WEEKDAYS = WEEKDAYS;
  readonly PT_MONTHS = PT_MONTHS;
  readonly PT_DOW_LONG = PT_DOW_LONG;

  // ─ Week navigation
  weekStart = signal<Date>(getWeekStart(new Date()));

  readonly weekDays = computed<Date[]>(() => {
    const start = this.weekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  });

  readonly weekLabel = computed<string>(() => {
    const days = this.weekDays();
    const first = days[0];
    const last = days[6];
    const firstDay = first.getDate();
    const lastDay = last.getDate();
    const month = PT_MONTHS[last.getMonth()];
    const year = last.getFullYear();
    return `${firstDay} – ${lastDay} ${month} · ${year}`;
  });

  readonly monthLabel = computed<string>(() => {
    const start = this.weekStart();
    return PT_MONTHS[start.getMonth()];
  });

  readonly weekRangeLabel = computed<string>(() => {
    const days = this.weekDays();
    const first = days[0];
    const last = days[6];
    return `semana ${first.getDate()}–${last.getDate()}`;
  });

  // ─ Data
  services = signal<ProfessionalService[]>([]);
  appointments = signal<Appointment[]>([]);

  private _nextId = 0;

  blocks = signal<TherapistBlock[]>([]);

  selectedBlockId = signal<number | null>(null);
  selectedAppointment = signal<Appointment | null>(null);

  // ─ Editor state
  selectedServiceIds = signal<Set<number>>(new Set());
  editorModality = signal<Modality>(Modality.ANY);
  editorFrequency = signal<'once' | 'weekly'>('weekly');
  selectedWeekdays = signal<Set<DayOfWeek>>(new Set());
  editorDate = signal<string>('');
  editorStartTime = signal<string>('09:00');
  editorEndTime = signal<string>('13:00');
  editorSessionDuration = signal<30 | 60 | 90>(60);
  editorLocal = signal<string>('Consultório · R. da Misericórdia 53');

  // ─ Date picker calendar (editor)
  readonly edCalWeekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  edCalOpen = signal<boolean>(false);
  edCalViewDate = signal<Date>(new Date());
  readonly edCalMonthLabel = computed(() => {
    const d = this.edCalViewDate();
    return `${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });
  readonly edCalDays = computed(() => {
    const view = this.edCalViewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const days: Array<{ date: Date; inMonth: boolean; key: string }> = [];
    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false, key: toKey(d) });
    }
    const total = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= total; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, inMonth: true, key: toKey(d) });
    }
    while (days.length < 42) {
      const prev = days[days.length - 1].date;
      const d = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      days.push({ date: d, inMonth: false, key: toKey(d) });
    }
    return days;
  });

  // ─ Mobile
  selectedDayIndex = signal<number>(this._todayColumnIndex());
  sheetOpen = signal<boolean>(false);
  mobileWeekNavOpen = signal<boolean>(false);

  // ─ Drag-select
  dragSelection = signal<DragSelection | null>(null);

  // ─ Block move
  movingBlockId = signal<number | null>(null);
  isDraggingMove = signal<boolean>(false);
  moveLiveStart = signal<string>('');
  moveLiveEnd = signal<string>('');
  moveLiveCol = signal<number>(0);
  moveLiveConflict = signal<boolean>(false);

  readonly movingBlock = computed(() => {
    const id = this.movingBlockId();
    return id !== null ? (this.blocks().find(b => b.id === id) ?? null) : null;
  });

  readonly ghostSlotTimes = computed(() => {
    const block = this.movingBlock();
    if (!block) return [];
    return generateSlots(this.moveLiveStart(), this.moveLiveEnd(), block.sessionDuration);
  });

  // ─ Resize (bottom)
  resizingBlockId = signal<number | null>(null);
  resizeLiveEndTime = signal<string>('');
  private _resizeBlock: TherapistBlock | null = null;
  private _resizeColEl: HTMLElement | null = null;
  private _resizeRowH = ROW_H;
  private _resizeDragged = false;

  // ─ Resize (top)
  resizingTopBlockId = signal<number | null>(null);
  resizeLiveStartTime = signal<string>('');
  private _resizeTopBlock: TherapistBlock | null = null;
  private _resizeTopColEl: HTMLElement | null = null;
  private _resizeTopRowH = ROW_H;
  private _resizeTopDragged = false;

  // ─ Preview move
  isMovingPreview = signal<boolean>(false);
  previewMoveLiveStart = signal<string>('');
  previewMoveLiveEnd = signal<string>('');
  previewMoveLiveCol = signal<number>(0);

  // ─ Computed
  readonly selectedBlock = computed(() =>
    this.blocks().find(b => b.id === this.selectedBlockId()) ?? null,
  );

  readonly generatedSlots = computed(() =>
    generateSlots(
      this.editorStartTime(),
      this.editorEndTime(),
      this.editorSessionDuration(),
    ),
  );

  readonly editorStartTimeOptions = computed<string[]>(() => {
    const dur = this.editorSessionDuration();
    return EDITOR_HOURS.filter(h => timeToMin(h) + dur <= 20 * 60);
  });

  readonly editorEndTimeOptions = computed<string[]>(() => {
    const startMin = timeToMin(this.editorStartTime());
    const dur = this.editorSessionDuration();
    const opts: string[] = [];
    for (let n = 1; startMin + n * dur <= 20 * 60; n++) {
      opts.push(minToTime(startMin + n * dur));
    }
    return opts;
  });

  readonly editorTitle = computed<string>(() => {
    if (this.editorFrequency() === 'weekly') {
      const wds = [...this.selectedWeekdays()];
      if (wds.length === 0) return 'Novo bloco';
      const idx = COL_TO_DOW.indexOf(wds[0]);
      const name = idx >= 0 ? PT_DOW_LONG[idx] : wds[0].toLowerCase();
      return wds.length === 1
        ? `Disponibilidade de ${name}`
        : `Disponibilidade de ${wds.length} dias`;
    } else {
      if (!this.editorDate()) return 'Nova disponibilidade';
      const d = new Date(this.editorDate() + 'T00:00:00');
      const dow = PT_DOW_LONG[(d.getDay() + 6) % 7];
      return `Disponibilidade de ${dow}`;
    }
  });

  readonly editorSubtitle = computed<string>(() => {
    const start = this.editorStartTime();
    const end = this.editorEndTime();
    const timeRange = start && end ? ` · das ${start} às ${end}` : '';

    if (this.editorFrequency() === 'weekly') {
      const wds = [...this.selectedWeekdays()];
      if (wds.length === 0) return 'Semanal';
      const days = wds.map(wd => {
        const idx = COL_TO_DOW.indexOf(wd);
        return idx >= 0 ? PT_DOW_PLURAL[idx] : wd;
      });
      const label = wds.length === 1 ? days[0] : days.join(', ');
      return label + timeRange;
    } else {
      if (!this.editorDate()) return 'Data única';
      const d = new Date(this.editorDate() + 'T00:00:00');
      const day = d.getDate();
      const month = PT_MONTHS[d.getMonth()];
      const year = d.getFullYear();
      return `${day} de ${month} · ${year}${timeRange}`;
    }
  });

  readonly previewBlocks = computed<PreviewBlock[]>(() => {
    const startTime = this.editorStartTime();
    const endTime = this.editorEndTime();
    if (timeToMin(endTime) <= timeToMin(startTime)) return [];

    const frequency = this.editorFrequency();
    const modality = this.editorModality();
    const colIndices: number[] = [];

    if (frequency === 'weekly') {
      for (const wd of this.selectedWeekdays()) {
        const idx = COL_TO_DOW.indexOf(wd);
        if (idx >= 0) colIndices.push(idx);
      }
    } else {
      const dateStr = this.editorDate();
      if (!dateStr) return [];
      const idx = this.weekDays().findIndex(d => toKey(d) === dateStr);
      if (idx >= 0) colIndices.push(idx);
    }

    if (colIndices.length === 0) return [];

    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);
    const editingId = this.selectedBlockId();

    return colIndices.map(colIdx => {
      const hasConflict = this.blocksForColumn(colIdx)
        .filter(b => b.id !== editingId)
        .some(b => startMin < timeToMin(b.endTime) && timeToMin(b.startTime) < endMin);
      return { colIndex: colIdx, startTime, endTime, hasConflict, modality };
    });
  });

  readonly conflictedBlockIds = computed<Set<number>>(() => {
    const previews = this.previewBlocks();
    if (previews.length === 0) return new Set<number>();
    const editingId = this.selectedBlockId();
    const ids = new Set<number>();
    for (const p of previews) {
      const pStart = timeToMin(p.startTime);
      const pEnd = timeToMin(p.endTime);
      for (const b of this.blocksForColumn(p.colIndex)) {
        if (b.id !== editingId && pStart < timeToMin(b.endTime) && timeToMin(b.startTime) < pEnd) {
          ids.add(b.id);
        }
      }
    }
    return ids;
  });

  // ─ Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.apiService.getServices().subscribe({
      next: (svcs) => { if (svcs?.length) this.services.set(svcs); },
      error: () => {},
    });

    const userId = this.sessionService.user()?.id;
    if (userId) {
      this.apiService.getAvailabilitiesByProfessionalId(userId).subscribe({
        next: (avails) => this.blocks.set(this.groupAvailabilitiesIntoBlocks(avails)),
        error: () => {},
      });
      this.apiService.getProfessionalAppointments(userId).subscribe({
        next: (appts) => {
          this.appointments.set(appts.map(a => ({
            ...a,
            startTime: stripSec(a.startTime),
            endTime: stripSec(a.endTime),
          })));
          this.apiService.getClientUsers().subscribe({
            next: (clients) => {
              const nameMap = new Map(clients.map(c => [c.id, c.name]));
              this.appointments.update(list =>
                list.map(a => ({
                  ...a,
                  clientName: nameMap.get(a.clientId) ?? a.clientName,
                  clientEmail: clients.find(c => c.id === a.clientId)?.email ?? a.clientEmail,
                }))
              );
            },
            error: () => {},
          });
        },
        error: () => {},
      });
    }
  }

  // ─ Week navigation ──────────────────────────────────────────────────────────

  calSlideClass = signal<string>('');

  goToToday(): void {
    const today = getWeekStart(new Date());
    const cur = this.weekStart();
    if (today.getTime() === cur.getTime()) return;
    this.animateToWeek(today, today > cur ? 'left' : 'right');
  }

  prevWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.animateToWeek(d, 'right');
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.animateToWeek(d, 'left');
  }

  onEditorDateChange(dateStr: string): void {
    this.editorDate.set(dateStr);
    if (!dateStr) return;
    const isInCurrentWeek = this.weekDays().some(d => toKey(d) === dateStr);
    if (isInCurrentWeek) return;
    const target = new Date(dateStr + 'T00:00:00');
    const newStart = getWeekStart(target);
    this.animateToWeek(newStart, newStart > this.weekStart() ? 'left' : 'right');
  }

  @HostListener('document:click')
  onDocClick(): void { this.edCalOpen.set(false); }

  edCalToggle(event: MouseEvent): void {
    event.stopPropagation();
    const wasOpen = this.edCalOpen();
    if (!wasOpen) {
      const selected = this.editorDate();
      if (selected) this.edCalViewDate.set(new Date(selected + 'T00:00:00'));
    }
    this.edCalOpen.set(!wasOpen);
  }

  edCalPrevMonth(): void {
    const d = this.edCalViewDate();
    this.edCalViewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  edCalNextMonth(): void {
    const d = this.edCalViewDate();
    this.edCalViewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  edCalSelectDate(key: string): void {
    this.edCalOpen.set(false);
    this.onEditorDateChange(key);
  }

  edCalIsPast(date: Date): boolean {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return date < t;
  }

  edCalIsToday(date: Date): boolean {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate();
  }

  edCalFmtDate(key: string): string {
    if (!key) return '';
    const [y, m, d] = key.split('-');
    return `${d}/${m}/${y}`;
  }

  private animateToWeek(newStart: Date, dir: 'left' | 'right'): void {
    const exitCls = dir === 'left' ? 'cal-exit-left' : 'cal-exit-right';
    const enterCls = dir === 'left' ? 'cal-enter-right' : 'cal-enter-left';
    this.calSlideClass.set(exitCls);
    setTimeout(() => {
      this.weekStart.set(newStart);
      this.calSlideClass.set(enterCls);
      setTimeout(() => this.calSlideClass.set(''), 280);
    }, 220);
  }

  // ─ Calendar helpers ─────────────────────────────────────────────────────────

  blocksForColumn(colIndex: number): TherapistBlock[] {
    const dow = COL_TO_DOW[colIndex];
    const dayDate = this.weekDays()[colIndex];
    const dayKey = toKey(dayDate);
    return this.blocks().filter(b => {
      if (b.isRecurring) {
        return b.weekdays.includes(dow);
      } else {
        return b.startDate === dayKey;
      }
    });
  }

  blockTopPx(block: TherapistBlock, rowH: number = ROW_H): number {
    return hourRowIdx(block.startTime) * rowH + 3;
  }

  blockHeightPx(block: TherapistBlock, rowH: number = ROW_H): number {
    return (hourRowIdx(block.endTime) - hourRowIdx(block.startTime)) * rowH - 6;
  }

  blockResizeHeightPx(block: TherapistBlock, liveEndTime: string, rowH = ROW_H): number {
    return (hourRowIdx(liveEndTime) - hourRowIdx(block.startTime)) * rowH - 6;
  }

  previewBlocksForColumn(colIndex: number): PreviewBlock[] {
    return this.previewBlocks().filter(p => p.colIndex === colIndex);
  }

  mobileDayPreview(): PreviewBlock[] {
    return this.previewBlocks().filter(p => p.colIndex === this.selectedDayIndex());
  }

  previewTopPx(startTime: string, rowH = ROW_H): number {
    return hourRowIdx(startTime) * rowH + 3;
  }

  previewHeightPx(startTime: string, endTime: string, rowH = ROW_H): number {
    return (hourRowIdx(endTime) - hourRowIdx(startTime)) * rowH - 6;
  }

  blockSlotCount(block: TherapistBlock): number {
    return Math.floor(
      (timeToMin(block.endTime) - timeToMin(block.startTime)) / block.sessionDuration,
    );
  }

  serviceDisplayName(key: string): string {
    return ProfessionalSessionService[key as keyof typeof ProfessionalSessionService] ?? key;
  }

  blockServiceLabel(block: TherapistBlock): string {
    if (block.services.length === 0) return '';
    const first = this.serviceDisplayName(block.services[0].name);
    if (block.services.length === 1) return first;
    return `${first} +${block.services.length - 1}`;
  }

  // ─ Selection / editor ───────────────────────────────────────────────────────

  selectBlock(event: Event, block: TherapistBlock): void {
    event.stopPropagation();
    this.selectedBlockId.set(block.id);
    this.selectedAppointment.set(null);
    this.loadBlockIntoEditor(block);
  }

  loadBlockIntoEditor(block: TherapistBlock): void {
    this.selectedServiceIds.set(new Set(block.services.map(s => s.id)));
    this.editorModality.set(block.modality);
    this.editorFrequency.set(block.isRecurring ? 'weekly' : 'once');
    this.selectedWeekdays.set(new Set(block.weekdays));
    this.editorDate.set(block.startDate ?? '');
    this.editorStartTime.set(block.startTime);
    this.editorEndTime.set(block.endTime);
    this.editorSessionDuration.set(block.sessionDuration);
    this.editorLocal.set(block.local ?? 'Consultório · R. da Misericórdia 53');
  }

  startMove(event: PointerEvent, block: TherapistBlock, colIndex: number): void {
    if ((event.target as HTMLElement).closest('.b-resize-handle')) return;
    if ((event.target as HTMLElement).closest('.b-resize-handle-top')) return;
    if (this.hasBookings(block)) { this.selectBlock(event, block); return; }

    const blockEl = event.currentTarget as HTMLElement;
    const daycol = blockEl.parentElement as HTMLElement;
    const weekGrid = daycol.parentElement as HTMLElement;

    const colEls = Array.from(weekGrid.querySelectorAll<HTMLElement>('.daycol'));
    const colRects = colEls.map(el => el.getBoundingClientRect());
    const colTopY = colRects[colIndex].top;

    const blockRect = blockEl.getBoundingClientRect();
    const grabOffsetMin = Math.max(0, (event.clientY - blockRect.top) / ROW_H * 60);
    const durationMin = timeToMin(block.endTime) - timeToMin(block.startTime);

    let moved = false;

    this.movingBlockId.set(block.id);
    this.moveLiveStart.set(block.startTime);
    this.moveLiveEnd.set(block.endTime);
    this.moveLiveCol.set(colIndex);

    blockEl.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent) => {
      if (!moved) {
        moved = true;
        this.isDraggingMove.set(true);
      }

      let newCol = colIndex;
      for (let i = 0; i < colRects.length; i++) {
        if (e.clientX >= colRects[i].left && e.clientX < colRects[i].right) { newCol = i; break; }
      }
      if (e.clientX < colRects[0].left) newCol = 0;
      if (e.clientX >= colRects[colRects.length - 1].right) newCol = colRects.length - 1;

      const anchoredStart = (e.clientY - colTopY) / ROW_H * 60 + 8 * 60 - grabOffsetMin;
      const snapped = Math.round(anchoredStart / 30) * 30;
      const clampedStart = Math.max(8 * 60, Math.min(20 * 60 - durationMin, snapped));

      this.moveLiveCol.set(newCol);
      this.moveLiveStart.set(minToTime(clampedStart));
      this.moveLiveEnd.set(minToTime(clampedStart + durationMin));
      this.moveLiveConflict.set(
        this._hasMoveConflict(block.id, newCol, minToTime(clampedStart), minToTime(clampedStart + durationMin))
      );
    };

    const onUp = () => {
      blockEl.removeEventListener('pointermove', onMove);
      blockEl.removeEventListener('pointerup', onUp);
      blockEl.removeEventListener('pointercancel', onUp);

      const newCol = this.moveLiveCol();
      const newStart = this.moveLiveStart();
      const newEnd = this.moveLiveEnd();
      const hasConflict = this.moveLiveConflict();

      this.movingBlockId.set(null);
      this.isDraggingMove.set(false);
      this.moveLiveConflict.set(false);

      if (!moved) return;

      document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });

      if (hasConflict) return;

      if (newStart === block.startTime && newEnd === block.endTime && newCol === colIndex) return;

      const newWeekday = COL_TO_DOW[newCol];
      // For non-recurring blocks the new date is the actual calendar date of the target column.
      // dateForWeekday() derives that date from the current week view for both types.
      const newDate = this.dateForWeekday(newWeekday);
      const updated: TherapistBlock = {
        ...block,
        startTime: newStart,
        endTime: newEnd,
        weekdays: block.isRecurring ? [newWeekday] : [],
        startDate: block.isRecurring ? block.startDate : newDate,
      };
      this.blocks.update(bs => bs.map(b => b.id === block.id ? updated : b));
      this._invalidateSchedulingCache();

      if (block.backendSlots.length > 0) {
        const dur = block.sessionDuration;
        const slotTimes = generateSlots(newStart, newEnd, dur);
        // UPDATE each existing slot record in place (duration is preserved during a move,
        // so slot count never changes). Avoids delete+create race conditions.
        const updateOps = block.backendSlots.map((s, i) => {
          const slotStart = slotTimes[i] ?? s.slotTime;
          const slotEnd = minToTime(timeToMin(slotStart) + dur);
          return this.apiService.updateAvailability(s.backendId,
            this.buildSlotPayload(block.services, block.modality, block.isRecurring, newDate, slotStart, slotEnd),
          );
        });
        forkJoin(updateOps).subscribe({
          next: (results) => {
            const newSlots: BackendSlot[] = block.backendSlots.map((s, i) => ({
              ...s,
              slotTime: slotTimes[i] ?? s.slotTime,
            }));
            this.blocks.update(bs => bs.map(b =>
              b.id === block.id ? { ...b, backendSlots: newSlots } : b,
            ));
          },
          error: () => this.blocks.update(bs => bs.map(b => b.id === block.id ? block : b)),
        });
      }
    };

    blockEl.addEventListener('pointermove', onMove);
    blockEl.addEventListener('pointerup', onUp);
    blockEl.addEventListener('pointercancel', onUp);
  }

  private _hasMoveConflict(excludeId: number, colIndex: number, startTime: string, endTime: string): boolean {
    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);
    return this.blocksForColumn(colIndex).some(b =>
      b.id !== excludeId &&
      startMin < timeToMin(b.endTime) &&
      timeToMin(b.startTime) < endMin,
    );
  }

  startDragSelect(event: PointerEvent, colIndex: number): void {
    if ((event.target as HTMLElement).closest('.block, .b-resize-handle')) return;
    event.preventDefault();

    const hcell = event.currentTarget as HTMLElement;
    const daycol = hcell.parentElement as HTMLElement;
    const colRect = daycol.getBoundingClientRect();

    const anchorMin = this._yToSnappedMin(event.clientY - colRect.top, ROW_H);
    const minDuration = this.editorSessionDuration();
    let dragMoved = false;

    this.dragSelection.set({
      colIndex,
      startTime: minToTime(anchorMin),
      endTime: minToTime(Math.min(anchorMin + 60, 20 * 60)),
    });

    hcell.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent) => {
      const currentMin = this._yToSnappedMin(e.clientY - colRect.top, ROW_H);
      if (currentMin !== anchorMin) dragMoved = true;
      const lo = Math.max(8 * 60, Math.min(anchorMin, currentMin));
      const rawHi = Math.min(20 * 60, Math.max(lo + minDuration, currentMin));
      const sessions = Math.max(1, Math.round((rawHi - lo) / minDuration));
      const hi = Math.min(20 * 60, lo + sessions * minDuration);
      this.dragSelection.set({ colIndex, startTime: minToTime(lo), endTime: minToTime(hi) });
    };

    const onUp = () => {
      hcell.removeEventListener('pointermove', onMove);
      hcell.removeEventListener('pointerup', onUp);
      hcell.removeEventListener('pointercancel', onUp);

      const sel = this.dragSelection();
      this.dragSelection.set(null);
      if (!sel) return;

      if (dragMoved) {
        document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });
      }

      this.resetEditor();
      this.selectedServiceIds.set(new Set(this.services().map(s => s.id)));
      this.selectedWeekdays.set(new Set([COL_TO_DOW[colIndex]]));
      this.editorFrequency.set('weekly');
      this.editorStartTime.set(sel.startTime);
      this.editorEndTime.set(sel.endTime);
      this._snapTimeRange(this.editorSessionDuration());
    };

    hcell.addEventListener('pointermove', onMove);
    hcell.addEventListener('pointerup', onUp);
    hcell.addEventListener('pointercancel', onUp);
  }

  setEditorFrequency(freq: 'once' | 'weekly'): void {
    if (freq === this.editorFrequency()) return;

    if (freq === 'once') {
      // Carry the day over: map first selected weekday → its actual date in the visible week
      const wds = [...this.selectedWeekdays()];
      const colIdx = wds.length > 0 ? COL_TO_DOW.indexOf(wds[0]) : -1;
      if (colIdx >= 0) {
        this.editorDate.set(toKey(this.weekDays()[colIdx]));
      }
    } else {
      // Carry the day over: map editorDate → weekday column
      const dateStr = this.editorDate();
      if (dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const dow = COL_TO_DOW[(d.getDay() + 6) % 7];
        if (dow) this.selectedWeekdays.set(new Set([dow]));
        // Navigate to that week if it's not the one currently shown
        const newStart = getWeekStart(d);
        if (newStart.getTime() !== this.weekStart().getTime()) {
          this.animateToWeek(newStart, newStart > this.weekStart() ? 'left' : 'right');
        }
      }
    }

    this.editorFrequency.set(freq);
  }

  private _yToSnappedMin(y: number, rowH: number): number {
    const raw = (y / rowH + 8) * 60;
    const snapped = Math.round(raw / 30) * 30;
    return Math.max(8 * 60, Math.min(20 * 60, snapped));
  }

  resetEditor(): void {
    this.selectedBlockId.set(null);
    this.selectedAppointment.set(null);
    this.selectedServiceIds.set(new Set());
    this.editorModality.set(Modality.ANY);
    this.editorFrequency.set('weekly');
    this.selectedWeekdays.set(new Set());
    this.editorDate.set('');
    this.editorStartTime.set('09:00');
    this.editorEndTime.set('13:00');
    this.editorSessionDuration.set(60);
    this.editorLocal.set('Consultório · R. da Misericórdia 53');
  }

  toggleService(id: number): void {
    const set = new Set(this.selectedServiceIds());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.selectedServiceIds.set(set);
  }

  isServiceEligible(svc: ProfessionalService): boolean {
    return isModalityCompatible(svc.modality, this.editorModality());
  }

  setEditorModality(m: Modality): void {
    this.editorModality.set(m);
    const eligibleIds = new Set(
      this.services().filter(s => isModalityCompatible(s.modality, m)).map(s => s.id),
    );
    this.selectedServiceIds.update(ids => new Set([...ids].filter(id => eligibleIds.has(id))));
  }

  setEditorSessionDuration(dur: 30 | 60 | 90): void {
    const sel = this.selectedBlock();
    if (sel && this.hasBookings(sel)) return;
    this.editorSessionDuration.set(dur);
    this._snapTimeRange(dur);
  }

  setEditorStartTime(time: string): void {
    this.editorStartTime.set(time);
    this._snapTimeRange(this.editorSessionDuration());
  }

  private _snapTimeRange(dur: number): void {
    const startMin = timeToMin(this.editorStartTime());
    const endMin   = timeToMin(this.editorEndTime());
    const sessions = Math.max(1, Math.floor((endMin - startMin) / dur));
    const snappedEnd = Math.min(startMin + sessions * dur, 20 * 60);
    if (snappedEnd !== endMin) {
      this.editorEndTime.set(minToTime(snappedEnd));
    }
  }

  toggleWeekday(wd: DayOfWeek): void {
    const set = new Set(this.selectedWeekdays());
    if (set.has(wd)) {
      set.delete(wd);
    } else {
      set.add(wd);
    }
    this.selectedWeekdays.set(set);
  }

  saveBlock(): void {
    const selectedSvcs = this.services().filter(s => this.selectedServiceIds().has(s.id));
    if (selectedSvcs.length === 0) return;

    const isRecurring = this.editorFrequency() === 'weekly';
    const existingId = this.selectedBlockId();

    if (existingId !== null) {
      const existing = this.blocks().find(b => b.id === existingId);
      if (!existing || existing.backendSlots.length === 0) return;

      const effectiveStartDate = !isRecurring
        ? (existing.startDate ?? this.editorDate())
        : existing.startDate;

      const updated: TherapistBlock = {
        ...existing,
        services: selectedSvcs,
        modality: this.editorModality(),
        isRecurring,
        weekdays: isRecurring ? existing.weekdays : [],
        startDate: isRecurring ? undefined : effectiveStartDate,
        startTime: this.editorStartTime(),
        endTime: this.editorEndTime(),
        sessionDuration: this.editorSessionDuration(),
        local: this.editorModality() !== Modality.REMOTE ? this.editorLocal() : undefined,
      };

      if (!this.validateHonorsBookings(updated)) {
        this.snackbarService.openSnackBar({
          message: 'Esta alteração deixaria sessão(ões) reservada(s) sem disponibilidade. Ajuste mantendo as sessões marcadas.',
        });
        return;
      }

      this.blocks.update(bs => bs.map(b => b.id === existingId ? updated : b));
      this._invalidateSchedulingCache();

      if (this.hasBookings(existing)) {
        this._syncBookedBlock(existing, updated, existingId);
      } else {
        this._deleteAndRecreateBlock(existing, updated, existingId);
      }
    } else {
      if (this.previewBlocks().some(p => p.hasConflict)) {
        this.snackbarService.openSnackBar({
          message: 'Existe um conflito de horário. Resolva os conflitos antes de guardar.',
        });
        return;
      }

      this._invalidateSchedulingCache();
      if (isRecurring) {
        [...this.selectedWeekdays()].forEach(wd => this.createSingleBlock(selectedSvcs, true, wd));
        this.resetEditor();
      } else {
        this.createSingleBlock(selectedSvcs, false, undefined, this.editorDate());
      }
    }

    this.closeSheet();
  }

  removeBlock(): void {
    const id = this.selectedBlockId();
    if (id === null) return;
    const block = this.blocks().find(b => b.id === id);
    if (block && this.hasBookings(block)) return;

    this.confirmDelete(() => {
      this.blocks.update(bs => bs.filter(b => b.id !== id));
      this._invalidateSchedulingCache();
      this.resetEditor();
      this.closeSheet();

      if (block && block.backendSlots.length > 0) {
        const deleteOps = block.backendSlots.map(s => this.apiService.deleteAvailability(s.backendId));
        forkJoin(deleteOps).subscribe({
          error: (e) => {
            console.error('deleteAvailability error', e);
            if (block) this.blocks.update(bs => [...bs, block]);
          },
        });
      }
    });
  }

  private confirmDelete(onConfirm: () => void): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      panelClass: 'care-dialog',
      data: {
        message: 'Deseja realmente excluir este(s) horário(s)? Essa ação não poderá ser desfeita.',
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) onConfirm();
    });
  }

  // ─ Private helpers ──────────────────────────────────────────────────────────

  startResize(event: PointerEvent, block: TherapistBlock, rowH = ROW_H): void {
    event.preventDefault();
    event.stopPropagation();

    const handle = event.currentTarget as HTMLElement;
    const colEl = (handle.closest('.daycol') ?? handle.closest('.m-tl')) as HTMLElement | null;
    if (!colEl) return;

    this._resizeBlock = block;
    this._resizeColEl = colEl;
    this._resizeRowH = rowH;
    this._resizeDragged = false;
    this.resizingBlockId.set(block.id);
    this.resizeLiveEndTime.set(block.endTime);

    handle.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent) => {
      if (!this._resizeBlock || !this._resizeColEl) return;
      const rect = this._resizeColEl.getBoundingClientRect();
      const endMinRaw = ((e.clientY - rect.top + 3) / this._resizeRowH + 8) * 60;
      const dur = this._resizeBlock.sessionDuration;
      const startMin = timeToMin(this._resizeBlock.startTime);
      const sessions = Math.max(1, Math.round((endMinRaw - startMin) / dur));
      const snapped = startMin + sessions * dur;
      const floorMin = this.lastBookedEndMin(this._resizeBlock) ?? (startMin + dur);
      const clamped = Math.max(floorMin, Math.min(20 * 60, snapped));
      const next = minToTime(clamped);
      if (next !== this.resizeLiveEndTime()) {
        this._resizeDragged = true;
        this.resizeLiveEndTime.set(next);
      }
    };

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);

      const b = this._resizeBlock;
      const newEnd = this.resizeLiveEndTime();
      const dragged = this._resizeDragged;

      this.resizingBlockId.set(null);
      this._resizeBlock = null;
      this._resizeColEl = null;
      this._resizeDragged = false;

      if (!b || !dragged || newEnd === b.endTime) return;

      // Swallow the synthetic click the browser fires after pointerup
      document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });

      const updated = { ...b, endTime: newEnd };
      this.blocks.update(bs => bs.map(bl => bl.id === b.id ? updated : bl));
      if (this.selectedBlockId() === b.id) this.editorEndTime.set(newEnd);

      if (b.backendSlots.length > 0) {
        const dur = b.sessionDuration;
        const oldEndMin = timeToMin(b.endTime);
        const newEndMin = timeToMin(newEnd);
        const date = b.isRecurring && b.weekdays[0]
          ? this.dateForWeekday(b.weekdays[0])
          : (b.startDate ?? '');

        if (newEndMin > oldEndMin) {
          const newSlotTimes = generateSlots(b.endTime, newEnd, dur);
          const createOps = newSlotTimes.map(t =>
            this.apiService.createAvailability(this.buildSlotPayload(
              b.services, b.modality, b.isRecurring, date, t, minToTime(timeToMin(t) + dur),
            ))
          );
          forkJoin(createOps).subscribe({
            next: (results) => {
              const newSlots: BackendSlot[] = results.map((res, i) => ({
                slotTime: newSlotTimes[i], backendId: res.id, isBooked: false,
              }));
              this.blocks.update(bs => bs.map(bl =>
                bl.id === b.id ? { ...bl, backendSlots: [...bl.backendSlots, ...newSlots] } : bl,
              ));
              this._invalidateSchedulingCache();
            },
            error: () => this.blocks.update(bs => bs.map(bl => bl.id === b.id ? b : bl)),
          });
        } else if (newEndMin < oldEndMin) {
          const targetCount = generateSlots(b.startTime, newEnd, dur).length;
          const slotsToRemove = b.backendSlots.slice(targetCount);
          if (slotsToRemove.length > 0) {
            const deleteOps = slotsToRemove.map(s => this.apiService.deleteAvailability(s.backendId));
            forkJoin(deleteOps).subscribe({
              next: () => {
                this.blocks.update(bs => bs.map(bl =>
                  bl.id === b.id ? { ...bl, backendSlots: bl.backendSlots.slice(0, targetCount) } : bl,
                ));
                this._invalidateSchedulingCache();
              },
              error: () => this.blocks.update(bs => bs.map(bl => bl.id === b.id ? b : bl)),
            });
          }
        }
      }
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  startResizeTop(event: PointerEvent, block: TherapistBlock, rowH = ROW_H): void {
    event.preventDefault();
    event.stopPropagation();

    const handle = event.currentTarget as HTMLElement;
    const colEl = (handle.closest('.daycol') ?? handle.closest('.m-tl')) as HTMLElement | null;
    if (!colEl) return;

    this._resizeTopBlock = block;
    this._resizeTopColEl = colEl;
    this._resizeTopRowH = rowH;
    this._resizeTopDragged = false;
    this.resizingTopBlockId.set(block.id);
    this.resizeLiveStartTime.set(block.startTime);

    handle.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent) => {
      if (!this._resizeTopBlock || !this._resizeTopColEl) return;
      const rect = this._resizeTopColEl.getBoundingClientRect();
      const startMinRaw = ((e.clientY - rect.top) / this._resizeTopRowH + 8) * 60;
      const dur = this._resizeTopBlock.sessionDuration;
      const endMin = timeToMin(this._resizeTopBlock.endTime);
      const sessions = Math.max(1, Math.round((endMin - startMinRaw) / dur));
      const snapped = endMin - sessions * dur;
      const ceilMin = this.firstBookedStartMin(this._resizeTopBlock)
        ?? (timeToMin(this._resizeTopBlock.endTime) - dur);
      const clamped = Math.max(8 * 60, Math.min(ceilMin, snapped));
      const next = minToTime(clamped);
      if (next !== this.resizeLiveStartTime()) {
        this._resizeTopDragged = true;
        this.resizeLiveStartTime.set(next);
      }
    };

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);

      const b = this._resizeTopBlock;
      const newStart = this.resizeLiveStartTime();
      const dragged = this._resizeTopDragged;

      this.resizingTopBlockId.set(null);
      this._resizeTopBlock = null;
      this._resizeTopColEl = null;
      this._resizeTopDragged = false;

      if (!b || !dragged || newStart === b.startTime) return;

      document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });

      const updated = { ...b, startTime: newStart };
      this.blocks.update(bs => bs.map(bl => bl.id === b.id ? updated : bl));
      if (this.selectedBlockId() === b.id) this.editorStartTime.set(newStart);

      if (b.backendSlots.length > 0) {
        const dur = b.sessionDuration;
        const oldStartMin = timeToMin(b.startTime);
        const newStartMin = timeToMin(newStart);
        const date = b.isRecurring && b.weekdays[0]
          ? this.dateForWeekday(b.weekdays[0])
          : (b.startDate ?? '');

        if (newStartMin < oldStartMin) {
          // Expanding upward: prepend new free slots
          const newSlotTimes = generateSlots(newStart, b.startTime, dur);
          const createOps = newSlotTimes.map(t =>
            this.apiService.createAvailability(this.buildSlotPayload(
              b.services, b.modality, b.isRecurring, date, t, minToTime(timeToMin(t) + dur),
            ))
          );
          forkJoin(createOps).subscribe({
            next: (results) => {
              const newSlots: BackendSlot[] = results.map((res, i) => ({
                slotTime: newSlotTimes[i], backendId: res.id, isBooked: false,
              }));
              this.blocks.update(bs => bs.map(bl =>
                bl.id === b.id ? { ...bl, backendSlots: [...newSlots, ...bl.backendSlots] } : bl,
              ));
              this._invalidateSchedulingCache();
            },
            error: () => this.blocks.update(bs => bs.map(bl => bl.id === b.id ? b : bl)),
          });
        } else if (newStartMin > oldStartMin) {
          // Shrinking from top: delete leading free slots
          const removeCount = generateSlots(b.startTime, newStart, dur).length;
          const leading = b.backendSlots.slice(0, removeCount);
          if (leading.length > 0) {
            const deleteOps = leading.map(s => this.apiService.deleteAvailability(s.backendId));
            forkJoin(deleteOps).subscribe({
              next: () => {
                this.blocks.update(bs => bs.map(bl =>
                  bl.id === b.id ? { ...bl, backendSlots: bl.backendSlots.slice(removeCount) } : bl,
                ));
                this._invalidateSchedulingCache();
              },
              error: () => this.blocks.update(bs => bs.map(bl => bl.id === b.id ? b : bl)),
            });
          }
        }
      }
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  startPreviewMove(event: PointerEvent, preview: PreviewBlock, colIndex: number): void {
    if ((event.target as HTMLElement).closest('.b-resize-handle')) return;

    const blockEl = event.currentTarget as HTMLElement;
    const daycol = blockEl.parentElement as HTMLElement;
    const weekGrid = daycol.parentElement as HTMLElement;

    const colEls = Array.from(weekGrid.querySelectorAll<HTMLElement>('.daycol'));
    const colRects = colEls.map(el => el.getBoundingClientRect());
    const colTopY = colRects[colIndex].top;

    const blockRect = blockEl.getBoundingClientRect();
    const grabOffsetMin = Math.max(0, (event.clientY - blockRect.top) / ROW_H * 60);
    const durationMin = timeToMin(preview.endTime) - timeToMin(preview.startTime);

    this.isMovingPreview.set(true);
    this.previewMoveLiveStart.set(preview.startTime);
    this.previewMoveLiveEnd.set(preview.endTime);
    this.previewMoveLiveCol.set(colIndex);

    let moved = false;

    blockEl.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent) => {
      moved = true;

      let newCol = colIndex;
      for (let i = 0; i < colRects.length; i++) {
        if (e.clientX >= colRects[i].left && e.clientX < colRects[i].right) { newCol = i; break; }
      }
      if (e.clientX < colRects[0].left) newCol = 0;
      if (e.clientX >= colRects[colRects.length - 1].right) newCol = colRects.length - 1;

      const anchoredStart = (e.clientY - colTopY) / ROW_H * 60 + 8 * 60 - grabOffsetMin;
      const snapped = Math.round(anchoredStart / 30) * 30;
      const clampedStart = Math.max(8 * 60, Math.min(20 * 60 - durationMin, snapped));

      this.previewMoveLiveCol.set(newCol);
      this.previewMoveLiveStart.set(minToTime(clampedStart));
      this.previewMoveLiveEnd.set(minToTime(clampedStart + durationMin));
    };

    const onUp = () => {
      blockEl.removeEventListener('pointermove', onMove);
      blockEl.removeEventListener('pointerup', onUp);
      blockEl.removeEventListener('pointercancel', onUp);

      const newStart = this.previewMoveLiveStart();
      const newEnd = this.previewMoveLiveEnd();
      const newCol = this.previewMoveLiveCol();

      this.isMovingPreview.set(false);

      if (!moved) return;

      document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });

      this.editorStartTime.set(newStart);
      this.editorEndTime.set(newEnd);

      const newDow = COL_TO_DOW[newCol];
      if (this.editorFrequency() === 'weekly') {
        this.selectedWeekdays.set(new Set([newDow]));
      } else {
        this.editorDate.set(toKey(this.weekDays()[newCol]));
      }
    };

    blockEl.addEventListener('pointermove', onMove);
    blockEl.addEventListener('pointerup', onUp);
    blockEl.addEventListener('pointercancel', onUp);
  }

  startPreviewResize(event: PointerEvent, preview: PreviewBlock, rowH = ROW_H): void {
    event.preventDefault();
    event.stopPropagation();

    const handle = event.currentTarget as HTMLElement;
    const colEl = (handle.closest('.daycol') ?? handle.closest('.m-tl')) as HTMLElement | null;
    if (!colEl) return;

    let dragged = false;

    handle.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent) => {
      const rect = colEl.getBoundingClientRect();
      const endMinRaw = ((e.clientY - rect.top + 3) / rowH + 8) * 60;
      const dur = this.editorSessionDuration();
      const startMin = timeToMin(preview.startTime);
      const sessions = Math.max(1, Math.round((endMinRaw - startMin) / dur));
      const snapped = startMin + sessions * dur;
      const clamped = Math.max(startMin + dur, Math.min(20 * 60, snapped));
      const next = minToTime(clamped);
      if (next !== this.editorEndTime()) {
        dragged = true;
        this.editorEndTime.set(next);
      }
    };

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      if (dragged) {
        document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });
      }
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  private createSingleBlock(
    services: ProfessionalService[],
    isRecurring: boolean,
    weekday?: DayOfWeek,
    startDate?: string,
  ): void {
    const tempId = ++this._nextId;
    const date = isRecurring && weekday ? this.dateForWeekday(weekday) : (startDate ?? '');
    const dur = this.editorSessionDuration();
    const slotTimes = generateSlots(this.editorStartTime(), this.editorEndTime(), dur);

    const tempBlock: TherapistBlock = {
      id: tempId,
      backendSlots: slotTimes.map(t => ({ slotTime: t, backendId: -1, isBooked: false })),
      services,
      modality: this.editorModality(),
      isRecurring,
      weekdays: isRecurring && weekday ? [weekday] : [],
      startDate: isRecurring ? undefined : date,
      startTime: this.editorStartTime(),
      endTime: this.editorEndTime(),
      sessionDuration: dur,
      local: this.editorModality() !== Modality.REMOTE ? this.editorLocal() : undefined,
    };

    this.blocks.update(bs => [...bs, tempBlock]);
    this.selectedBlockId.set(tempId);

    const createOps = slotTimes.map(t =>
      this.apiService.createAvailability(
        this.buildSlotPayload(services, this.editorModality(), isRecurring, date, t, minToTime(timeToMin(t) + dur)),
      )
    );

    forkJoin(createOps).subscribe({
      next: (results) => {
        const newSlots: BackendSlot[] = results.map((res, i) => ({
          slotTime: slotTimes[i], backendId: res.id, isBooked: false,
        }));
        this.blocks.update(bs => bs.map(b =>
          b.id === tempId ? { ...b, backendSlots: newSlots } : b,
        ));
      },
      error: (e) => {
        console.error('createAvailability error', e);
        this.blocks.update(bs => bs.filter(b => b.id !== tempId));
        if (this.selectedBlockId() === tempId) this.selectedBlockId.set(null);
      },
    });
  }

  private buildSlotPayload(
    services: ProfessionalService[],
    modality: Modality,
    isRecurring: boolean,
    date: string,
    slotStart: string,
    slotEnd: string,
  ): AvailabilityPayload {
    return {
      professionalServiceIds: services.map(s => s.id),
      startDate: date,
      startTime: slotStart,
      endTime: slotEnd,
      isRecurring,
      modality: toBackendModality(modality),
    };
  }

  private dateForWeekday(wd: DayOfWeek): string {
    const colIdx = COL_TO_DOW.indexOf(wd);
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + colIdx);
    return toKey(d);
  }

  private groupAvailabilitiesIntoBlocks(avails: AvailabilityModel[]): TherapistBlock[] {
    if (avails.length === 0) return [];

    const sorted = [...avails].sort((a, b) => {
      const gA = a.isRecurring ? `R-${a.dayOfWeek}` : `S-${a.startDate}`;
      const gB = b.isRecurring ? `R-${b.dayOfWeek}` : `S-${b.startDate}`;
      const gc = gA.localeCompare(gB);
      return gc !== 0 ? gc : a.startTime.localeCompare(b.startTime);
    });

    const blocks: TherapistBlock[] = [];
    let group: AvailabilityModel[] = [];

    const flush = () => {
      if (group.length > 0) { blocks.push(this._avGroupToBlock(group)); group = []; }
    };

    for (const av of sorted) {
      if (group.length === 0) {
        group.push(av);
      } else {
        const last = group[group.length - 1];
        const sameDay = av.isRecurring === last.isRecurring &&
          (av.isRecurring ? av.dayOfWeek === last.dayOfWeek : av.startDate === last.startDate);
        const sameModality = normalizeModality(av.modality) === normalizeModality(last.modality);
        if (sameDay && sameModality && av.startTime === last.endTime && this._sameServiceSet(av.services, last.services)) {
          group.push(av);
        } else {
          flush();
          group.push(av);
        }
      }
    }
    flush();
    return blocks;
  }

  private _avGroupToBlock(avails: AvailabilityModel[]): TherapistBlock {
    const first = avails[0];
    const last = avails[avails.length - 1];
    const firstStart = stripSec(first.startTime);
    const firstEnd = stripSec(first.endTime);
    const slotDurMin = timeToMin(firstEnd) - timeToMin(firstStart);
    const sessionDuration = (slotDurMin === 30 ? 30 : slotDurMin === 90 ? 90 : 60) as 30 | 60 | 90;
    const dow = BACKEND_DOW_MAP[first.dayOfWeek as unknown as string] ?? DayOfWeek.MONDAY;
    return {
      id: ++this._nextId,
      backendSlots: avails.map(a => ({ slotTime: stripSec(a.startTime), backendId: a.id, isBooked: a.isBooked })),
      services: first.services,
      modality: first.modality ? normalizeModality(first.modality) : this.deriveModality(first.services),
      isRecurring: first.isRecurring,
      weekdays: first.isRecurring ? [dow] : [],
      startDate: first.isRecurring ? undefined : first.startDate,
      startTime: firstStart,
      endTime: stripSec(last.endTime),
      sessionDuration,
    };
  }

  private _invalidateSchedulingCache(): void {
    this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_SERVICE].setValue(null);
    this.schedulingService.clearChainedRelatedFields(SchedulingSteps.SERVICE_SELECTION);
  }

  private _sameServiceSet(a: ProfessionalService[], b: ProfessionalService[]): boolean {
    if (a.length !== b.length) return false;
    const ids = new Set(a.map(s => s.id));
    return b.every(s => ids.has(s.id));
  }

  private _syncBookedBlock(existing: TherapistBlock, updated: TherapistBlock, blockId: number): void {
    const dur = updated.sessionDuration;
    const date = updated.isRecurring && updated.weekdays[0]
      ? this.dateForWeekday(updated.weekdays[0])
      : (updated.startDate ?? '');

    const updateOps = existing.backendSlots.map(s =>
      this.apiService.updateAvailability(s.backendId, this.buildSlotPayload(
        updated.services, updated.modality, updated.isRecurring, date, s.slotTime, minToTime(timeToMin(s.slotTime) + dur),
      ))
    );
    if (updateOps.length > 0) {
      forkJoin(updateOps).subscribe({
        error: () => this.blocks.update(bs => bs.map(b => b.id === blockId ? existing : b)),
      });
    }

    const oldEndMin = timeToMin(existing.endTime);
    const newEndMin = timeToMin(updated.endTime);
    if (newEndMin > oldEndMin) {
      const newSlotTimes = generateSlots(existing.endTime, updated.endTime, dur);
      const createOps = newSlotTimes.map(t =>
        this.apiService.createAvailability(this.buildSlotPayload(
          updated.services, updated.modality, updated.isRecurring, date, t, minToTime(timeToMin(t) + dur),
        ))
      );
      forkJoin(createOps).subscribe({
        next: (results) => {
          const newSlots: BackendSlot[] = results.map((res, i) => ({
            slotTime: newSlotTimes[i], backendId: res.id, isBooked: false,
          }));
          this.blocks.update(bs => bs.map(b =>
            b.id === blockId ? { ...b, backendSlots: [...b.backendSlots, ...newSlots] } : b,
          ));
        },
      });
    }
  }

  private _deleteAndRecreateBlock(existing: TherapistBlock, updated: TherapistBlock, blockId: number): void {
    const dur = updated.sessionDuration;
    const date = updated.isRecurring && updated.weekdays[0]
      ? this.dateForWeekday(updated.weekdays[0])
      : (updated.startDate ?? '');
    const slotTimes = generateSlots(updated.startTime, updated.endTime, dur);

    const deleteOps = existing.backendSlots.map(s => this.apiService.deleteAvailability(s.backendId));
    (deleteOps.length > 0 ? forkJoin(deleteOps) : of([])).subscribe({
      next: () => {
        if (slotTimes.length === 0) return;
        const createOps = slotTimes.map(t =>
          this.apiService.createAvailability(this.buildSlotPayload(
            updated.services, updated.modality, updated.isRecurring, date, t, minToTime(timeToMin(t) + dur),
          ))
        );
        forkJoin(createOps).subscribe({
          next: (results) => {
            const newSlots: BackendSlot[] = results.map((res, i) => ({
              slotTime: slotTimes[i], backendId: res.id, isBooked: false,
            }));
            this.blocks.update(bs => bs.map(b =>
              b.id === blockId ? { ...b, backendSlots: newSlots } : b,
            ));
          },
          error: () => this.blocks.update(bs => bs.map(b => b.id === blockId ? existing : b)),
        });
      },
      error: () => this.blocks.update(bs => bs.map(b => b.id === blockId ? existing : b)),
    });
  }

  private deriveModality(services: ProfessionalService[]): Modality {
    if (!services?.length) return Modality.ANY;
    const mods = services.map(s => String(s.modality));
    const hasLocal = mods.some(m => m === 'LOCAL' || m === 'Presencial');
    const hasRemote = mods.some(m => m === 'REMOTE' || m === 'Remoto');
    if (hasLocal && !hasRemote) return Modality.LOCAL;
    if (!hasLocal && hasRemote) return Modality.REMOTE;
    return Modality.ANY;
  }

  // ─ Appointment / slot helpers ────────────────────────────────────────────────

  appointmentsForBlock(block: TherapistBlock): Appointment[] {
    const backendIds = new Set(block.backendSlots.filter(s => s.backendId > 0).map(s => s.backendId));
    return this.appointments().filter(a => {
      if (backendIds.size > 0 && backendIds.has(a.availabilityId)) return true;
      // Legacy fallback: match by day/time range
      const sameDay = block.isRecurring
        ? (a.isRecurring && BACKEND_DOW_MAP[a.dayOfWeek as unknown as string] === block.weekdays[0])
        : (a.startDate === block.startDate);
      return sameDay && a.startTime >= block.startTime && a.startTime < block.endTime;
    });
  }

  bookedSlotsForBlock(block: TherapistBlock): SlotInfo[] {
    const slots = generateSlots(block.startTime, block.endTime, block.sessionDuration);
    // Per-slot mode: one backendSlot per generated slot
    if (block.backendSlots.length === slots.length && block.backendSlots.every(s => s.backendId > 0)) {
      return block.backendSlots.map((s, i) => {
        const appointment = this.appointments().find(a => a.availabilityId === s.backendId);
        return { time: s.slotTime, booked: s.isBooked || !!appointment, appointment };
      });
    }
    // Legacy/transition mode: match appointments by slot start time
    const appts = this.appointmentsForBlock(block);
    return slots.map(time => {
      const appointment = appts.find(a => a.startTime === time);
      return { time, booked: !!appointment, appointment };
    });
  }

  bookedCount(block: TherapistBlock): number {
    return this.bookedSlotsForBlock(block).filter(s => s.booked).length;
  }

  hasBookings(block: TherapistBlock): boolean {
    return this.bookedCount(block) > 0;
  }

  lastBookedEndMin(block: TherapistBlock): number | null {
    const booked = this.bookedSlotsForBlock(block).filter(s => s.booked);
    if (booked.length === 0) return null;
    const lastStart = Math.max(...booked.map(s => timeToMin(s.time)));
    return lastStart + block.sessionDuration;
  }

  firstBookedStartMin(block: TherapistBlock): number | null {
    const booked = this.bookedSlotsForBlock(block).filter(s => s.booked);
    if (booked.length === 0) return null;
    return Math.min(...booked.map(s => timeToMin(s.time)));
  }

  canResizeTop(block: TherapistBlock): boolean {
    const slots = this.bookedSlotsForBlock(block);
    return slots.length > 0 && !slots[0].booked;
  }

  blockResizeTopPx(block: TherapistBlock, liveStartTime: string, rowH = ROW_H): number {
    return hourRowIdx(liveStartTime) * rowH + 3;
  }

  blockResizeTopHeightPx(block: TherapistBlock, liveStartTime: string, rowH = ROW_H): number {
    return (hourRowIdx(block.endTime) - hourRowIdx(liveStartTime)) * rowH - 6;
  }

  blockIsDense(block: TherapistBlock, rowH = ROW_H): boolean {
    const height = this.blockHeightPx(block, rowH);
    const slotCount = this.blockSlotCount(block);
    return slotCount > 0 && (height / slotCount) < 30;
  }

  resizeFloorHeightPx(block: TherapistBlock, liveEndTime: string, rowH = ROW_H): number {
    const floor = this.lastBookedEndMin(block);
    if (floor === null) return 0;
    const liveEndMin = timeToMin(liveEndTime);
    return Math.max(0, (liveEndMin - floor)) / 60 * rowH;
  }

  slotServiceName(appt: Appointment): string {
    const svc = this.services().find(s => s.id === appt.professionalServiceId);
    return svc ? this.serviceDisplayName(svc.name) : '';
  }

  slotPatientName(appt: Appointment): string {
    return appt.clientName ?? `Paciente #${appt.clientId}`;
  }

  slotPatientFirstName(appt: Appointment): string {
    return this.slotPatientName(appt).split(' ')[0];
  }

  slotPatientInitials(appt: Appointment): string {
    return this.slotPatientName(appt)
      .split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  }

  patientAvatarClass(idx: number): string {
    return `c${idx % 4}`;
  }

  bookedSvcIds(block: TherapistBlock): Set<number> {
    return new Set(this.appointmentsForBlock(block).map(a => a.professionalServiceId));
  }

  bookedModalityFixed(block: TherapistBlock): boolean {
    return this.appointmentsForBlock(block).some(a => {
      const m = String(a.modality);
      return m === 'LOCAL' || m === 'Presencial' || m === 'REMOTE' || m === 'Remoto';
    });
  }

  apptModalityLabel(appt: Appointment): string {
    const m = String(appt.modality);
    if (m === 'LOCAL' || m === 'Presencial') return 'presencial';
    if (m === 'REMOTE' || m === 'Remoto') return 'remoto';
    return '';
  }

  apptModalityDisplay(appt: Appointment): string {
    const m = String(appt.modality);
    if (m === 'LOCAL' || m === 'Presencial') return 'Presencial';
    if (m === 'REMOTE' || m === 'Remoto') return 'Remoto';
    return 'Qualquer';
  }

  apptDateLabel(appt: Appointment): string {
    if (appt.isRecurring) {
      const dow = BACKEND_DOW_MAP[appt.dayOfWeek as unknown as string];
      const idx = COL_TO_DOW.indexOf(dow);
      const day = idx >= 0 ? PT_DOW_LONG[idx] : '';
      return day.charAt(0).toUpperCase() + day.slice(1);
    }
    if (appt.startDate) {
      const d = new Date(appt.startDate + 'T00:00:00');
      const dow = PT_DOW_LONG[(d.getDay() + 6) % 7];
      return `${dow.charAt(0).toUpperCase() + dow.slice(1)}, ${d.getDate()} ${PT_MONTHS[d.getMonth()]}`;
    }
    return '';
  }

  selectSlot(event: Event, appt: Appointment): void {
    event.stopPropagation();
    this.selectedAppointment.set(appt);
  }

  clearSelectedAppointment(): void {
    this.selectedAppointment.set(null);
  }

  cancelAppointment(appt: Appointment): void {
    this.confirmDelete(() => this._doCancelAppointment(appt));
  }

  private _doCancelAppointment(appt: Appointment): void {
    this.apiService.deleteAppointment(appt.id).subscribe({
      next: () => {
        this.appointments.update(list => list.filter(a => a.id !== appt.id));
        this.blocks.update(bs => bs.map(b => ({
          ...b,
          backendSlots: b.backendSlots.map(s =>
            s.backendId === appt.availabilityId ? { ...s, isBooked: false } : s,
          ),
        })));
        this.selectedAppointment.set(null);
        this.snackbarService.openSnackBar({ message: 'Sessão cancelada com sucesso.' });
      },
      error: () => {
        this.snackbarService.openSnackBar({ message: 'Erro ao cancelar a sessão. Tente novamente.' });
      },
    });
  }

  removeSlot(event: Event, block: TherapistBlock, slotIndex: number): void {
    event.stopPropagation();
    const slot = block.backendSlots[slotIndex];
    if (!slot || slot.isBooked) return;

    this.confirmDelete(() => this._doRemoveSlot(block, slotIndex, slot));
  }

  private _doRemoveSlot(block: TherapistBlock, slotIndex: number, slot: BackendSlot): void {
    this.apiService.deleteAvailability(slot.backendId).subscribe({
      next: () => {
        this._invalidateSchedulingCache();
        const remaining = block.backendSlots.filter((_, i) => i !== slotIndex);

        if (remaining.length === 0) {
          this.blocks.update(bs => bs.filter(b => b.id !== block.id));
          if (this.selectedBlockId() === block.id) this.resetEditor();
          return;
        }

        // Group remaining slots into contiguous runs (gap = not consecutive by duration)
        const dur = block.sessionDuration;
        const groups: BackendSlot[][] = [];
        let current: BackendSlot[] = [remaining[0]];
        for (let i = 1; i < remaining.length; i++) {
          const gap = timeToMin(remaining[i].slotTime) - timeToMin(remaining[i - 1].slotTime);
          if (gap === dur) {
            current.push(remaining[i]);
          } else {
            groups.push(current);
            current = [remaining[i]];
          }
        }
        groups.push(current);

        if (groups.length === 1) {
          // Slot was at start or end — just shrink the block
          const newSlots = groups[0];
          const newStart = newSlots[0].slotTime;
          const newEnd = minToTime(timeToMin(newSlots[newSlots.length - 1].slotTime) + dur);
          this.blocks.update(bs => bs.map(b => b.id === block.id
            ? { ...b, startTime: newStart, endTime: newEnd, backendSlots: newSlots }
            : b,
          ));
          if (this.selectedBlockId() === block.id) {
            this.editorStartTime.set(newStart);
            this.editorEndTime.set(newEnd);
          }
        } else {
          // Slot was in the middle — split into multiple blocks
          const newBlocks: TherapistBlock[] = groups.map(group => ({
            ...block,
            id: ++this._nextId,
            startTime: group[0].slotTime,
            endTime: minToTime(timeToMin(group[group.length - 1].slotTime) + dur),
            backendSlots: group,
          }));
          this.blocks.update(bs => [
            ...bs.filter(b => b.id !== block.id),
            ...newBlocks,
          ]);
          // Close editor so both resulting blocks are visible on the calendar
          if (this.selectedBlockId() === block.id) {
            this.resetEditor();
          }
        }
        this.snackbarService.openSnackBar({ message: 'Horário removido.' });
      },
      error: () => {
        this.snackbarService.openSnackBar({ message: 'Erro ao remover o horário. Tente novamente.' });
      },
    });
  }

  rescheduleAppointment(): void {
    this.snackbarService.openSnackBar({ message: 'Funcionalidade em construção.' });
  }

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

  // ─ Mobile sheet ─────────────────────────────────────────────────────────────

  openSheet(): void {
    this.resetEditor();
    this.selectedServiceIds.set(new Set(this.services().map(s => s.id)));
    const dow = COL_TO_DOW[this.selectedDayIndex()];
    this.selectedWeekdays.set(new Set([dow]));
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  selectDay(index: number): void {
    this.selectedDayIndex.set(index);
  }

  // ─ Utilities ────────────────────────────────────────────────────────────────

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  hasBlocks(colIndex: number): boolean {
    return this.blocksForColumn(colIndex).length > 0;
  }

  userInitials(): string {
    const user = this.sessionService.user();
    if (!user?.name) return 'LB';
    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  mobileDayLabel(): string {
    const days = this.weekDays();
    const idx = this.selectedDayIndex();
    const d = days[idx];
    if (!d) return '';
    const dow = PT_DOW_LONG[idx];
    const day = d.getDate();
    const month = PT_MONTHS[d.getMonth()];
    return `${dow.charAt(0).toUpperCase() + dow.slice(1)}, ${day} de ${month}`;
  }

  mobileDayBlocks(): TherapistBlock[] {
    return this.blocksForColumn(this.selectedDayIndex());
  }

  private _todayColumnIndex(): number {
    const today = new Date();
    const dow = today.getDay(); // 0=Sun
    return dow === 0 ? 6 : dow - 1; // Mon=0…Sun=6
  }
}
