import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emptyTherapist, TherapistModel } from '../models/therapist.model';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AvailabilityModel } from '../models/availability.model';
import { AppointmentPayload } from '../models/appointment-payload.model';
import { SchedulingFormControls } from '../enums/scheduling-form-controls.enum';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  schedulingForm: FormGroup;
  availability: AvailabilityModel[] = [];
  timeSlots = new Map<string, string[]>();

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
      [SchedulingFormControls.SELECTED_THERAPIST]:
        this.fb.control<TherapistModel | null>(null, [Validators.required]),
      selectedType: this.fb.control<AppointmentType>(AppointmentType.ANY, [
        Validators.required,
      ]),
    });
  }

  getAppointmentPayload(): AppointmentPayload {
    const payload = {
      clientId: this.schedulingForm.get(SchedulingFormControls.CLIENT_ID)
        ?.value,
      therapistId: this.schedulingForm.get(SchedulingFormControls.THERAPIST_ID)
        ?.value,
      appointmentDate: this.schedulingForm.get(
        SchedulingFormControls.SELECTED_DAY
      )?.value,
      //     "startTime": "11:00:00",
      //     "endTime": "12:00:00",
      //     "isRecurring": true,
      //     "type":"REMOTE"
    } as AppointmentPayload;
    return payload;
  }
}
