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
    email: new FormControl(
      '',
      this.contactDetailsRequired ? [Validators.required, Validators.email] : [Validators.email],
    ),
    telefone: new FormControl('', this.contactDetailsRequired ? [Validators.required] : []),
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
    return !!(control?.invalid && control?.touched);
  }

  // Maps ContactRequestDTO's backend validation messages back onto the
  // matching form control, so a server-side rejection (e.g. a phone number
  // that passes client-side checks but fails the backend's stricter
  // libphonenumber validation) still shows up as a red/invalid field,
  // not just as a floating error message.
  private static readonly SERVER_ERROR_MARKERS: ReadonlyArray<[string, string]> = [
    ['nome', 'nome é obrigatório'],
    ['email', 'email inválido'],
    ['telefone', 'telefone inválido'],
    ['assunto', 'assunto é obrigatório'],
    ['mensagem', 'mensagem é obrigatória'],
  ];

  private markServerErrors(message: string): void {
    const lower = message.toLowerCase();
    for (const [field, marker] of ContactComponent.SERVER_ERROR_MARKERS) {
      if (lower.includes(marker)) {
        const control = this.form.get(field);
        control?.setErrors({ server: true });
        control?.markAsTouched();
      }
    }
  }

  private buildPhoneNumber(): string | null {
    const raw = (this.form.get('telefone')?.value ?? '').replace(/\D/g, '');
    if (!raw) return null;
    return '+' + this.phonePrefixCountry.InternationalAreaCode + raw;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

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
          const message: string = err.error?.error ?? 'Não foi possível enviar a mensagem. Tente novamente.';
          this.error = message;
          this.markServerErrors(message);
        },
      });
  }

  goToScheduling(): void {
    this.navigationService.navigateTo(Pages.SCHEDULING);
  }
}
