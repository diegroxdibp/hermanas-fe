import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AppConstants } from '../../app-constants';
import { FormService } from '../../core/services/form.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { InputType } from '../../shared/enums/input-type.enum';
import { Logo } from '../../shared/enums/logo.enum';
import { emptyLogoConfigurationObject } from '../../shared/models/input-configuration-objects/logo-configuration-object';
import {
  TextInputConfigurationObject,
  emptyTextInputConfigurationObject,
} from '../../shared/models/input-configuration-objects/text-input-configuration-object';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LoaderService } from '../../core/services/loader.service';
import { Pages } from '../../shared/enums/pages.enum';
import { NavigationService } from '../../shared/services/navigation.service';
import { FormControlsNames } from '../../shared/enums/form-controls-names.enum';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TextInputComponent, LogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly formService = inject(FormService);
  private readonly loaderService = inject(LoaderService);
  private readonly router = inject(Router);
  public readonly navigationService = inject(NavigationService);

  emailConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  passwordConfigurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  googleButtonConfigurationObject = emptyLogoConfigurationObject;
  error: any;

  constructor() {}
  ngOnInit(): void {
    console.log(this.formService.authForm);
    this.setConfiguration();
  }

  setConfiguration(): void {
    this.emailConfigurationObject = {
      inputType: InputType.EMAIL,
      title: AppConstants.authentication.emailInputTitle,
      placeHolder: 'Example@email.com',
      control: this.formService.authForm.get(
        FormControlsNames.EMAIL
      ) as FormControl,
    };

    this.passwordConfigurationObject = {
      inputType: InputType.PASSWORD,
      title: AppConstants.authentication.passwordInputTitle,
      control: this.formService.authForm.get(
        FormControlsNames.PASSWORD
      ) as FormControl,
    };

    this.googleButtonConfigurationObject = {
      name: Logo.GOOGLE,
    };
  }

  signIn(event: Event) {
    event.preventDefault();
    this.loaderService.startLoader();

    this.error = null;

    this.authService
      .signIn(this.formService.signInPayload())
      .pipe(
        finalize(() => {
          this.loaderService.stopLoader();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.status === 401) {
            this.error = err.error?.error ?? 'Invalid email or password!';
          }
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
function showError(arg0: string) {
  throw new Error('Function not implemented.');
}
