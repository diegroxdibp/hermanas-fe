import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Pages } from '../../shared/enums/pages.enum';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-confirm-email',
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly navigationService = inject(NavigationService);

  readonly Pages = Pages;
  readonly token = this.route.snapshot.queryParamMap.get('token');
  readonly resendEmailCtrl = new FormControl('', [Validators.required, Validators.email]);

  loading = true;
  success = false;
  error: string | null = null;

  resendLoading = false;
  resendSent = false;
  resendError: string | null = null;

  ngOnInit(): void {
    if (!this.token) {
      this.loading = false;
      return;
    }

    this.authService.confirmEmail({ token: this.token }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/auth/signin']), 2500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error ?? 'Não foi possível confirmar a conta. Tente novamente.';
      },
    });
  }

  resend(event: Event): void {
    event.preventDefault();
    if (this.resendEmailCtrl.invalid) {
      this.resendEmailCtrl.markAsTouched();
      return;
    }

    this.resendError = null;
    this.resendLoading = true;
    this.authService.resendConfirmation({ email: this.resendEmailCtrl.value ?? '' }).subscribe({
      next: () => {
        this.resendLoading = false;
        this.resendSent = true;
      },
      error: (err) => {
        this.resendLoading = false;
        this.resendError = err.error?.error ?? 'Não foi possível enviar o email. Tente novamente.';
      },
    });
  }
}
