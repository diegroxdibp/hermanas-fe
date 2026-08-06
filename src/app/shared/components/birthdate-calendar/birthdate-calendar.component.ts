import { Component, ElementRef, HostListener, Input, OnInit, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { StyledSelectComponent, StyledSelectOption } from '../styled-select/styled-select.component';

const PT_MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Styled birthdate picker (custom calendar popover) used wherever we ask for
// a birthdate, replacing the native <input type="date"> so the field matches
// the rest of the design system instead of the browser's own date UI.
@Component({
  selector: 'app-birthdate-calendar',
  imports: [ReactiveFormsModule, MaskitoDirective, StyledSelectComponent],
  templateUrl: './birthdate-calendar.component.html',
  styleUrl: './birthdate-calendar.component.scss',
})
export class BirthdateCalendarComponent implements OnInit {
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

  readonly dateMask = maskitoDateOptionsGenerator({
    mode: 'dd/mm/yyyy',
    separator: '/',
    min: this.oldestBirthdate,
    max: this.youngestBirthdate,
  });

  // Free-text mirror of dateControl (kept in sync both ways) so the field can
  // be typed into directly instead of only picked via the calendar popover.
  readonly typedControl = new FormControl('');

  readonly years = (() => {
    const from = this.oldestBirthdate.getFullYear();
    const to = this.youngestBirthdate.getFullYear();
    const list: number[] = [];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  })();

  readonly monthOptions: StyledSelectOption[] = this.months.map((m, i) => ({
    value: String(i),
    label: m,
  }));

  readonly yearOptions: StyledSelectOption[] = this.years.map(y => ({
    value: String(y),
    label: String(y),
  }));

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

  get calMonthIndex(): number {
    return this.calendarViewDate().getMonth();
  }

  get calYear(): number {
    return this.calendarViewDate().getFullYear();
  }

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.syncTypedFromControl(this.dateControl.value);

    this.dateControl.valueChanges.subscribe(value => this.syncTypedFromControl(value));
    this.typedControl.valueChanges.subscribe(value => this.onTypedValueChange(value));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Selecting a month/year option removes that button from the DOM
    // (via the styled-select's own @if) while the click is still bubbling,
    // so `contains(event.target)` would see a detached node and report a
    // false negative. composedPath() is captured before that mutation.
    if (!event.composedPath().includes(this.elementRef.nativeElement)) {
      this.calendarOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.calendarOpen.set(false);
  }

  // Selecting a month/year option removes that button from the DOM as part
  // of the same click, so the browser resets focus to <body> and reports
  // focusout with relatedTarget = null — indistinguishable from a real
  // click outside. Flagging the mousedown that starts the interaction (which
  // fires before the option is removed) lets focusout ignore that one case.
  private interactingInside = false;

  @HostListener('mousedown')
  onMouseDownInside(): void {
    this.interactingInside = true;
    // A removed option's cascading blur/focusout (relatedTarget null) can
    // land a render cycle after the click that removed it, so wait a full
    // paint cycle (double rAF) rather than a single macrotask before
    // clearing the guard.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.interactingInside = false;
      }),
    );
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    if (this.interactingInside) return;
    const next = event.relatedTarget as Node | null;
    if (!next || !this.elementRef.nativeElement.contains(next)) {
      this.calendarOpen.set(false);
      this.syncTypedFromControl(this.dateControl.value);
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

  private syncTypedFromControl(key: string | null | undefined): void {
    const formatted = this.fmtDate(key ?? null);
    if (this.typedControl.value !== formatted) {
      this.typedControl.setValue(formatted, { emitEvent: false });
    }
    if (key) {
      const [y, m, d] = key.split('-').map(Number);
      this.calendarViewDate.set(new Date(y, m - 1, d));
    }
  }

  private onTypedValueChange(value: string | null): void {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value ?? '');
    if (!match) return;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    const isRealDate =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    if (!isRealDate || date < this.oldestBirthdate || date > this.youngestBirthdate) return;

    this.calendarViewDate.set(new Date(year, month - 1, 1));
    const key = this.toKey(date);
    if (this.dateControl.value !== key) {
      this.dateControl.setValue(key);
    }
  }
}
