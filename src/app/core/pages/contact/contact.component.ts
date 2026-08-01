import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation.service';
import { SessionService } from '../../../shared/services/session.service';
import { ApiService } from '../../services/api.service';
import { Pages } from '../../../shared/enums/pages.enum';
import { CountryModel } from '../../../shared/models/country.model';
import { Countries } from '../../../../assets/countries';
import { getBrowserCountry } from '../../../shared/utils/browser-country.util';
import { CountryPhoneFieldComponent } from '../../../shared/components/country-phone-field/country-phone-field.component';
import { StyledSelectComponent, StyledSelectOption } from '../../../shared/components/styled-select/styled-select.component';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, RouterLink, CountryPhoneFieldComponent, StyledSelectComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly sessionService = inject(SessionService);
  private readonly apiService = inject(ApiService);

  readonly isAuthenticated = this.sessionService.isAuthenticated;
  readonly countries = Countries;
  readonly Pages = Pages;

  readonly countryOptions: StyledSelectOption[] = Countries.map(c => ({
    value: c.code,
    label: c.namePt,
    meta: `+${c.InternationalAreaCode}`,
  }));

  selectedCountry: CountryModel = getBrowserCountry();
  phonePrefixCountry: CountryModel = this.selectedCountry;
  sent = false;
  sending = false;
  error: string | null = null;

  form = new FormGroup({
    nome: new FormControl('', Validators.required),
    email: new FormControl(''),
    telefone: new FormControl(''),
    assunto: new FormControl('', Validators.required),
    mensagem: new FormControl('', Validators.required),
  });

  constructor(private navigationService: NavigationService) {}

  get contactDetailsRequired(): boolean {
    return !this.isAuthenticated();
  }

  get telefoneCtrl(): FormControl {
    return this.form.get('telefone') as FormControl;
  }

  onCountryChange(code: string): void {
    const c = Countries.find(x => x.code === code);
    if (c) this.selectedCountry = c;
  }

  onPhonePrefixChange(country: CountryModel): void {
    this.phonePrefixCountry = country;
  }

  isError(field: string): boolean {
    const control = this.form.get(field);
    if (field === 'email' || field === 'telefone') {
      return this.contactDetailsRequired && !!control?.touched && !control?.value;
    }
    return !!(control?.invalid && control?.touched);
  }

  private buildPhoneNumber(): string | null {
    const raw = (this.form.get('telefone')?.value ?? '').replace(/\D/g, '');
    if (!raw) return null;
    return '+' + this.phonePrefixCountry.InternationalAreaCode + raw;
  }

  submit(): void {
    this.form.markAllAsTouched();
    const detailsMissing =
      this.contactDetailsRequired &&
      (!this.form.get('email')?.value || !this.form.get('telefone')?.value);
    if (this.form.invalid || detailsMissing) return;

    const { nome, email, assunto, mensagem } = this.form.value;
    this.error = null;
    this.sending = true;

    const user = this.sessionService.user();

    this.apiService
      .sendContactMessage({
        name: nome ?? '',
        email: this.contactDetailsRequired ? email ?? null : user?.email ?? null,
        phone: this.contactDetailsRequired ? this.buildPhoneNumber() : user?.phone ?? null,
        subject: assunto ?? '',
        message: mensagem ?? '',
      })
      .subscribe({
        next: () => {
          this.sending = false;
          this.sent = true;
          setTimeout(() => {
            this.sent = false;
            this.form.reset();
          }, 3200);
        },
        error: (err) => {
          this.sending = false;
          this.error = err.error?.error ?? 'Não foi possível enviar a mensagem. Tente novamente.';
        },
      });
  }

  goToScheduling(): void {
    this.navigationService.navigateTo(Pages.SCHEDULING);
  }
}
