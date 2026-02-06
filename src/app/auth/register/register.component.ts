import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppConstants } from '../../app-constants';
import { FormService } from '../../core/services/form.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { FormControlsNames } from '../../shared/enums/form-controls-names.enum';
import { InputType } from '../../shared/enums/input-type.enum';
import { Logo } from '../../shared/enums/logo.enum';
import { emptyLogoConfigurationObject } from '../../shared/models/input-configuration-objects/logo-configuration-object';
import {
  TextInputConfigurationObject,
  emptyTextInputConfigurationObject,
} from '../../shared/models/input-configuration-objects/text-input-configuration-object';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Pages } from '../../shared/enums/pages.enum';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInputComponent, LogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly formService = inject(FormService);
  public readonly navigationService = inject(NavigationService);

  private readonly router = inject(Router);

  emailConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  passwordConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  googleButtonConfigurationObject = emptyLogoConfigurationObject;
  error: any;

  constructor() {}
  ngOnInit(): void {
    this.setConfiguration();
  }

  setConfiguration(): void {
    this.emailConfigurationObject = {
      inputType: InputType.EMAIL,
      title: AppConstants.authentication.emailInputTitle,
      placeHolder: 'Example@email.com',
      control: this.formService.authForm.get(
        FormControlsNames.EMAIL,
      ) as FormControl,
    };

    this.passwordConfigurationObject = {
      inputType: InputType.PASSWORD,
      title: AppConstants.authentication.passwordInputTitle,
      control: this.formService.authForm.get(
        FormControlsNames.PASSWORD,
      ) as FormControl,
      showValidationTips: true,
    };

    this.passwordConfigurationObject = {
      inputType: InputType.PASSWORD,
      title: AppConstants.authentication.passwordInputTitle,
      control: this.formService.authForm.get(
        FormControlsNames.PASSWORD,
      ) as FormControl,
      showValidationTips: true,
    };

    this.googleButtonConfigurationObject = {
      name: Logo.GOOGLE,
    };
  }

  signUp(event: Event) {
    event.preventDefault();

    this.error = null;

    this.authService.signUp(this.formService.signUpPayload()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error ?? 'Signup failed';
      },
    });
  }

  signInWithGoogle(event: Event) {
    event.preventDefault();
    window.location.href = AppConstants.apiEndpoints.loginWithGoogle;
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
