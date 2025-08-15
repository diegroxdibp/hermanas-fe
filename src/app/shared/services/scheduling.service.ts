import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emptyTherapist, TherapistModel } from '../models/therapist.model';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AvailabilityModel } from '../models/availability.model';
import { AppointmentPayload } from '../models/appointment-payload.model';
import { SchedulingFormControlNames } from '../enums/scheduling-form-control-names.enum';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  schedulingForm: FormGroup;
  availability: AvailabilityModel[] = [];
  timeSlots: Map<string, string> = new Map<string, string>();

  constructor(private readonly fb: FormBuilder) {
    this.schedulingForm = this.fb.group({
      clientId: this.fb.control(0, [Validators.required]),
      therapistId: this.fb.control(0, [Validators.required]),
      selectedDay: this.fb.control('', [Validators.required]),
      selectedTimeSlot: this.fb.control('', [Validators.required]),
      selectedTherapist: this.fb.control<TherapistModel | null>(null, [
        Validators.required,
      ]),
      selectedType: this.fb.control<AppointmentType>(AppointmentType.ANY, [
        Validators.required,
      ]),
    });
  }

  getAppointmentPayload(): AppointmentPayload {
    const payload = {
      clientId: this.schedulingForm.get(SchedulingFormControlNames.clientId)
        ?.value,
      therapistId: this.schedulingForm.get(
        SchedulingFormControlNames.therapistId
      )?.value,
      appointmentDate: this.schedulingForm.get(
        SchedulingFormControlNames.selectedDay
      )?.value,
      //     "startTime": "11:00:00",
      //     "endTime": "12:00:00",
      //     "isRecurring": true,
      //     "type":"REMOTE"
    } as AppointmentPayload;
    return payload;
  }
}
