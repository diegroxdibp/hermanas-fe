import {
  CountryModel,
  defaultCountry,
} from './../../shared/models/country.model';
import { Genders } from './../../shared/enums/genders.enum';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SchedulingFormControls } from '../../shared/enums/scheduling-form-controls.enum';
import { TherapistModel } from '../../shared/models/therapist.model';
import { AvailabilityModel } from '../../shared/models/availability.model';
import { AppointmentType } from '../../shared/enums/appointment-type.enum';
import { FormControlsNames } from '../../shared/enums/form-controls-names.enum';
import { SignInPayload } from '../../shared/models/sign-in-payload';
import { SignUpPayload } from '../../shared/models/sign-up-payload';
import { BehaviorSubject } from 'rxjs';
import { getEnumKeyByValue } from '../../shared/utils/getEnumKeyByValue';
import { OnboardingPayload } from '../../shared/models/onboarding-payload.model';
import { ProfileView } from '../../shared/models/profile-view.model';
import { User } from '../../auth/user.model';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  authForm: FormGroup;
  onboardingForm: FormGroup;
  profileForm: FormGroup;
  schedulingForm: FormGroup;
  availability: AvailabilityModel[] = [];
  timeSlots = new Map<string, string[]>();
  therapists: TherapistModel[] = [];

  currentCountryPhone: BehaviorSubject<CountryModel> =
    new BehaviorSubject<CountryModel>(defaultCountry);

  passwordRules = {
    minLength: 8,
    maxLength: 128,
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    digit: /\d/,
    specialChar: /[\W_]/,
  };

  constructor(private readonly fb: FormBuilder) {
    this.authForm = this.fb.group({
      [FormControlsNames.EMAIL]: this.fb.control('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ]),
      [FormControlsNames.PASSWORD]: this.fb.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
      ]),
    });

    this.onboardingForm = this.fb.group({
      [FormControlsNames.NAME]: this.fb.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
      ]),
      [FormControlsNames.BIRTHDATE]: this.fb.control('', [Validators.required]),
      [FormControlsNames.PHONE_PREFIX]:
        this.fb.control<CountryModel>(defaultCountry),
      [FormControlsNames.PHONE]: this.fb.control(''),
      [FormControlsNames.GENDER]: this.fb.control(''),
    });

    this.profileForm = this.fb.group({
      [FormControlsNames.NAME_PROFILE]: this.fb.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
      ]),
      [FormControlsNames.EMAIL_PROFILE]: this.fb.control('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ]),
      [FormControlsNames.BIRTHDATE_PROFILE]: this.fb.control('', [
        Validators.required,
      ]),
      [FormControlsNames.PHONE_PREFIX_PROFILE]:
        this.fb.control<CountryModel>(defaultCountry),
      [FormControlsNames.PHONE_PROFILE]: this.fb.control(''),
      [FormControlsNames.GENDER_PROFILE]: this.fb.control(''),
      [FormControlsNames.BIO_PROFILE]: this.fb.control(''),
    });

    this.schedulingForm = this.fb.group({
      [SchedulingFormControls.CLIENT_ID]: this.fb.control(0, [
        Validators.required,
      ]),
      [SchedulingFormControls.SELECTED_DAY]: this.fb.control('', [
        Validators.required,
      ]),
      [SchedulingFormControls.SELECTED_TIME_SLOT]: this.fb.control('', [
        Validators.required,
      ]),
      [SchedulingFormControls.SELECTED_THERAPIST]:
        this.fb.control<TherapistModel | null>(null, [Validators.required]),
      selectedType: this.fb.control<AppointmentType>(AppointmentType.ANY, [
        Validators.required,
      ]),
    });
  }

  signUp() {}

  signInPayload(): SignInPayload {
    const payload = {
      email: this.authForm.get(FormControlsNames.EMAIL)?.value,
      password: this.authForm.get(FormControlsNames.PASSWORD)?.value,
    };
    return payload;
  }

  signUpPayload(): SignUpPayload {
    const payload = {
      email: this.authForm.get(FormControlsNames.EMAIL)?.value,
      password: this.authForm.get(FormControlsNames.PASSWORD)?.value,
    };
    return payload;
  }

  onboardingPayload(): OnboardingPayload {
    const name = this.onboardingForm.get(FormControlsNames.NAME)?.value;

    const gender = getEnumKeyByValue(
      Genders,
      this.onboardingForm.get(FormControlsNames.GENDER)?.value
    );
    const birthDate = this.onboardingForm.get(FormControlsNames.BIRTHDATE)?.value;
    const phone = this.buildPhoneNumber();

    if (!name) {
      throw new Error('Invalid name!');
    }
    if (!birthDate) {
      throw new Error('Invalid birth date!');
    }
    if (!phone) {
      throw new Error('Invalid phone!');
    }

    if (!gender) {
      throw new Error('Invalid gender');
    }

    const payload: OnboardingPayload = {
      name,
      birthDate,
      phone,
      gender: gender,
    };

    return payload;
  }

  buildPhoneNumber(): string {
    const country: CountryModel = this.onboardingForm.get(
      FormControlsNames.PHONE_PREFIX
    )?.value;
    let phoneNumber = this.onboardingForm.get(FormControlsNames.PHONE)?.value;

    if (country.code === 'br' && phoneNumber.length == 10)
      phoneNumber = phoneNumber.slice(0, 2) + '9' + phoneNumber.slice(2);
    return '+' + country.InternationalAreaCode + phoneNumber;
  }

  fillProfileFields(profileData: User): void {
    console.log(profileData);
    this.profileForm
      .get(FormControlsNames.NAME_PROFILE)
      ?.setValue(profileData.name);

    this.profileForm
      .get(FormControlsNames.EMAIL_PROFILE)
      ?.setValue(profileData.email);

    this.profileForm
      .get(FormControlsNames.BIRTHDATE_PROFILE)
      ?.setValue(profileData.birthDate);

    this.profileForm
      .get(FormControlsNames.PHONE_PREFIX_PROFILE)
      ?.setValue('55');

    this.profileForm
      .get(FormControlsNames.PHONE_PROFILE)
      ?.setValue(profileData.phone);

    this.profileForm
      .get(FormControlsNames.GENDER_PROFILE)
      ?.setValue(profileData.gender);

    this.profileForm
      .get(FormControlsNames.BIO_PROFILE)
      ?.setValue(profileData.bio);

    this.profileForm.updateValueAndValidity();
    console.log(this.profileForm.get(FormControlsNames.NAME_PROFILE)?.value);
  }
}
