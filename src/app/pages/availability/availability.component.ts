import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Modality } from '../../shared/enums/modality.enum';
import { DayOfWeek } from '../../shared/enums/day-of-week.enum';
import { ProfessionalService } from '../../shared/models/professional-service.model';
import { ApiService, AvailabilityPayload } from '../../core/services/api.service';
import { AvailabilityModel } from '../../shared/models/availability.model';
import { ScreenSizeService } from '../../shared/services/screen-size.service';
import { SessionService } from '../../shared/services/session.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
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

interface TherapistBlock {
  id: number;
  backendId: number | null;
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
  readonly screenSize = inject(ScreenSizeService);
  private readonly sessionService = inject(SessionService);

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

  private _nextId = 0;

  blocks = signal<TherapistBlock[]>([]);

  selectedBlockId = signal<number | null>(null);

  // ─ Editor state
  selectedServiceIds = signal<Set<number>>(new Set());
  editorModality = signal<Modality>(Modality.LOCAL);
  editorFrequency = signal<'once' | 'weekly'>('weekly');
  selectedWeekdays = signal<Set<DayOfWeek>>(new Set());
  editorDate = signal<string>('');
  editorStartTime = signal<string>('09:00');
  editorEndTime = signal<string>('13:00');
  editorSessionDuration = signal<30 | 60 | 90>(60);
  editorLocal = signal<string>('Consultório · R. da Misericórdia 53');

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

  readonly movingBlock = computed(() => {
    const id = this.movingBlockId();
    return id !== null ? (this.blocks().find(b => b.id === id) ?? null) : null;
  });

