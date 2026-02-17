import { CommonModule, DatePipe } from '@angular/common';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaskitoDirective } from '@maskito/angular';
import { AppConstants } from '../../../app-constants';
import { MaskitoOptions } from '@maskito/core';
import pastDateMask from '../../masks/past-date.mask';
import { AvailabilityModel } from '../../models/availability.model';
import { MatSelectModule } from '@angular/material/select';
import {
  CalendarConfigurationObject,
  emptyCalendarConfiguration,
} from '../../models/input-configuration-objects/calendar-configuration-object';
import { CalendarType } from '../../enums/calendar-type.enum';
import { DayOfWeek } from '../../enums/day-of-week.enum';

export const DD_MM_YYYY_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        return new Date(year, month, day);
      }
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: Object): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${this.to2digit(day)}/${this.to2digit(month)}/${year}`;
  }

  private to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MaskitoDirective,
    FormsModule,
    MatSelectModule,
  ],
  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-PT' },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMAT },
  ],
})
export class CalendarComponent implements OnInit {
  @Input({ required: true })
  calendarConfiguration: CalendarConfigurationObject =
    emptyCalendarConfiguration;
  @Input({ required: false }) availability: AvailabilityModel[] = [];

  readonly options: MaskitoOptions = pastDateMask;
  allowedRecurringDays: Set<number> = new Set();
  allowedSpecificDates: Date[] = [];
  dateControl = new FormControl<Date | null>(null);

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {
    for (const availability of this.availability) {
      if (availability.isBooked) continue;

      if (availability.isRecurring && availability.dayOfWeek) {
        const dayOfWeek = this.getDayNumber(availability.dayOfWeek);
        this.allowedRecurringDays.add(dayOfWeek);
      } else if (!availability.isRecurring) {
        this.allowedSpecificDates.push(new Date(availability.startDate));
      }
    }

    this.dateControl.valueChanges.subscribe(value => {
      if (value) {
        const isoDate = this.datePipe.transform(value, 'yyyy-MM-dd');
        this.calendarConfiguration.control.setValue(isoDate);
      }
    });
  }

  isDateAllowed = (date: Date | null): boolean => {
    if (!date) return false;

    if (this.calendarConfiguration.calendarType === CalendarType.SCHEDULING) {
      if (this.allowedRecurringDays.has(date.getDay())) return true;

      return this.allowedSpecificDates.some(
        (allowed) =>
          allowed.getFullYear() === date.getFullYear() &&
          allowed.getMonth() === date.getMonth() &&
          allowed.getDate() === date.getDate(),
      );
    }

    return true;
  };

  getDayNumber(day: DayOfWeek | string): number {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days.indexOf(day as DayOfWeek);
  }

  get minDate(): Date {
    if (this.calendarConfiguration.calendarType === CalendarType.SCHEDULING) {
      return AppConstants.scheduling.minDate;
    }
    if (this.calendarConfiguration.calendarType === CalendarType.BIRTHDATE) {
      return AppConstants.birthdate.maxDate;
    }
    return new Date();
  }

  get maxDate(): Date {
    if (this.calendarConfiguration.calendarType === CalendarType.SCHEDULING) {
      return AppConstants.scheduling.maxDate;
    }
    if (this.calendarConfiguration.calendarType === CalendarType.BIRTHDATE) {
      return AppConstants.birthdate.minDate;
    }
    return new Date();
  }
}