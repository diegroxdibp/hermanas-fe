import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from '../../../core/services/form.service';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { CountryModel } from '../../models/country.model';
import { Countries } from '../../../../assets/countries';
import { Genders } from '../../enums/genders.enum';
import { OnboardingResponse } from '../../models/onboarding-response.model';
import { getBrowserCountry } from '../../utils/browser-country.util';
import { CountryPhoneFieldComponent } from '../country-phone-field/country-phone-field.component';
import { StyledSelectComponent, StyledSelectOption } from '../styled-select/styled-select.component';
import { BirthdateCalendarComponent } from '../birthdate-calendar/birthdate-calendar.component';

@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule, CountryPhoneFieldComponent, StyledSelectComponent, BirthdateCalendarComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly countries = Countries;
  readonly genders = Object.values(Genders);
  error: string | null = null;

  readonly countryOptions: StyledSelectOption[] = Countries.map(c => ({
    value: c.code,
    label: c.namePt,
    meta: `+${c.InternationalAreaCode}`,
  }));

  readonly genderOptions: StyledSelectOption[] = Object.values(Genders).map(g => ({
    value: g,
    label: g,
  }));

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

  readonly selectedCountry = signal<CountryModel>(getBrowserCountry());

  ngOnInit(): void {
    const initial = getBrowserCountry();
    this.selectedCountry.set(initial);
    this.formService.onboardingForm.reset({
      [FormControlsNames.PHONE_PREFIX]: initial,
    });
  }

  onCountryChange(code: string): void {
    const c = Countries.find(x => x.code === code);
    if (c) {
      this.selectedCountry.set(c);
    }
  }

  onPhonePrefixChange(country: CountryModel): void {
    this.formService.onboardingForm.get(FormControlsNames.PHONE_PREFIX)?.setValue(country);
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
