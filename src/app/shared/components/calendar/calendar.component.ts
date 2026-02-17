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
import { DayOfWeek } from '../../enums/day-of-week.enum';

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
    for (const availability of this.availability) {
      if (availability.isBooked) {
        // Skip booked slots
        continue;
      }

      if (availability.isRecurring && availability.dayOfWeek) {
        const dayOfWeek = this.getDayNumber(availability.dayOfWeek);
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
          allowed.getDate() === date.getDate(),
      );
    }

    return true;
  };

  getDayNumber(day: DayOfWeek | string): number {
    // Ensure enum value
    const dow = day as DayOfWeek;

    switch (dow) {
      case DayOfWeek.SUNDAY:
        return 0;
      case DayOfWeek.MONDAY:
        return 1;
      case DayOfWeek.TUESDAY:
        return 2;
      case DayOfWeek.WEDNESDAY:
        return 3;
      case DayOfWeek.THURSDAY:
        return 4;
      case DayOfWeek.FRIDAY:
        return 5;
      case DayOfWeek.SATURDAY:
        return 6;
      default:
        return -1;
    }
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
