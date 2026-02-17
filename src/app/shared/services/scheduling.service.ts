import { SchedulingFormControls } from './../enums/scheduling-form-controls.enum';
import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AvailabilityModel } from '../models/availability.model';
import { AppointmentPayload } from '../models/appointment-payload.model';
import { dayNumberToEnum } from '../enums/day-to-number-enum.util';
import {
  dayName,
  isBetween,
  parseDate,
  sameDay,
} from '../utils/date-helper.util';
import {
  emptyProfessionalService,
  ProfessionalService,
} from '../models/professional-service.model';
import { ProfessionalSessionService } from '../enums/professional-session-service.enum';
import { Professional } from '../models/get-professional-by-service-response.model';
import { SchedulingFormModel } from '../models/input-configuration-objects/scheduling-form-controls.model';
import { ProfessionalModel } from '../models/professional.model';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  schedulingForm: FormGroup<SchedulingFormModel>;
  availability = signal<AvailabilityModel[]>([]);
  timeSlots = new Map<string, string[]>();
  services: ProfessionalService[] = [];
  professionals: Professional[] = [];
  ProfessionalSessionService = ProfessionalSessionService;

  constructor(private readonly fb: FormBuilder) {
    this.schedulingForm = this.fb.group<SchedulingFormModel>({
      [SchedulingFormControls.CLIENT_ID]: this.fb.control(
        null,
        Validators.required,
      ),

      [SchedulingFormControls.SELECTED_SERVICE]: this.fb.control(
        emptyProfessionalService,
        Validators.required,
      ),

      [SchedulingFormControls.SELECTED_DAY]: this.fb.control(
        null,
        Validators.required,
      ),

      [SchedulingFormControls.SELECTED_TIME_SLOT]: this.fb.control(
        null,
        Validators.required,
      ),

      [SchedulingFormControls.SELECTED_PROFESSIONAL]: this.fb.control(
        null,
        Validators.required,
      ),

      [SchedulingFormControls.SELECTED_MODALITY]: this.fb.control(
        null,
        Validators.required,
      ),

      [SchedulingFormControls.SELECTED_AVAILABILITY]: this.fb.control(
        null,
        Validators.required,
      ),
    });
  }

  getAppointmentPayload(): AppointmentPayload {
    const payload = {
      availabilityId:
        this.schedulingForm.controls[
          SchedulingFormControls.SELECTED_AVAILABILITY
        ].value?.id,
      professionalServiceId:
        this.schedulingForm.controls[SchedulingFormControls.SELECTED_SERVICE]
          .value?.id,
      appointmentDate:
        this.schedulingForm.controls[SchedulingFormControls.SELECTED_DAY].value,
      startTime:
        this.schedulingForm.controls[
          SchedulingFormControls.SELECTED_AVAILABILITY
        ].value?.startTime,
      endTime:
        this.schedulingForm.controls[
          SchedulingFormControls.SELECTED_AVAILABILITY
        ].value?.endTime,
      isRecurring:
        this.schedulingForm.controls[
          SchedulingFormControls.SELECTED_AVAILABILITY
        ].value?.isRecurring,
      modality:
        this.schedulingForm.controls[SchedulingFormControls.SELECTED_MODALITY]
          .value,
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
          Math.max(new Date(availability.startDate).getTime(), now.getTime()),
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
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  }

  filterAvailabilityForDay(
    allAvailabilities: AvailabilityModel[],
    selectedDate: Date,
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
