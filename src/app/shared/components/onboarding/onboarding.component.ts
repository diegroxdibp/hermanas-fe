import { SessionService } from './../../services/session.service';
import { UserService } from './../../services/user.service';
import { Component, inject } from '@angular/core';
import { Pages } from '../../enums/pages.enum';
import { finalize } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppConstants } from '../../../app-constants';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { FormService } from '../../../core/services/form.service';
import { CalendarComponent } from '../calendar/calendar.component';
import {
  CalendarConfigurationObject,
  emptyCalendarConfiguration,
} from '../../models/input-configuration-objects/calendar-configuration-object';
import { CalendarType } from '../../enums/calendar-type.enum';
import {
  DropDownConfigurationObject,
  emptyDropDownConfigurationObject,
} from '../../models/input-configuration-objects/drop-down-configuration-object';
import { DropDownComponent } from '../drop-down/drop-down.component';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { Genders } from '../../enums/genders.enum';
import { TextInputComponent } from '../text-input/text-input.component';
import {
  emptyTextInputConfigurationObject,
  TextInputConfigurationObject,
} from '../../models/input-configuration-objects/text-input-configuration-object';
import { InputType } from '../../enums/input-type.enum';
import { OnboardingResponse } from '../../models/onboarding-response.model';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-onboarding',
  imports: [
    ReactiveFormsModule,
    CalendarComponent,
    PhoneInputComponent,
    DropDownComponent,
    TextInputComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  private readonly formService = inject(FormService);
  private readonly sessionService = inject(SessionService);
  readonly userService = inject(UserService);
  private readonly loaderService = inject(LoadingService);
  private readonly router = inject(Router);
  public readonly navigationService = inject(NavigationService);
  nameConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  birthDateConfigurationObject: CalendarConfigurationObject =
    emptyCalendarConfiguration;

  genderConfigurationObject: DropDownConfigurationObject =
    emptyDropDownConfigurationObject;

  error: any;
  phoneControl = new FormControl('');

  ngOnInit(): void {
    this.setConfiguration();
  }

  setConfiguration(): void {
    this.nameConfigurationObject = {
      inputType: InputType.TEXT,
      title: AppConstants.authentication.nameInputTitle,
      placeHolder: 'Bruxo Voador da Silva',
      control: this.formService.onboardingForm.get(
        FormControlsNames.NAME,
      ) as FormControl,
    };

    this.birthDateConfigurationObject = {
      title: AppConstants.authentication.emailInputTitle,
      calendarType: CalendarType.BIRTHDATE,
      control: this.formService.onboardingForm.get(
        FormControlsNames.BIRTHDATE,
      ) as FormControl,
    };

    this.genderConfigurationObject = {
      label: 'Gênero',
      control: this.formService.onboardingForm.get(
        FormControlsNames.GENDER,
      ) as FormControl,
      values: Object.values(Genders),
    };
  }

  submitOnboarding(event: Event) {
    event.preventDefault();

    this.error = null;
    console.log(this.formService.onboardingPayload());
    this.userService
      .onboarding(this.formService.onboardingPayload())
      .subscribe({
        next: (userPartial: OnboardingResponse) => {
          this.sessionService.updateUser(userPartial);
          console.log('User', this.sessionService.user());
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          if (err.status === 401) {
            this.error = err.error?.error ?? 'Error on Onboarding!';
          }
        },
      });
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
