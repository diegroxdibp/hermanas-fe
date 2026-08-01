import { Component, ElementRef, HostListener, Input, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

const PT_MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Styled birthdate picker (custom calendar popover) used wherever we ask for
// a birthdate, replacing the native <input type="date"> so the field matches
// the rest of the design system instead of the browser's own date UI.
@Component({
  selector: 'app-birthdate-calendar',
  imports: [ReactiveFormsModule],
  templateUrl: './birthdate-calendar.component.html',
  styleUrl: './birthdate-calendar.component.scss',
})
export class BirthdateCalendarComponent {
  @Input({ required: true }) dateControl!: FormControl;
  @Input() labelId = '';

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

  get selectedBirthdateLabel(): string {
    return this.dateControl.value ? this.fmtDate(this.dateControl.value) : '';
  }

  get calMonthIndex(): number {
    return this.calendarViewDate().getMonth();
  }

  get calYear(): number {
    return this.calendarViewDate().getFullYear();
  }

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.calendarOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.calendarOpen.set(false);
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.elementRef.nativeElement.contains(next)) {
      this.calendarOpen.set(false);
    }
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
    this.dateControl.setValue(key);
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
}
