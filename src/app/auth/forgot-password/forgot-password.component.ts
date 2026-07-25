import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Pages } from '../../shared/enums/pages.enum';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);

  readonly Pages = Pages;
  readonly emailCtrl = new FormControl('', [Validators.required, Validators.email]);

  error: string | null = null;
  sent = false;
  loading = false;

  submit(event: Event): void {
    event.preventDefault();
    if (this.emailCtrl.invalid) {
      this.emailCtrl.markAsTouched();
      return;
    }

    this.error = null;
    this.loading = true;
    this.authService.forgotPassword({ email: this.emailCtrl.value ?? '' }).subscribe({
      next: () => {
        this.loading = false;
        this.sent = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error ?? 'Não foi possível enviar o email. Tente novamente.';
      },
    });
  }
}
