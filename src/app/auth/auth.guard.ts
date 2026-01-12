import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { User } from './user.model';
import { SessionService } from '../shared/services/session.service';
@Injectable({ providedIn: 'root' })
export class AccessGuard {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  canMatch(): boolean | UrlTree {
    const user: User | null = this.sessionService.user();
    if (!user) {
      return this.router.createUrlTree(['/auth/signin']);
    } 

    if (user && !user.profileCompleted) {
      return this.router.createUrlTree(['/onboarding']);
    }

    return true;
  }
}
