import { Component, inject, OnInit } from '@angular/core';
import { TextInputComponent } from '../text-input/text-input.component';
import {
  emptyTextInputConfigurationObject,
  TextInputConfigurationObject,
} from '../../models/input-configuration-objects/text-input-configuration-object';
import { InputType } from '../../enums/input-type.enum';
import { AppConstants } from '../../../app-constants';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { FormControl } from '@angular/forms';
import { FormatType } from '../../enums/format-type.enum';
import { FormService } from '../../../core/services/form.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-dashboard-profile',
  imports: [TextInputComponent],
  templateUrl: './dashboard-profile.component.html',
  styleUrl: './dashboard-profile.component.scss',
})
export class DashboardProfileComponent implements OnInit {
  readonly formService = inject(FormService);
  readonly sessionService = inject(SessionService);

  nameConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;
  emailConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;
  birthDateConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;
  phoneDateConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;
  genderConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;
  bioConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  ngOnInit() {
    this.setConfiguration();
  }

  setConfiguration(): void {
    this.nameConfigurationObject = {
      inputType: InputType.TEXT,
      title: AppConstants.authentication.nameInputTitle,
      placeHolder: 'Bruxo Voador da Silva',
      disabled: true,
      control: this.formService.profileForm.get(
        FormControlsNames.NAME_PROFILE
      ) as FormControl,
    };

    this.emailConfigurationObject = {
      inputType: InputType.EMAIL,
      title: AppConstants.authentication.emailInputTitle,
      placeHolder: 'sample@email.com',
      disabled: true,
      control: this.formService.profileForm.get(
        FormControlsNames.EMAIL_PROFILE
      ) as FormControl,
    };

    this.birthDateConfigurationObject = {
      inputType: InputType.TEXT,
      title: AppConstants.authentication.birthdateTitle,
      disabled: true,
      formatType: FormatType.DATE,
      control: this.formService.profileForm.get(
        FormControlsNames.BIRTHDATE_PROFILE
      ) as FormControl,
    };

    this.genderConfigurationObject = {
      inputType: InputType.TEXT,
      title: AppConstants.authentication.genderTitle,
      disabled: true,
      formatType: FormatType.GENDER,
      control: this.formService.profileForm.get(
        FormControlsNames.GENDER_PROFILE
      ) as FormControl,
    };

    this.bioConfigurationObject = {
      inputType: InputType.TEXT,
      title: AppConstants.authentication.bioTitle,
      control: this.formService.profileForm.get(
        FormControlsNames.BIO_PROFILE
      ) as FormControl,
    };
  }
}
