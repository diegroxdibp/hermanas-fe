import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../auth.service';
import { Pages } from '../../shared/enums/pages.enum';
import { NavigationService } from '../../shared/services/navigation.service';
import { FormControlsNames } from '../../shared/enums/form-controls-names.enum';
import { AppConstants } from '../../app-constants';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly formService = inject(FormService);
  readonly navigationService = inject(NavigationService);

  readonly Pages = Pages;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  registered = false;

  readonly confirmPasswordCtrl = new FormControl('');
  readonly agreeTermsCtrl = new FormControl(false);

  get emailCtrl(): FormControl {
    return this.formService.authForm.get(FormControlsNames.EMAIL) as FormControl;
  }

  get passwordCtrl(): FormControl {
    return this.formService.authForm.get(FormControlsNames.PASSWORD) as FormControl;
  }

  get pwd(): string {
    return this.passwordCtrl?.value ?? '';
  }

  get passwordRules() {
    const p = this.pwd;
    return [
      { ok: p.length >= 8, label: 'Mínimo de 8 caracteres' },
      { ok: /[A-Z]/.test(p), label: 'Pelo menos 1 letra maiúscula' },
      { ok: /[0-9]/.test(p), label: 'Pelo menos 1 número' },
      { ok: /[^a-zA-Z0-9]/.test(p), label: 'Pelo menos 1 carácter especial' },
    ];
  }

  get passwordsMismatch(): boolean {
    const confirm = this.confirmPasswordCtrl.value ?? '';
    return confirm.length > 0 && confirm !== this.pwd;
  }

  get canSubmit(): boolean {
    return (
      this.emailCtrl?.valid &&
      this.passwordRules.every(r => r.ok) &&
      this.confirmPasswordCtrl.value === this.pwd &&
      !!this.agreeTermsCtrl.value
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /** Trava cliques repetidos: o segundo criava a conta duas vezes e voltava com
   * "já existe uma conta com este email" para uma conta acabada de criar. */
  submitting = false;

  signUp(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit || this.submitting) return;
    this.error = null;
    this.submitting = true;
    this.authService.signUp(this.formService.signUpPayload()).subscribe({
      next: () => {
        this.submitting = false;
        this.registered = true;
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error ?? 'Erro ao criar conta. Tente novamente.';
      },
    });
  }

  signUpWithGoogle(event: Event): void {
    event.preventDefault();
    window.location.href = AppConstants.apiEndpoints.loginWithGoogle;
  }
}
