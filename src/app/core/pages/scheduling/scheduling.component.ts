import { ApiService } from './../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

import { take, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AvailabilitiesComponent } from '../../../shared/components/availabilities/availabilities.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { CalendarType } from '../../../shared/enums/calendar-type.enum';
import { Modality } from '../../../shared/enums/modality.enum';
import { Pages } from '../../../shared/enums/pages.enum';
import { ProfessionalSessionService } from '../../../shared/enums/professional-session-service.enum';
import { SchedulingFormControls } from '../../../shared/enums/scheduling-form-controls.enum';
import { SchedulingSteps } from '../../../shared/enums/scheduling-steps.enum';
import { AvailabilityModel } from '../../../shared/models/availability.model';
import { Professional } from '../../../shared/models/get-professional-by-service-response.model';
import { emptyAvailabilityConfiguration } from '../../../shared/models/input-configuration-objects/availability-configuration-object';
import { AvailabilitySelectionOutputObject } from '../../../shared/models/input-configuration-objects/availability-selection-output-object';
import { CalendarConfigurationObject, emptyCalendarConfiguration } from '../../../shared/models/input-configuration-objects/calendar-configuration-object';
import { RadioInputConfigurationObject, emptyRadioInputConfiguration } from '../../../shared/models/input-configuration-objects/radio-input-configuration-object';
import { ProfessionalService } from '../../../shared/models/professional-service.model';
import { EnumValuePipe } from '../../../shared/pipes/enum-value.pipe';
import { NavigationService } from '../../../shared/services/navigation.service';
import { SchedulingService } from '../../../shared/services/scheduling.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { parseDate } from '../../../shared/utils/date-helper.util';
import { LoadingService } from '../../services/loading.service';

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
    ScrollAnimateDirective,
  ],
  templateUrl: './scheduling.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnInit, OnDestroy {
  readonly navigationService = inject(NavigationService);
  readonly snackbarService = inject(SnackbarService);
  readonly loader = inject(LoadingService);

  @ViewChild('body') body: ElementRef | undefined;
  @ViewChild('subject') subject: ElementRef | undefined;

  calendarConfigurationObject: CalendarConfigurationObject =
    emptyCalendarConfiguration;
  appointmentTypeConfiguration: RadioInputConfigurationObject =
    emptyRadioInputConfiguration;
  allowedRecurringDays: Set<number> = new Set();
  allowedSpecificDates: Date[] = [];
  availability: AvailabilityModel[] = [];
  SchedulingFormControls = SchedulingFormControls;
  ProfessionalSessionService = ProfessionalSessionService;
  renderKey = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    public schedulingService: SchedulingService,
  ) {
    this.apiService
      .getServices()
      .pipe(take(1))
      .subscribe((services: ProfessionalService[]) => {
        this.schedulingService.services = services;
      }); // Load services

    const serviceControl =
      this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_SERVICE
      ];

    const serviceSub = serviceControl.valueChanges.subscribe(
      (selectedService: ProfessionalService | null) => {
        this.schedulingService.clearChainedRelatedFields(
          SchedulingSteps.SERVICE_SELECTION,
        );

        this.renderKey++;

        if (selectedService) {
          this.apiService
            .getProfessionalByService(selectedService.id)
            .pipe(take(1))
            .subscribe((professionals: Professional[]) => {
              this.schedulingService.professionals = professionals;
            });
        }
      },
    );
    this.subscriptions.push(serviceSub);

    const professionalControl =
      this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_PROFESSIONAL
      ];

    const professionalSub = professionalControl.valueChanges.subscribe(
      (selectedProfessional: Professional | null) => {
        this.schedulingService.clearChainedRelatedFields(
          SchedulingSteps.PROFESSIONAL_SELECTION,
        );

        this.renderKey++;

        this.schedulingService.availabilityConfiguration.set(
          emptyAvailabilityConfiguration,
        );

        if (selectedProfessional) {
          this.apiService
            .getAvailabilitiesByProfessionalId(selectedProfessional.id)
            .pipe(take(1))
            .subscribe((availabilities: AvailabilityModel[]) => {
              this.schedulingService.setAvailabilitites(availabilities);
            });
        }
      },
    );
    this.subscriptions.push(professionalSub);

    // When date is selected, filter availabilities for that day
    const dateControl =
      this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_DAY
      ];

    const dateSub = dateControl.valueChanges.subscribe(
      (date: string | null) => {
        this.schedulingService.clearChainedRelatedFields(
          SchedulingSteps.DATE_SELECTION,
        );

        this.renderKey++;

        this.schedulingService.availabilityConfiguration.set(
          emptyAvailabilityConfiguration,
        );

        if (date) {
          const slots = this.schedulingService.timeSlots.get(date);

          if (slots && slots.length > 0) {
            this.setAvailabilityConfiguration(
              this.schedulingService.availability(),
              parseDate(date),
            );
          } else {
            this.schedulingService.availabilityConfiguration.set({
              ...emptyAvailabilityConfiguration,
              title: 'Nenhuma disponibilidade encontrada para esta data',
              selectedDate: parseDate(date).toLocaleDateString('pt-PT'),
            });
          }
        }
      },
    );
    this.subscriptions.push(dateSub);

    const availabilityControl =
      this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_AVAILABILITY
      ];

    const availabilitySub = availabilityControl.valueChanges.subscribe(() => {
      this.schedulingService.clearChainedRelatedFields(
        SchedulingSteps.AVAILABILITY_SELECTION,
      );
      this.renderKey++;
    });
    this.subscriptions.push(availabilitySub);
  }

  ngOnInit() {
    this.setCalendarConfiguration();
    this.setAppointmentTypeConfiguration();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get selectedProfessional(): Professional | null {
    return this.schedulingService.schedulingForm.controls[
      SchedulingFormControls.SELECTED_PROFESSIONAL
    ].value;
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

    const availabilityConfigurationObject = {
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

    this.schedulingService.availabilityConfiguration.set(
      availabilityConfigurationObject,
    );
  }

  setAppointmentTypeConfiguration() {
    this.appointmentTypeConfiguration = {
      title: 'Escolha um tipo de atendimento:',
      control:
        this.schedulingService.schedulingForm.controls[
        SchedulingFormControls.SELECTED_MODALITY
        ],
      listOfOptions: Object.values(Modality),
    };
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
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 2) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    input.value = value;
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
    this.apiService.setAppointment(payload).subscribe((response) => {
      this.navigationService.navigateTo(Pages.DASHBOARD_SCHEDULE);
      this.snackbarService.openSnackBar({
        message: 'Agendamento realizado com sucesso!',
      });
    });
  }

  getProfessionalPicture(): string {
    return '';
  }

  compareProfessionals(a: Professional, b: Professional): boolean {
    return a?.id === b?.id;
  }
}
