import { SnackbarService } from './../shared/services/snackbar.service';
import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { User } from './user.model';
import { SessionService } from '../shared/services/session.service';
@Injectable({ providedIn: 'root' })
export class AccessGuard {
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private snackbarService = inject(SnackbarService);

  canMatch(): boolean | UrlTree {
    const user: User | null = this.sessionService.user();
    if (!user) {
      this.snackbarService.openSnackBar({
        message: 'Para acessar essa area é preciso fazer Sign In primeiro!',
      });
      return this.router.createUrlTree(['/auth/signin']);
    }

    if (user && !user.profileCompleted) {
      this.snackbarService.openSnackBar({
        message: 'Para acessar essa area é preciso fazer completar o On Boarding primeiro!',
      });
      return this.router.createUrlTree(['/onboarding']);
    }

    return true;
  }
}
