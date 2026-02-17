import { AvailabilityModel } from './../../models/availability.model';
import { SchedulingService } from './../../services/scheduling.service';
import { ApiService } from './../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import {
  CalendarConfigurationObject,
  emptyCalendarConfiguration,
} from '../../models/input-configuration-objects/calendar-configuration-object';
import { AvailabilitiesComponent } from '../availabilities/availabilities.component';
import {
  AvailabilityConfigurationObject,
  emptyAvailabilityConfiguration,
} from '../../models/input-configuration-objects/availability-configuration-object';
import { take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { CalendarType } from '../../enums/calendar-type.enum';
import { parseDate } from '../../utils/date-helper.util';
import { MatIcon } from '@angular/material/icon';
import { LoadingService } from '../../../core/services/loading.service';
import { ProfessionalService } from '../../models/professional-service.model';
import { Professional } from '../../models/get-professional-by-service-response.model';
import { AvailabilitySelectionOutputObject } from '../../models/input-configuration-objects/availability-selection-output-object';
import { SchedulingFormControls } from '../../enums/scheduling-form-controls.enum';
import { Modality } from '../../enums/modality.enum';
import { ProfessionalSessionService } from '../../enums/professional-session-service.enum';
import { EnumValuePipe } from '../../pipes/enum-value.pipe';

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
    EnumValuePipe,
  ],
  templateUrl: './scheduling.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnInit {
  loader = inject(LoadingService);
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
  ProfessionalSessionService = ProfessionalSessionService;

  constructor(
    private apiService: ApiService,
    public schedulingService: SchedulingService,
  ) {
    this.apiService
      .getServices()
      .pipe(take(1))
      .subscribe((services: ProfessionalService[]) => {
        console.log('Services:', services);
        this.schedulingService.services = services;
      });

    this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_SERVICE
    ].valueChanges.subscribe((selectedService: ProfessionalService | null) => {
      if (selectedService) {
        this.apiService
          .getProfessionalbyService(selectedService.id)
          .pipe(take(1))
          .subscribe((professionals: Professional[]) => {
            this.schedulingService.professionals = professionals;
          });
      }
    });

    this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_PROFESSIONAL
    ]?.valueChanges.subscribe((selectedProfessional: Professional | null) => {
      if (selectedProfessional) {
        this.apiService
          .getAvailabilititesByProfessionalId(selectedProfessional.id)
          .pipe(take(1))
          .subscribe((availabilities: AvailabilityModel[]) => {
            this.schedulingService.setAvailabilitites(availabilities);
          });
      }
    });

    this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_DAY
    ]?.valueChanges.subscribe((date: string | null) => {
      if (date && this.schedulingService.timeSlots.get(date)) {
        this.setAvailabilityConfiguration(
          this.schedulingService.availability(),
          parseDate(date),
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
      control:
        this.schedulingService.schedulingForm.controls[
          SchedulingFormControls.SELECTED_DAY
        ],
      calendarType: CalendarType.SCHEDULING,
    };
  }

  setAvailabilityConfiguration(
    availability: AvailabilityModel[],
    selectedDate: Date,
  ): void {
    const filteredAvailability =
      this.schedulingService.filterAvailabilityForDay(
        availability,
        selectedDate,
      );

    this.availabilityConfigurationObject = {
      title: 'Escolha uma disponibilidade:',
      selectedDate: parseDate(
        this.schedulingService.schedulingForm.controls[
          SchedulingFormControls.SELECTED_DAY
        ].value!,
      ).toLocaleDateString('pt-PT'),
      control:
        this.schedulingService.schedulingForm.controls[
          SchedulingFormControls.SELECTED_DAY
        ],
      availability: filteredAvailability,
    };
  }

  setAppointmentTypeConfiguration() {
    this.appointmentTypeConfiguration = {
      title: 'Escolha uma tipe de atendimento:',
      control:
        this.schedulingService.schedulingForm.controls[
          SchedulingFormControls.SELECTED_MODALITY
        ],
      listOfOptions: Object.values(Modality),
    };
  }

  selectService(service: ProfessionalService | null): void {
    if (service) {
      this.schedulingService.schedulingForm.controls[
        SchedulingFormControls.SELECTED_SERVICE
      ]?.setValue(service);
    } else {
      this.schedulingService.schedulingForm.controls[
        SchedulingFormControls.SELECTED_SERVICE
      ]?.setValue(null);
    }
  }

  selectTherapist(professional: Professional | null): void {
    if (professional) {
      this.schedulingService.schedulingForm.controls[
        SchedulingFormControls.SELECTED_PROFESSIONAL
      ]?.setValue(professional);
    } else {
      this.schedulingService.schedulingForm.controls[
        SchedulingFormControls.SELECTED_PROFESSIONAL
      ]?.setValue(null);
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
        allowed.getDate() === date.getDate(),
    );
  };

  trackByName = (index: number, item: any) => item.name;

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

  bookAppointment(availabilityOutputObject: AvailabilitySelectionOutputObject) {
    this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_MODALITY
    ].setValue(availabilityOutputObject.modality);
    this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_AVAILABILITY
    ]?.setValue(availabilityOutputObject.availability);
    const payload = this.schedulingService.getAppointmentPayload();
    console.log(payload);
    this.apiService.setAppointment(payload);
  }

  getProfessionalPicture(): string {
    return '';
  }
}
