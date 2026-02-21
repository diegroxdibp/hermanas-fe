import { Pipe, PipeTransform } from '@angular/core';
import { DayOfWeek } from '../enums/day-of-week.enum';

@Pipe({
  name: 'nextAppointmentDate',
  pure: true,
})
export class NextAppointmentDatePipe implements PipeTransform {
  transform(dayOfWeek: DayOfWeek, startDate?: string): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If there's a specific start date and it's in the future, use it
    if (startDate) {
      const appointmentStart = new Date(startDate);
      if (appointmentStart >= today) {
        return appointmentStart;
      }
    }

    // Calculate next occurrence of the day of week
    const targetDay = this.getDayNumber(dayOfWeek);
    const currentDay = today.getDay();

    let daysUntilNext = targetDay - currentDay;
    if (daysUntilNext <= 0) {
      daysUntilNext += 7; // Next week
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate;
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
}
