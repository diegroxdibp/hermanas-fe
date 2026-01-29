import { AvailabilityModel } from './../../models/availability.model';
import { SchedulingService } from './../../services/scheduling.service';
import { ApiService } from './../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';
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
import { AvailabilitiesComponent } from '../availabilities/availabilities.component';
import {
  AvailabilityConfigurationObject,
  emptyAvailabilityConfiguration,
} from '../../models/input-configuration-objects/availability-configuration-object';
import { SchedulingFormControls } from '../../enums/scheduling-form-controls.enum';
import { take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { CalendarType } from '../../enums/calendar-type.enum';
import { parseDate } from '../../utils/date-helper.util';
import { MatIcon } from '@angular/material/icon';
import { AvailabilityType } from '../../enums/availability-type.enum';
import { ProfessionalModel } from '../../models/professional.model';

@Component({
  selector: 'app-scheduling',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CalendarComponent,
    MatOption,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    AvailabilitiesComponent,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './scheduling.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnInit {
  @ViewChild('body') body: ElementRef | undefined;
  @ViewChild('subject') subject: ElementRef | undefined;
  calendarConfigurationObject: CalendarConfigurationObject =
    emptyCalendarConfiguration;
  availabilityConfigurationObject: AvailabilityConfigurationObject =
    emptyAvailabilityConfiguration;
  appointmentTypeConfiguration: RadioInputConfigurationObject =
    emptyRadioInputConfiguration;
  allowedRecurringDays: Set<number> = new Set(); // e.g., 1 for Monday
  allowedSpecificDates: Date[] = [];
  availability: AvailabilityModel[] = [];
  SchedulingFormControls = SchedulingFormControls;

  constructor(
    private apiService: ApiService,
    public schedulingService: SchedulingService
  ) {
    this.apiService
      .getTherapists()
      .pipe(take(1))
      .subscribe((professionals: ProfessionalModel[]) => {
        console.log(professionals);
        this.schedulingService.professionals = professionals;
      });

    this.schedulingService.schedulingForm
      .get(SchedulingFormControls.SELECTED_PROFESSIONAL)
      ?.valueChanges.subscribe((selectedProfessional: ProfessionalModel) => {
        console.log(selectedProfessional);
        this.apiService
          .getAvailabilititesByProfessionalId(selectedProfessional.id)
          .pipe(take(1))
          .subscribe((availabilities: AvailabilityModel[]) => {
            console.log(
              'availabilities of ->',
              selectedProfessional,
              availabilities
            );
            this.schedulingService.setAvailabilitites(availabilities);
          });
      });

    this.schedulingService.schedulingForm
      .get(SchedulingFormControls.SELECTED_DAY)
      ?.valueChanges.subscribe((date) => {
        console.log('date', date);
        if (this.schedulingService.timeSlots.get(date)) {
          this.setAvailabilityConfiguration(
            this.schedulingService.availability(),
            parseDate(date)
          );
        }
      });
  }

  ngOnInit() {
    this.setCalendarConfiguration();
    this.setAppointmentTypeConfiguration();
  }

  setCalendarConfiguration() {
    this.calendarConfigurationObject = {
      title: 'Escolha uma data:',
      control: this.schedulingService.schedulingForm.get(
        SchedulingFormControls.SELECTED_DAY
      ) as FormControl,
      calendarType: CalendarType.SCHEDULING,
    };
  }

  setAvailabilityConfiguration(
    availability: AvailabilityModel[],
    selectedDate: Date
  ): void {
    const filteredAvailability =
      this.schedulingService.filterAvailabilityForDay(
        availability,
        selectedDate
      );

    this.availabilityConfigurationObject = {
      title: 'Escolha uma disponibilidade:',
      selectedDate: parseDate(
        this.schedulingService.schedulingForm.get(
          SchedulingFormControls.SELECTED_DAY
        )?.value
      ).toLocaleDateString('pt-PT'),
      control: this.schedulingService.schedulingForm.get(
        SchedulingFormControls.SELECTED_DAY
      ) as FormControl,
      availability: filteredAvailability,
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

  selectTherapist(professional: ProfessionalModel | null): void {
    if (professional) {
      this.schedulingService.schedulingForm
        .get(SchedulingFormControls.SELECTED_PROFESSIONAL)
        ?.setValue(professional);
    } else {
      this.schedulingService.schedulingForm
        .get(SchedulingFormControls.SELECTED_PROFESSIONAL)
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

  trackById = (index: number, item: ProfessionalModel) => item.id;

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

  bookAppointment(availabilityType: AvailabilityType) {
    availabilityType;
    this.schedulingService.schedulingForm
      .get(SchedulingFormControls.SELECTED_TYPE)
      ?.setValue(availabilityType);
    const payload = this.schedulingService.getAppointmentPayload();
    console.log(payload);
    this.apiService.setAppointment(payload);
  }

  handleScheduleButton() {
    this.apiService.sendEmail(
      this.subject?.nativeElement.value,
      this.body?.nativeElement.value
    );
    console.log(
      'Subject:',
      this.body?.nativeElement.value,
      'Body:',
      this.body?.nativeElement.value
    );
  }

  getProfessionalPicture(): string {
    return '';
  }
}
