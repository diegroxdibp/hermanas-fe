import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from '../../../core/services/form.service';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { NavigationService } from '../../services/navigation.service';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { CountryModel, defaultCountry } from '../../models/country.model';
import { Countries } from '../../../../assets/countries';
import { Genders } from '../../enums/genders.enum';
import { OnboardingResponse } from '../../models/onboarding-response.model';

@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  readonly navigationService = inject(NavigationService);

  readonly countries = Countries;
  readonly genders = Object.values(Genders);
  readonly maxBirthdate = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10); })();
  readonly minDate = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().slice(0, 10);
  error: string | null = null;

  get nameCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.NAME) as FormControl;
  }

  get birthdateCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.BIRTHDATE) as FormControl;
  }

  get genderCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.GENDER) as FormControl;
  }

  get phoneCtrl(): FormControl {
    return this.formService.onboardingForm.get(FormControlsNames.PHONE) as FormControl;
  }

  get selectedCountry(): CountryModel {
    return (
      (this.formService.onboardingForm.get(FormControlsNames.PHONE_PREFIX)?.value as CountryModel) ??
      defaultCountry
    );
  }

  ngOnInit(): void {
    this.formService.onboardingForm.reset({
      [FormControlsNames.PHONE_PREFIX]: defaultCountry,
    });
  }

  onCountryChange(code: string): void {
    const c = Countries.find(x => x.code === code);
    if (c) {
      this.formService.onboardingForm.get(FormControlsNames.PHONE_PREFIX)?.setValue(c);
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    this.error = null;
    try {
      const payload = this.formService.onboardingPayload();
      this.userService.onboarding(payload).subscribe({
        next: (res: OnboardingResponse) => {
          this.sessionService.updateUser(res);
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.error = err.error?.error ?? 'Erro ao guardar perfil. Tente novamente.';
        },
      });
    } catch (e: any) {
      this.error = e.message ?? 'Dados inválidos.';
    }
  }
}
