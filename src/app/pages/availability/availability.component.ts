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
import { ApiService } from '../../core/services/api.service';
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

// ─── Model ────────────────────────────────────────────────────────────────────

interface TherapistBlock {
  id: number;
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

// ─── Mock seed services ───────────────────────────────────────────────────────

const MOCK_SERVICES: ProfessionalService[] = [
  { id: 1, name: 'Análise Reichiana', format: 'INDIVIDUAL' as any, modality: 'LOCAL' as any, price: '80', active: true },
  { id: 2, name: 'Mindfulness', format: 'INDIVIDUAL' as any, modality: 'REMOTE' as any, price: '70', active: true },
  { id: 3, name: 'Somatic Experience®', format: 'INDIVIDUAL' as any, modality: 'LOCAL' as any, price: '90', active: true },
  { id: 4, name: 'Supervisão', format: 'GROUP' as any, modality: 'REMOTE' as any, price: '60', active: true },
];

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
  services = signal<ProfessionalService[]>(MOCK_SERVICES);

  private _nextId = 100;

  blocks = signal<TherapistBlock[]>([
    {
      id: 1,
      services: [MOCK_SERVICES[0]],
      modality: Modality.LOCAL,
      isRecurring: true,
      weekdays: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
      startTime: '09:00',
      endTime: '12:00',
      sessionDuration: 60,
      local: 'Consultório · R. da Misericórdia 53',
    },
    {
      id: 2,
      services: [MOCK_SERVICES[1]],
      modality: Modality.REMOTE,
      isRecurring: true,
      weekdays: [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
      startTime: '14:00',
      endTime: '18:00',
      sessionDuration: 60,
    },
    {
      id: 3,
      services: [MOCK_SERVICES[2]],
      modality: Modality.ANY,
      isRecurring: false,
      weekdays: [],
      startDate: toKey(new Date()),
      startTime: '10:00',
      endTime: '12:00',
      sessionDuration: 50,
    },
  ]);

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

  // ─ Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.apiService.getServices().subscribe({
      next: (svcs) => {
        if (svcs && svcs.length > 0) {
          this.services.set(svcs);
        }
      },
      error: () => {
        // Keep mock services on error
      },
    });
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
    const selectedSvcs = this.services().filter(s =>
      this.selectedServiceIds().has(s.id),
    );
    const isRecurring = this.editorFrequency() === 'weekly';

    const block: TherapistBlock = {
      id: this.selectedBlockId() ?? ++this._nextId,
      services: selectedSvcs,
      modality: this.editorModality(),
      isRecurring,
      weekdays: isRecurring ? [...this.selectedWeekdays()] : [],
      startDate: isRecurring ? undefined : this.editorDate(),
      startTime: this.editorStartTime(),
      endTime: this.editorEndTime(),
      sessionDuration: this.editorSessionDuration(),
      local: this.editorModality() !== Modality.REMOTE ? this.editorLocal() : undefined,
    };

    const existingId = this.selectedBlockId();
    if (existingId !== null) {
      this.blocks.update(bs => bs.map(b => (b.id === existingId ? block : b)));
      this.apiService.updateTherapistBlock(existingId, block).subscribe({
        error: (e) => console.error('updateTherapistBlock error', e),
      });
    } else {
      this.blocks.update(bs => [...bs, block]);
      this.apiService.createTherapistBlock(block).subscribe({
        next: (res) => {
          if (res?.id) {
            this.blocks.update(bs =>
              bs.map(b => (b.id === block.id ? { ...b, id: res.id } : b)),
            );
          }
        },
        error: (e) => console.error('createTherapistBlock error', e),
      });
    }

    this.selectedBlockId.set(block.id);
    this.closeSheet();
  }

  removeBlock(): void {
    const id = this.selectedBlockId();
    if (id === null) return;
    this.blocks.update(bs => bs.filter(b => b.id !== id));
    this.apiService.deleteTherapistBlock(id).subscribe({
      error: (e) => console.error('deleteTherapistBlock error', e),
    });
    this.resetEditor();
    this.closeSheet();
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
