import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AvailabilityModel } from '../models/availability.model';
import { AppointmentPayload } from '../models/appointment-payload.model';
import { SchedulingFormControls } from '../enums/scheduling-form-controls.enum';
import { dayNumberToEnum } from '../enums/day-to-number-enum.util';
import {
  dayName,
  isBetween,
  parseDate,
  sameDay,
} from '../utils/date-helper.util';
import { ProfessionalModel } from '../models/professional.model';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  schedulingForm: FormGroup;
  availability = signal<AvailabilityModel[]>([]);
  timeSlots = new Map<string, string[]>();
  professionals: ProfessionalModel[] = [];

  constructor(private readonly fb: FormBuilder) {
    this.schedulingForm = this.fb.group({
      [SchedulingFormControls.CLIENT_ID]: this.fb.control(0, [
        Validators.required,
      ]),
      [SchedulingFormControls.SELECTED_DAY]: this.fb.control('', [
        Validators.required,
      ]),
      [SchedulingFormControls.SELECTED_TIME_SLOT]: this.fb.control('', [
        Validators.required,
      ]),
      [SchedulingFormControls.SELECTED_PROFESSIONAL]:
        this.fb.control<ProfessionalModel | null>(null, [Validators.required]),

      [SchedulingFormControls.SELECTED_TYPE]: this.fb.control<AppointmentType>(
        AppointmentType.ANY,
        [Validators.required]
      ),
    });
  }

  getAppointmentPayload(): AppointmentPayload {
    const payload = {
      clientId: this.schedulingForm.get(SchedulingFormControls.CLIENT_ID)
        ?.value,
      therapistId: this.schedulingForm.get(
        SchedulingFormControls.PROFESSIONAL_ID
      )?.value,
      appointmentDate: this.schedulingForm.get(
        SchedulingFormControls.SELECTED_DAY
      )?.value,
      startTime: '',
      endTime: '',
      isRecurring: true,
      type: this.schedulingForm.get(SchedulingFormControls.SELECTED_TYPE)
        ?.value,
    } as AppointmentPayload;
    return payload;
  }

  setAvailabilitites(availabilities: AvailabilityModel[]): void {
    this.availability.set(availabilities);

    const now = new Date();
    const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 2)); // Calendar limit

    for (const availability of availabilities) {
      const timeSlot = `${availability.startTime} - ${availability.endTime}`;

      if (availability.isRecurring) {
        let current = new Date(
          Math.max(new Date(availability.startDate).getTime(), now.getTime())
        );

        const recurringEnd = new Date(availability.endDate);
        const end = recurringEnd < maxDate ? recurringEnd : maxDate;

        while (current <= end) {
          if (dayNumberToEnum[current.getDay()] === availability.recurringDay) {
            const key = this.formatDateKey(current);
            if (!this.timeSlots.has(key)) {
              this.timeSlots.set(key, []);
            }
            this.timeSlots.get(key)!.push(timeSlot);
          }
          current.setDate(current.getDate() + 1);
        }
      } else {
        // One-time availability (only add if inside calendar range)
        const start = new Date(availability.startDate);
        if (start <= maxDate) {
          const key = this.formatDateKey(start);
          if (!this.timeSlots.has(key)) {
            this.timeSlots.set(key, []);
          }
          this.timeSlots.get(key)!.push(timeSlot);
        }
      }
    }
    console.log('TIMESLOTS -> ', this.timeSlots);
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  }

  filterAvailabilityForDay(
    allAvailabilities: AvailabilityModel[],
    selectedDate: Date
  ): AvailabilityModel[] {
    const selectedDayName = dayName(selectedDate);

    return allAvailabilities.filter((av) => {
      const start = parseDate(av.startDate);
      const end = parseDate(av.endDate);

      // 🔁 Recurring availability
      if (av.isRecurring && av.recurringDay) {
        return (
          av.recurringDay === selectedDayName &&
          isBetween(selectedDate, start, end)
        );
      }

      // 📅 One-time availability
      if (!av.isRecurring) {
        return sameDay(start, selectedDate);
      }

      return false;
    });
  }
}
