import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormService } from '../../../core/services/form.service';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../auth/auth.service';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { CountryModel, defaultCountry } from '../../models/country.model';
import { Countries } from '../../../../assets/countries';
import { Genders } from '../../enums/genders.enum';
import { UpdateProfilePayload } from '../../models/update-profile-payload.model';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { User } from '../../../auth/user.model';
import {getEnumKeyByValue} from '../../utils/getEnumKeyByValue';

@Component({
  selector: 'app-dashboard-profile',
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './dashboard-profile.component.html',
  styleUrl: './dashboard-profile.component.scss',
})
export class DashboardProfileComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly countries = Countries;
  readonly genders = Object.values(Genders);
  readonly maxBirthdate = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10); })();
  readonly minDate = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().slice(0, 10);
  readonly user = this.sessionService.user;

  readonly userInitials = computed(() => {
    const parts = (this.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly saveSuccess = signal(false);
  saveError: string | null = null;

  get nameCtrl(): FormControl {
    return this.formService.profileForm.get(FormControlsNames.NAME_PROFILE) as FormControl;
  }

  get emailCtrl(): FormControl {
    return this.formService.profileForm.get(FormControlsNames.EMAIL_PROFILE) as FormControl;
  }

  get birthdateCtrl(): FormControl {
    return this.formService.profileForm.get(FormControlsNames.BIRTHDATE_PROFILE) as FormControl;
  }

  get genderCtrl(): FormControl {
    return this.formService.profileForm.get(FormControlsNames.GENDER_PROFILE) as FormControl;
  }

  get phoneCtrl(): FormControl {
    return this.formService.profileForm.get(FormControlsNames.PHONE_PROFILE) as FormControl;
  }

  get selectedCountry(): CountryModel {
    const v = this.formService.profileForm.get(FormControlsNames.PHONE_PREFIX_PROFILE)?.value;
    return (v && typeof v === 'object' ? v : defaultCountry) as CountryModel;
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => this.patchForm(user),
    });
  }

  private patchForm(user: User): void {
    const { country, localNumber } = this.parsePhone(user.phone ?? '');
    const genderValue = user.gender
      ? (Genders[(user.gender as unknown) as keyof typeof Genders] ?? user.gender)
      : '';
    this.formService.profileForm.patchValue({
      [FormControlsNames.NAME_PROFILE]: user.name ?? '',
      [FormControlsNames.EMAIL_PROFILE]: user.email ?? '',
      [FormControlsNames.BIRTHDATE_PROFILE]: user.birthDate?.slice(0, 10) ?? '',
      [FormControlsNames.GENDER_PROFILE]: genderValue,
      [FormControlsNames.BIO_PROFILE]: user.bio ?? '',
      [FormControlsNames.PHONE_PREFIX_PROFILE]: country,
      [FormControlsNames.PHONE_PROFILE]: localNumber,
    });
    this.formService.profileForm.enable();
  }

  private parsePhone(phone: string): { country: CountryModel; localNumber: string } {
    if (!phone.startsWith('+')) return { country: defaultCountry, localNumber: phone };
    const digits = phone.slice(1);
    const sorted = [...Countries].sort(
      (a, b) => String(b.InternationalAreaCode).length - String(a.InternationalAreaCode).length
    );
    for (const c of sorted) {
      const code = String(c.InternationalAreaCode);
      if (digits.startsWith(code)) {
        return { country: c, localNumber: digits.slice(code.length) };
      }
    }
    return { country: defaultCountry, localNumber: phone };
  }

  onCountryChange(code: string): void {
    const c = Countries.find(x => x.code === code);
    if (c) {
      this.formService.profileForm.get(FormControlsNames.PHONE_PREFIX_PROFILE)?.setValue(c);
    }
  }

  save(): void {
    this.saveError = null;
    const country = this.selectedCountry;
    const rawPhone = (this.phoneCtrl.value ?? '').replace(/\D/g, '');
    const phone = rawPhone ? `+${country.InternationalAreaCode}${rawPhone}` : '';

    const payload: UpdateProfilePayload = {
      name: this.nameCtrl.value ?? '',
      email: this.emailCtrl.value ?? '',
      birthDate: this.birthdateCtrl.value ?? '',
      phone,
      gender: getEnumKeyByValue(Genders, this.genderCtrl.value) as Genders,
      bio: this.formService.profileForm.get(FormControlsNames.BIO_PROFILE)?.value ?? '',
    };

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        this.saveError = err.error?.error ?? 'Erro ao guardar. Tente novamente.';
      },
    });
  }

  cancel(): void {
    const user = this.user();
    if (user) this.patchForm(user);
  }

  openDeleteDialog(): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '440px',
      panelClass: 'care-dialog',
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteAccount().subscribe({
          next: () => this.authService.logout(),
          error: () => {},
        });
      }
    });
  }
}
