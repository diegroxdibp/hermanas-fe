import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from '../../../core/services/form.service';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { CountryModel } from '../../models/country.model';
import { Countries } from '../../../../assets/countries';
import { Genders } from '../../enums/genders.enum';
import { OnboardingResponse } from '../../models/onboarding-response.model';
import { getBrowserCountry } from '../../utils/browser-country.util';
import { CountryPhoneFieldComponent } from '../country-phone-field/country-phone-field.component';
import { StyledSelectComponent, StyledSelectOption } from '../styled-select/styled-select.component';

const PT_MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule, CountryPhoneFieldComponent, StyledSelectComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly countries = Countries;
  readonly genders = Object.values(Genders);
  error: string | null = null;

  readonly countryOptions: StyledSelectOption[] = Countries.map(c => ({
    value: c.code,
    label: c.namePt,
    meta: `+${c.InternationalAreaCode}`,
  }));

  readonly genderOptions: StyledSelectOption[] = Object.values(Genders).map(g => ({
    value: g,
    label: g,
  }));

  readonly months = PT_MONTHS;
  readonly weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  private readonly oldestBirthdate = new Date(new Date().getFullYear() - 120, 0, 1);
  private readonly youngestBirthdate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  })();

  readonly years = (() => {
    const from = this.oldestBirthdate.getFullYear();
    const to = this.youngestBirthdate.getFullYear();
    const list: number[] = [];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  })();

  readonly calendarOpen = signal(false);
  readonly calendarViewDate = signal<Date>(this.youngestBirthdate);

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

  get nameCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.NAME) as FormControl;
  }

  get birthdateCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.BIRTHDATE) as FormControl;
  }

  get selectedBirthdateLabel(): string {
    return this.birthdateCtrl.value ? this.fmtDate(this.birthdateCtrl.value) : '';
  }

  get calMonthIndex(): number {
    return this.calendarViewDate().getMonth();
  }

  get calYear(): number {
    return this.calendarViewDate().getFullYear();
  }

  get genderCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.GENDER) as FormControl;
  }

  get phoneCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.PHONE) as FormControl;
  }

  readonly selectedCountry = signal<CountryModel>(getBrowserCountry());

  ngOnInit(): void {
    const initial = getBrowserCountry();
    this.selectedCountry.set(initial);
    this.formService.onboardingForm.reset({
      [FormControlsNames.PHONE_PREFIX]: initial,
    });
  }

  @HostListener('document:mousedown')
  onDocClick(): void {
    this.calendarOpen.set(false);
  }

  onCountryChange(code: string): void {
    const c = Countries.find(x => x.code === code);
    if (c) {
      this.selectedCountry.set(c);
    }
  }

  onPhonePrefixChange(country: CountryModel): void {
    this.formService.onboardingForm.get(FormControlsNames.PHONE_PREFIX)?.setValue(country);
  }

  toggleCalendar(): void {
    this.calendarOpen.update(v => !v);
  }

  prevMonth(): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  onMonthChange(monthIndex: string): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), Number(monthIndex), 1));
  }

  onYearChange(year: string): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(Number(year), d.getMonth(), 1));
  }

  selectDate(key: string): void {
    if (this.isOutOfRange(key)) return;
    this.birthdateCtrl.setValue(key);
    this.calendarOpen.set(false);
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate();
  }

  isOutOfRange(key: string): boolean {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date < this.oldestBirthdate || date > this.youngestBirthdate;
  }

  fmtDate(key: string | null): string {
    if (!key) return '';
    const [y, m, d] = key.split('-');
    return `${d}/${m}/${y}`;
  }

  private toKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  submit(event: Event): void {
    event.preventDefault();
    this.error = null;
    try {
      const payload = this.formService.onboardingPayload();
      this.userService.onboarding(payload).subscribe({
        next: (res: OnboardingResponse) => {
          this.sessionService.updateUser(res);
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.error = err.error?.error ?? 'Erro ao guardar perfil. Tente novamente.';
        },
      });
    } catch (e: any) {
      this.error = e.message ?? 'Dados inválidos.';
    }
  }
}
