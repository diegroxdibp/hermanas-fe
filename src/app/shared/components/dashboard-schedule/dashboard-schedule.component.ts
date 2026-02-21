import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCalendar } from '@angular/material/datepicker';
import { SessionService } from '../../services/session.service';
import { Appointment } from '../../models/appointment.model';
import { NextAppointmentDatePipe } from '../../pipes/next-appointment-date.pipe';
import { EnumValuePipe } from '../../pipes/enum-value.pipe';
import { DayOfWeek } from '../../enums/day-of-week.enum';
import { Modality } from '../../enums/modality.enum';
import { ApiService } from '../../../core/services/api.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import localePt from '@angular/common/locales/pt-PT'; // ← Add this

registerLocaleData(localePt); // ← Add this
@Component({
  selector: 'app-dashboard-schedule',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatCardModule,
    MatDivider,
    CommonModule,
    NextAppointmentDatePipe,
    EnumValuePipe,
    MatDatepickerModule,
    MatCalendar,
  ],
  templateUrl: './dashboard-schedule.component.html',
  styleUrl: './dashboard-schedule.component.scss',
})
export class DashboardScheduleComponent implements OnInit {
  readonly apiService = inject(ApiService);
  readonly sessionService = inject(SessionService);

  appointments: Appointment[] = [];
  calendarDates: Date[] = [];

  // Expose enums to template
  DayOfWeek = DayOfWeek;
  Modality = Modality;

  ngOnInit(): void {
    this.apiService
      .getUserAppointments(1)
      .subscribe((appointments: Appointment[]) => {
        this.appointments = appointments;

        // DEBUG: Log the raw appointment data
        console.log('=== RAW APPOINTMENTS ===');
        console.log(JSON.stringify(appointments, null, 2));

        this.generateCalendarDates();

        console.log('=== CALENDAR DATES ===');
        console.log(this.calendarDates);
      });
  }

  generateCalendarDates(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    this.calendarDates = [];

    for (const appointment of this.appointments) {
      if (appointment.isRecurring && appointment.dayOfWeek) {
        console.log('Processing recurring appointment:', appointment);
        // Generate all occurrences for recurring appointments
        const endDateStr =
          appointment.endDate || threeMonthsFromNow.toISOString().split('T')[0];
        const occurrences = this.getRecurringDates(
          appointment.dayOfWeek,
          appointment.startDate,
          endDateStr,
          threeMonthsFromNow,
        );
        console.log('Occurrences for recurring:', occurrences);
        this.calendarDates.push(...occurrences);
      } else if (!appointment.isRecurring && appointment.startDate) {
        console.log('Processing one-time appointment:', appointment);
        // One-time appointment
        const appointmentDate = new Date(appointment.startDate);
        appointmentDate.setHours(0, 0, 0, 0);
        if (appointmentDate >= today && appointmentDate <= threeMonthsFromNow) {
          this.calendarDates.push(appointmentDate);
        }
      }
    }

    // Remove duplicates and sort
    this.calendarDates = Array.from(
      new Set(this.calendarDates.map((d) => d.getTime())),
    )
      .map((time) => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime());

    console.log('Final calendar dates:', this.calendarDates);
  }

  private getRecurringDates(
    dayOfWeek: DayOfWeek,
    startDate: string,
    endDate: string,
    limitDate: Date,
  ): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const targetDay = this.getDayNumber(dayOfWeek);

    console.log(
      'getRecurringDates - dayOfWeek:',
      dayOfWeek,
      'targetDay:',
      targetDay,
    );
    console.log('Start date:', start, 'End date:', end, 'Limit:', limitDate);

    // Find first occurrence on or after start date
    let current = new Date(start);
    const currentDay = current.getDay();
    let daysUntilFirst = targetDay - currentDay;
    if (daysUntilFirst < 0) {
      daysUntilFirst += 7;
    } else if (daysUntilFirst === 0 && current < start) {
      daysUntilFirst = 7;
    }
    current.setDate(current.getDate() + daysUntilFirst);

    console.log('First occurrence:', current);

    // Generate all occurrences
    const finalLimit = end < limitDate ? end : limitDate;
    while (current <= finalLimit) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7); // Next week
    }

    console.log('Generated dates:', dates);
    return dates;
  }

  private getDayNumber(day: DayOfWeek): number {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days.indexOf(day);
  }

  // Custom date class for calendar
  dateClass = (date: Date): string => {
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    const hasAppointment = this.calendarDates.some(
      (d) => d.getTime() === dateTime,
    );
    return hasAppointment ? 'appointment-date' : '';
  };
}
