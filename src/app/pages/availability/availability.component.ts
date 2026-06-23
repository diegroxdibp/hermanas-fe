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
const HOURS = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00',
];
const HOURS_END = [...HOURS, '20:00'];
const ROW_H = 52;
const MOB_ROW_H = 46;
const COL_TO_DOW: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];
const SESSION_DURATIONS = [50, 60, 90] as const;
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
  sessionDuration: 50 | 60 | 90;
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
  readonly screenSize = inject(ScreenSizeService);
  private readonly sessionService = inject(SessionService);

  // ─ Expose to template
  readonly HOURS = HOURS;
  readonly HOURS_END = HOURS_END;
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
  editorSessionDuration = signal<50 | 60 | 90>(60);
  editorLocal = signal<string>('Consultório · R. da Misericórdia 53');

  // ─ Mobile
  selectedDayIndex = signal<number>(this._todayColumnIndex());
  sheetOpen = signal<boolean>(false);

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

  readonly editorTitle = computed<string>(() => {
    if (this.editorFrequency() === 'weekly') {
      const wds = [...this.selectedWeekdays()];
      if (wds.length === 0) return 'Novo bloco';
      const idx = COL_TO_DOW.indexOf(wds[0]);
      const name = idx >= 0 ? PT_DOW_LONG[idx] : wds[0].toLowerCase();
      return wds.length === 1
        ? `Bloco de ${name}`
        : `Bloco de ${wds.length} dias`;
    } else {
      if (!this.editorDate()) return 'Novo bloco';
      const d = new Date(this.editorDate() + 'T00:00:00');
      const dow = PT_DOW_LONG[(d.getDay() + 6) % 7];
      return `Bloco de ${dow}`;
    }
  });

  readonly editorSubtitle = computed<string>(() => {
    if (this.editorFrequency() === 'weekly') {
      const wds = [...this.selectedWeekdays()];
      if (wds.length === 0) return 'Semanal';
      return wds.map(wd => {
        const idx = COL_TO_DOW.indexOf(wd);
        return PT_DOW_SHORT[idx >= 0 ? idx : 0];
      }).join(', ');
    } else {
      if (!this.editorDate()) return 'Data única';
      const d = new Date(this.editorDate() + 'T00:00:00');
      const day = d.getDate();
      const month = PT_MONTHS[d.getMonth()];
      const year = d.getFullYear();
      return `${day} de ${month} · ${year}`;
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

  goToToday(): void {
    this.weekStart.set(getWeekStart(new Date()));
  }

  prevWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
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

  blockServiceLabel(block: TherapistBlock): string {
    if (block.services.length === 0) return '';
    if (block.services.length === 1) return block.services[0].name;
    return `${block.services[0].name} +${block.services.length - 1}`;
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

  openNewBlock(dayIndex: number, hourIndex: number): void {
    this.resetEditor();
    const dow = COL_TO_DOW[dayIndex];
    this.selectedWeekdays.set(new Set([dow]));
    this.editorFrequency.set('weekly');
    const startTime = HOURS[hourIndex] ?? '09:00';
    const endHourIdx = Math.min(hourIndex + 2, HOURS.length - 1);
    const endTime = HOURS[endHourIdx] ?? '11:00';
    this.editorStartTime.set(startTime);
    this.editorEndTime.set(endTime);
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
    const isRecurring = this.editorFrequency() === 'weekly';
    const existingId = this.selectedBlockId();

    if (existingId !== null) {
      const existing = this.blocks().find(b => b.id === existingId);
      if (!existing || existing.backendId === null) return;

      const payload = this.buildPayload(
        selectedSvcs, isRecurring, existing.weekdays[0], existing.startDate,
      );
      const updated: TherapistBlock = {
        ...existing,
        services: selectedSvcs,
        modality: this.editorModality(),
        isRecurring,
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
      if (isRecurring) {
        [...this.selectedWeekdays()].forEach(wd => this.createSingleBlock(selectedSvcs, true, wd));
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
          b.id === tempId ? { ...b, id: res.id, backendId: res.id } : b,
        ));
        this.selectedBlockId.set(res.id);
      },
      error: (e) => {
        console.error('createAvailability error', e);
        this.blocks.update(bs => bs.filter(b => b.id !== tempId));
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
        id: a.id,
        backendId: a.id,
        services: a.services,
        modality: this.deriveModality(a.services),
        isRecurring: a.isRecurring,
        weekdays: a.isRecurring ? [dow] : [],
        startDate: a.isRecurring ? undefined : a.startDate,
        startTime: a.startTime,
        endTime: a.endTime,
        sessionDuration: 60 as const,
      };
    });
  }

  private extractBlockFields(res: AvailabilityModel): Partial<TherapistBlock> {
    const dow = BACKEND_DOW_MAP[res.dayOfWeek as unknown as string] ?? DayOfWeek.MONDAY;
    return {
      backendId: res.id,
      startTime: res.startTime,
      endTime: res.endTime,
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
