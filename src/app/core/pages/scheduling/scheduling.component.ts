import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { take, Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { SchedulingService } from '../../../shared/services/scheduling.service';
import { SchedulingFormControls } from '../../../shared/enums/scheduling-form-controls.enum';
import { SchedulingSteps } from '../../../shared/enums/scheduling-steps.enum';
import { Modality } from '../../../shared/enums/modality.enum';
import { ProfessionalSessionService } from '../../../shared/enums/professional-session-service.enum';
import { AvailabilityModel } from '../../../shared/models/availability.model';
import { Professional } from '../../../shared/models/get-professional-by-service-response.model';
import { ProfessionalService } from '../../../shared/models/professional-service.model';
import { emptyAvailabilityConfiguration } from '../../../shared/models/input-configuration-objects/availability-configuration-object';
import { parseDate, formatTime } from '../../../shared/utils/date-helper.util';

const PT_MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

@Component({
  selector: 'app-scheduling',
  imports: [],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnDestroy {
  private readonly apiService = inject(ApiService);
  readonly schedulingService = inject(SchedulingService);
  private readonly elRef = inject(ElementRef);
  private readonly subs: Subscription[] = [];

  readonly Modality = Modality;
  readonly modalities = Object.values(Modality);
  readonly weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  readonly openDropdown = signal<'service' | 'professional' | 'date' | null>(null);
  readonly calendarViewDate = signal<Date>(new Date());
  readonly expandedSlotId = signal<number | null>(null);
  readonly confirmedSlotId = signal<number | null>(null);
  readonly slotModality = signal<Modality>(Modality.ANY);
  readonly toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly calendarDays = computed(() => {
    const view = this.calendarViewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const days: Array<{ date: Date; inMonth: boolean; key: string }> = [];

    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false, key: this.toKey(d) });
    }

    const total = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= total; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, inMonth: true, key: this.toKey(d) });
    }

    while (days.length < 42) {
      const prev = days[days.length - 1].date;
      const d = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      days.push({ date: d, inMonth: false, key: this.toKey(d) });
    }

    return days;
  });

  readonly monthLabel = computed(() => {
    const d = this.calendarViewDate();
    return `${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });

  constructor() {
    this.apiService.getServices().pipe(take(1)).subscribe((services: ProfessionalService[]) => {
      this.schedulingService.services = services;
    });

    const svcCtrl = this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_SERVICE];
    this.subs.push(svcCtrl.valueChanges.subscribe((svc: ProfessionalService | null) => {
      this.schedulingService.clearChainedRelatedFields(SchedulingSteps.SERVICE_SELECTION);
      this.confirmedSlotId.set(null);
      if (svc?.id) {
        this.apiService.getProfessionalByService(svc.id).pipe(take(1)).subscribe((p: Professional[]) => {
          this.schedulingService.professionals = p;
        });
      }
    }));

    const profCtrl = this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_PROFESSIONAL];
    this.subs.push(profCtrl.valueChanges.subscribe((prof: Professional | null) => {
      this.schedulingService.clearChainedRelatedFields(SchedulingSteps.PROFESSIONAL_SELECTION);
      this.schedulingService.availabilityConfiguration.set(emptyAvailabilityConfiguration);
      this.confirmedSlotId.set(null);
      if (prof) {
        this.apiService.getAvailabilitiesByProfessionalId(prof.id).pipe(take(1)).subscribe((av: AvailabilityModel[]) => {
          this.schedulingService.setAvailabilitites(av);
        });
      }
    }));

    const dayCtrl = this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_DAY];
    this.subs.push(dayCtrl.valueChanges.subscribe(() => {
      this.schedulingService.clearChainedRelatedFields(SchedulingSteps.DATE_SELECTION);
      this.schedulingService.availabilityConfiguration.set(emptyAvailabilityConfiguration);
      this.expandedSlotId.set(null);
      this.confirmedSlotId.set(null);
      this.slotModality.set(Modality.ANY);
    }));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  @HostListener('document:mousedown')
  onDocClick(): void {
    this.openDropdown.set(null);
  }

  get selectedService(): ProfessionalService | null {
    const v = this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_SERVICE].value;
    return v?.id ? v : null;
  }

  get selectedProfessional(): Professional | null {
    return this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_PROFESSIONAL].value;
  }

  get selectedDay(): string | null {
    return this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_DAY].value;
  }

  get filteredSlots(): AvailabilityModel[] {
    const day = this.selectedDay;
    if (!day) return [];
    const slots = this.schedulingService.filterAvailabilityForDay(
      this.schedulingService.availability(),
      parseDate(day),
    );
    return slots.filter(s => !s.isBooked).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  serviceName(name: string): string {
    return ProfessionalSessionService[name as keyof typeof ProfessionalSessionService] || name;
  }

  fmtTime(t: string): string {
    return formatTime(t);
  }

  fmtDate(key: string | null): string {
    if (!key) return '';
    const [y, m, d] = key.split('-');
    return `${d}/${m}/${y}`;
  }

  toggleDropdown(name: 'service' | 'professional' | 'date'): void {
    this.openDropdown.update(v => v === name ? null : name);
  }

  selectService(svc: ProfessionalService): void {
    this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_SERVICE].setValue(svc);
    this.openDropdown.set(null);
  }

  selectProfessional(prof: Professional): void {
    this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_PROFESSIONAL].setValue(prof);
    this.openDropdown.set(null);
  }

  selectDate(key: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = key.split('-').map(Number);
    if (new Date(y, m - 1, d) < today) return;
    if (!this.schedulingService.timeSlots.has(key)) return;
    this.schedulingService.schedulingForm.controls[SchedulingFormControls.SELECTED_DAY].setValue(key);
    this.openDropdown.set(null);
  }

  prevMonth(): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  isPast(date: Date): boolean {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return date < t;
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate();
  }

  toggleSlot(id: number): void {
    if (this.expandedSlotId() === id) {
      this.expandedSlotId.set(null);
    } else {
      this.expandedSlotId.set(id);
      this.slotModality.set(Modality.ANY);
    }
  }

  confirmSlot(slot: AvailabilityModel): void {
    const modality = this.slotModality();
    const fc = this.schedulingService.schedulingForm.controls;
    fc[SchedulingFormControls.SELECTED_MODALITY].setValue(modality);
    fc[SchedulingFormControls.SELECTED_AVAILABILITY].setValue(slot);
    this.apiService.setAppointment(this.schedulingService.getAppointmentPayload()).subscribe({
      next: () => {
        this.confirmedSlotId.set(slot.id);
        const date = this.fmtDate(this.selectedDay);
        this.showToast(
          `Sessão agendada · ${slot.professionalName} · ${date} · ${this.fmtTime(slot.startTime)} · ${modality}.`
        );
      },
      error: () => {},
    });
  }

  showToast(msg: string): void {
    this.toast.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2800);
  }

  private toKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