  // ─ Resize
  resizingBlockId = signal<number | null>(null);
  resizeLiveEndTime = signal<string>('');
  private _resizeBlock: TherapistBlock | null = null;
  private _resizeColEl: HTMLElement | null = null;
  private _resizeRowH = ROW_H;
  private _resizeDragged = false;

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
        next: (avails) => this.blocks.set(this.mapAvailabilities(avails)),
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
    };

    const onUp = () => {
      blockEl.removeEventListener('pointermove', onMove);
      blockEl.removeEventListener('pointerup', onUp);
      blockEl.removeEventListener('pointercancel', onUp);

      const newCol = this.moveLiveCol();
      const newStart = this.moveLiveStart();
      const newEnd = this.moveLiveEnd();

      this.movingBlockId.set(null);
      this.isDraggingMove.set(false);

      if (!moved) return;

      document.addEventListener('click', e => e.stopPropagation(), { once: true, capture: true });

      if (newStart === block.startTime && newEnd === block.endTime && newCol === colIndex) return;

      const newWeekday = COL_TO_DOW[newCol];
      const updated: TherapistBlock = { ...block, startTime: newStart, endTime: newEnd, weekdays: [newWeekday] };
      this.blocks.update(bs => bs.map(b => b.id === block.id ? updated : b));

      if (block.backendId !== null) {
        const startDate = block.isRecurring
          ? this.dateForWeekday(newWeekday)
          : (block.startDate ?? '');
        const payload: AvailabilityPayload = {
          professionalServiceIds: block.services.map(s => s.id),
          startDate,
          startTime: newStart,
          endTime: newEnd,
          isRecurring: block.isRecurring,
        };
        this.apiService.updateAvailability(block.backendId, payload).subscribe({
          error: () => this.blocks.update(bs => bs.map(b => b.id === block.id ? block : b)),
        });
      }
    };

    blockEl.addEventListener('pointermove', onMove);
    blockEl.addEventListener('pointerup', onUp);
    blockEl.addEventListener('pointercancel', onUp);
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
      const hi = Math.min(20 * 60, Math.max(anchorMin + minDuration, currentMin));
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
    this.selectedServiceIds.set(new Set());
    this.editorModality.set(Modality.LOCAL);
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

  setEditorSessionDuration(dur: 30 | 60 | 90): void {
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
      if (!existing || existing.backendId === null) return;

      // When converting a recurring block to once, use editorDate as the startDate
      // (recurring blocks have no startDate of their own)
      const effectiveStartDate = !isRecurring
        ? (existing.startDate ?? this.editorDate())
        : existing.startDate;

      const payload = this.buildPayload(
        selectedSvcs, isRecurring, existing.weekdays[0], effectiveStartDate,
      );
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

      this.blocks.update(bs => bs.map(b => b.id === existingId ? updated : b));
      this.apiService.updateAvailability(existing.backendId, payload).subscribe({
        next: (res) => this.blocks.update(bs => bs.map(b =>
          b.id === existingId ? { ...updated, ...this.extractBlockFields(res) } : b,
        )),
        error: (e) => {
          console.error('updateAvailability error', e);
          this.blocks.update(bs => bs.map(b => b.id === existingId ? existing : b));
        },
      });
    } else {
      if (this.previewBlocks().some(p => p.hasConflict)) {
        this.snackbarService.openSnackBar({
          message: 'Existe um conflito de horário. Resolva os conflitos antes de guardar.',
        });
        return;
      }

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
    this.blocks.update(bs => bs.filter(b => b.id !== id));
    this.resetEditor();
    this.closeSheet();

    if (block?.backendId != null) {
      this.apiService.deleteAvailability(block.backendId).subscribe({
        error: (e) => {
          console.error('deleteAvailability error', e);
          if (block) this.blocks.update(bs => [...bs, block]);
        },
      });
    }
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
      const snapped = Math.round(endMinRaw / dur) * dur;
      const startMin = timeToMin(this._resizeBlock.startTime);
      const clamped = Math.max(startMin + dur, Math.min(20 * 60, snapped));
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

      if (b.backendId !== null) {
        const startDate = b.isRecurring && b.weekdays[0]
          ? this.dateForWeekday(b.weekdays[0])
          : (b.startDate ?? '');
        const payload: AvailabilityPayload = {
          professionalServiceIds: b.services.map(s => s.id),
          startDate,
          startTime: b.startTime,
          endTime: newEnd,
          isRecurring: b.isRecurring,
        };
        this.apiService.updateAvailability(b.backendId, payload).subscribe({
          error: () => this.blocks.update(bs => bs.map(bl => bl.id === b.id ? b : bl)),
        });
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
      const snapped = Math.round(endMinRaw / dur) * dur;
      const startMin = timeToMin(preview.startTime);
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

    const tempBlock: TherapistBlock = {
      id: tempId,
      backendId: null,
      services,
      modality: this.editorModality(),
      isRecurring,
      weekdays: isRecurring && weekday ? [weekday] : [],
      startDate: isRecurring ? undefined : date,
      startTime: this.editorStartTime(),
      endTime: this.editorEndTime(),
      sessionDuration: this.editorSessionDuration(),
      local: this.editorModality() !== Modality.REMOTE ? this.editorLocal() : undefined,
    };

    this.blocks.update(bs => [...bs, tempBlock]);
    this.selectedBlockId.set(tempId);

    const payload = this.buildPayload(services, isRecurring, weekday, startDate);
    this.apiService.createAvailability(payload).subscribe({
      next: (res) => {
        this.blocks.update(bs => bs.map(b =>
          b.id === tempId ? { ...b, backendId: res.id } : b,
        ));
      },
      error: (e) => {
        console.error('createAvailability error', e);
        this.blocks.update(bs => bs.filter(b => b.id !== tempId));
        if (this.selectedBlockId() === tempId) this.selectedBlockId.set(null);
      },
    });
  }

  private buildPayload(
    services: ProfessionalService[],
    isRecurring: boolean,
    weekday?: DayOfWeek,
    startDate?: string,
  ): AvailabilityPayload {
    const date = isRecurring && weekday ? this.dateForWeekday(weekday) : (startDate ?? '');
    return {
      professionalServiceIds: services.map(s => s.id),
      startDate: date,
      startTime: this.editorStartTime(),
      endTime: this.editorEndTime(),
      isRecurring,
    };
  }

  private dateForWeekday(wd: DayOfWeek): string {
    const colIdx = COL_TO_DOW.indexOf(wd);
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + colIdx);
    return toKey(d);
  }

  private mapAvailabilities(avails: AvailabilityModel[]): TherapistBlock[] {
    return avails.map(a => {
      const dow = BACKEND_DOW_MAP[a.dayOfWeek as unknown as string] ?? DayOfWeek.MONDAY;
      return {
        id: ++this._nextId,
        backendId: a.id,
        services: a.services,
        modality: this.deriveModality(a.services),
        isRecurring: a.isRecurring,
        weekdays: a.isRecurring ? [dow] : [],
        startDate: a.isRecurring ? undefined : a.startDate,
        startTime: a.startTime.slice(0, 5),
        endTime: a.endTime.slice(0, 5),
        sessionDuration: 60 as const,
      };
    });
  }

  private extractBlockFields(res: AvailabilityModel): Partial<TherapistBlock> {
    const dow = BACKEND_DOW_MAP[res.dayOfWeek as unknown as string] ?? DayOfWeek.MONDAY;
    return {
      backendId: res.id,
      startTime: res.startTime.slice(0, 5),
      endTime: res.endTime.slice(0, 5),
      startDate: res.isRecurring ? undefined : res.startDate,
      weekdays: res.isRecurring ? [dow] : [],
    };
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
