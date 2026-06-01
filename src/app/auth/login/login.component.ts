import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Pages } from '../../shared/enums/pages.enum';
import { NavigationService } from '../../shared/services/navigation.service';
import { FormControlsNames } from '../../shared/enums/form-controls-names.enum';
import { AppConstants } from '../../app-constants';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly formService = inject(FormService);
  private readonly router = inject(Router);
  readonly navigationService = inject(NavigationService);

  readonly Pages = Pages;
  error: string | null = null;

  get emailCtrl(): FormControl {
    return this.formService.authForm.get(FormControlsNames.EMAIL) as FormControl;
  }

  get passwordCtrl(): FormControl {
    return this.formService.authForm.get(FormControlsNames.PASSWORD) as FormControl;
  }

  signIn(event: Event): void {
    event.preventDefault();
    this.error = null;
    this.authService.signIn(this.formService.signInPayload()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error =
          err.status === 401
            ? (err.error?.error ?? 'Email ou password incorretos.')
            : 'Ocorreu um erro. Tente novamente.';
      },
    });
  }

  signInWithGoogle(event: Event): void {
    event.preventDefault();
    window.location.href = AppConstants.apiEndpoints.loginWithGoogle;
  }
}
