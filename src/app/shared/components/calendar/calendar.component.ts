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
import mask from '../../masks/date.mask';
import { AvailabilityModel } from '../../models/availability.model';
import { MatSelectModule } from '@angular/material/select';
import {
  CalendarConfigurationObject,
  emptyCalendarConfiguration,
} from '../../models/input-configuration-objects/calendar-configuration-object';

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
  @Input({ required: true }) availability: AvailabilityModel[] = [];
  // timeSlots: string[] = [];
  readonly AppConstants = AppConstants;
  readonly options: MaskitoOptions = mask;
  allowedRecurringDays: Set<number> = new Set(); // e.g., 1 for Monday
  allowedSpecificDates: Date[] = [];

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {
    console.log('init', this.availability);
    for (const availability of this.availability) {
      // const timeSlot = `${availability.startTime} - ${availability.endTime}`;
      // this.timeSlots.push(timeSlot);

      if (availability.isRecurring && availability.recurringDay) {
        const dayOfWeek = this.getDayNumber(availability.recurringDay);
        this.allowedRecurringDays.add(dayOfWeek);
      } else if (!availability.isRecurring) {
        this.allowedSpecificDates.push(new Date(availability.startDate));
      }
    }

    // this.calendarConfiguration.dayControl.valueChanges.subscribe((date) => {
    //   if (date) {
    //     const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    //     console.log(formattedDate); // Output: "2025-07-29"
    //     console.log('Form', this.calendarConfiguration.dayControl.value); // Output: "2025-07-29"
    //     this.calendarConfiguration.dayControl.setValue(formattedDate);
    //   }
    // });
  }

  onDateInput(event: MatDatepickerInputEvent<Date>) {
    const formattedDate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    console.log('Typed date input:', event.value);
    console.log('Formated date:', formattedDate);
    this.calendarConfiguration.dayControl.setValue(formattedDate);
    console.log('Date Form:', this.calendarConfiguration.dayControl);
  }

  // onDateChange(event: MatDatepickerInputEvent<Date>): void {
  //   console.log('Date selected from calendar:', event.value);
  //   const formattedDate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  //   console.log('Formated date:', formattedDate);
  // }

  isDateAllowed = (date: Date | null): boolean => {
    if (!date) return false;

    // Check recurring days
    if (this.allowedRecurringDays.has(date.getDay())) return true;

    // Check exact matches for specific one-time availabilities
    return this.allowedSpecificDates.some(
      (allowed) =>
        allowed.getFullYear() === date.getFullYear() &&
        allowed.getMonth() === date.getMonth() &&
        allowed.getDate() === date.getDate()
    );
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
}
