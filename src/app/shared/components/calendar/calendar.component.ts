import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDatepickerInputEvent,
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

@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MaskitoDirective,
    FormsModule,
    MatSelectModule,
  ],
  providers: [DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  @Input({ required: true })
  calendarConfiguration: CalendarConfigurationObject =
    emptyCalendarConfiguration;
  @Input({ required: false }) availability: AvailabilityModel[] = [];
  readonly AppConstants = AppConstants;
  readonly options: MaskitoOptions = pastDateMask;
  allowedRecurringDays: Set<number> = new Set();
  allowedSpecificDates: Date[] = [];

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {
    console.log('init', this.availability);
    for (const availability of this.availability) {
      if (availability.isRecurring && availability.recurringDay) {
        const dayOfWeek = this.getDayNumber(availability.recurringDay);
        this.allowedRecurringDays.add(dayOfWeek);
      } else if (!availability.isRecurring) {
        this.allowedSpecificDates.push(new Date(availability.startDate));
      }
    }
  }

  onDateInput(event: MatDatepickerInputEvent<Date>) {
    const formattedDate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    this.calendarConfiguration.control.setValue(formattedDate);
  }

  // onDateChange(event: MatDatepickerInputEvent<Date>): void {
  //   console.log('Date selected from calendar:', event.value);
  //   const formattedDate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  //   console.log('Formated date:', formattedDate);
  // }

  isDateAllowed = (date: Date | null): boolean => {
    if (!date) return false;

    if (this.calendarConfiguration.calendarType === CalendarType.SCHEDULING) {
      if (this.allowedRecurringDays.has(date.getDay())) return true;

      // Check recurring days

      // Check exact matches for specific one-time availabilities
      return this.allowedSpecificDates.some(
        (allowed) =>
          allowed.getFullYear() === date.getFullYear() &&
          allowed.getMonth() === date.getMonth() &&
          allowed.getDate() === date.getDate()
      );
    }

    return true;
  };

  getDayNumber(dayName: string): number {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days.indexOf(dayName.toUpperCase());
  }

  get minDate() {
    if (this.calendarConfiguration.calendarType === CalendarType.SCHEDULING) {
      return AppConstants.scheduling.minDate;
    }
    if (this.calendarConfiguration.calendarType === CalendarType.BIRTHDATE) {
      return AppConstants.birthdate.maxDate;
    }

    return new Date();
  }

  get maxDate() {
    if (this.calendarConfiguration.calendarType === CalendarType.SCHEDULING) {
      return AppConstants.scheduling.maxDate;
    }

    if (this.calendarConfiguration.calendarType === CalendarType.BIRTHDATE) {
      return AppConstants.birthdate.minDate;
    }

    return new Date();
  }
}
