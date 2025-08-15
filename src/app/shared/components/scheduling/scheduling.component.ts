import { TherapistModel } from './../../models/therapist.model';
import { SchedulingService } from './../../services/scheduling.service';
import { ApiService } from './../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';
import mask from '../../masks/date.mask';
import { AvailabilityModel } from '../../models/availability.model';
import { CalendarComponent } from '../calendar/calendar.component';
import {
  emptyRadioInputConfiguration,
  RadioInputConfigurationObject,
} from '../../models/input-configuration-objects/radio-input-configuration-object';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AppointmentType } from '../../enums/appointment-type.enum';
import {
  CalendarConfigurationObject,
  emptyCalendarConfiguration,
} from '../../models/input-configuration-objects/calendar-configuration-object';
import { RadioInputComponent } from '../radio-input/radio-input.component';
import { AvailabilitiesComponent } from '../availabilities/availabilities.component';
import {
  AvailabilityConfigurationObject,
  emptyAvailabilityConfiguration,
} from '../../models/input-configuration-objects/availability-configuration-object';
import { dayNumberToEnum } from '../../utils/day-to-number-enum.util';
import { SchedulingFormControlNames } from '../../enums/scheduling-form-control-names.enum';
@Component({
  selector: 'app-scheduling',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CalendarComponent,
    RadioInputComponent,
    MatOption,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    RadioInputComponent,
    AvailabilitiesComponent,
  ],
  templateUrl: './scheduling.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnInit {
  calendarConfigurationObject: CalendarConfigurationObject =
    emptyCalendarConfiguration;
  availabilityConfigurationObject: AvailabilityConfigurationObject =
    emptyAvailabilityConfiguration;
  appointmentTypeConfiguration: RadioInputConfigurationObject =
    emptyRadioInputConfiguration;
  allowedRecurringDays: Set<number> = new Set(); // e.g., 1 for Monday
  allowedSpecificDates: Date[] = [];
  therapists: TherapistModel[] = [];
  therapistControl = new FormControl('', Validators.required);
  availability: AvailabilityModel[] = [];
  constructor(
    private apiService: ApiService,
    public schedulingService: SchedulingService
  ) {
    this.apiService
      .getTherapists()
      .subscribe((therapists: TherapistModel[]) => {
        console.log(therapists);
        this.therapists = therapists;
      });
    this.apiService
      .getAvailabilitites()
      .subscribe((availabilities: AvailabilityModel[]) => {
        this.schedulingService.availability = availabilities;
        this.availability = availabilities;
        const now = new Date();
        const endRange = new Date();

        for (const availability of availabilities) {
          const timeSlot = `${availability.startTime} - ${availability.endTime}`;

          if (availability.isRecurring) {
            let current = new Date(now);

            // Optionally, make recurring respect endDate if present
            const recurringEnd = new Date(availability.endDate);

            while (current <= recurringEnd && current <= endRange) {
              if (
                dayNumberToEnum[current.getDay()] === availability.recurringDay
              ) {
                const key = this.formatDateKey(current);
                this.schedulingService.timeSlots.set(key, timeSlot);
              }
              current.setDate(current.getDate() + 1);
            }
          } else {
            // One-time availability
            const start = new Date(availability.startDate);
            const key = this.formatDateKey(start);
            this.schedulingService.timeSlots.set(key, timeSlot);
          }
        }
        console.log('TIMESLOTS -> ', this.schedulingService.timeSlots);
      });
  }
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  }
  ngOnInit() {
    this.setCalendarConfiguration();
    this.setAppointmentTypeConfiguration();
    // this.therapistForm = this.schedulingService.schedulingForm.get(
    //   'selectedTherapist'
    // ) as FormControl;
    // console.log(this.therapistForm);
  }

  setCalendarConfiguration() {
    this.calendarConfigurationObject = {
      title: 'Escolha uma data:',
      dayControl: this.schedulingService.schedulingForm.get(
        'selectedDay'
      ) as FormControl,
      timeSlotControl: this.schedulingService.schedulingForm.get(
        'selectedTimeSlot'
      ) as FormControl,
      availability: this.availability,
    };
  }

  setAvailabilityConfiguration() {
    this.calendarConfigurationObject = {
      title: 'Escolha uma data:',
      dayControl: this.schedulingService.schedulingForm.get(
        'selectedDay'
      ) as FormControl,
      timeSlotControl: this.schedulingService.schedulingForm.get(
        'selectedTimeSlot'
      ) as FormControl,
      availability: this.availability,
    };
  }

  setAppointmentTypeConfiguration() {
    this.appointmentTypeConfiguration = {
      title: 'Escolha uma tipe de atendimento:',
      control: this.schedulingService.schedulingForm.get(
        'selectedType'
      ) as FormControl,
      listOfOptions: Object.values(AppointmentType),
    };
  }

  selectTherapist(therapist: TherapistModel | null): void {
    if (therapist) {
      this.schedulingService.schedulingForm
        .get(SchedulingFormControlNames.selectedTherapist)
        ?.setValue(therapist);
    } else {
      this.schedulingService.schedulingForm
        .get(SchedulingFormControlNames.selectedTherapist)
        ?.setValue(null);
    }
  }

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

  trackById = (index: number, item: TherapistModel) => item.id;

  restrictInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters immediately

    // Add ":" after the second digit
    if (value.length > 2) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    // Prevent further input if max length (5 characters) is reached
    if (value.length > 5) {
      value = value.slice(0, 5); // Truncate excess characters
    }

    input.value = value; // Update the input value in real-time
  }

  submit(isSubmitted: boolean) {
    if(isSubmitted){
      this.apiService.setAppointment(this.schedulingService.getAppointmentPayload());
    }
  }
}
