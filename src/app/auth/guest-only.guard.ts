import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SessionService } from '../shared/services/session.service';

@Injectable({ providedIn: 'root' })
export class GuestOnlyGuard {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  canMatch(): boolean | UrlTree {
    const user = this.sessionService.user();

    if (user) {
      return this.router.createUrlTree(['/dashboard']);
    }

    return true;
  }
}
