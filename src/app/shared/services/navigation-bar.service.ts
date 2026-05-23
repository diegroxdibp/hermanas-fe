import { computed, inject, Injectable, signal } from '@angular/core';
import { AppConstants } from '../../app-constants';
import { NavbarBackground } from '../enums/navbar-background.enum';
import { AuthService } from '../../auth/auth.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationBarService {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  isColapsed = signal<boolean>(false);
  navbarHeight = signal<number>(NavigationBarService.getNavbarHeight());
  navbarBackground = AppConstants.navigation.background;
  background = signal<NavbarBackground>(NavbarBackground.White);
  position = signal<'auto' | 'fixed'>('auto');

  readonly showAuthLinks = computed(
    () =>
      this.authService.initialized() && !this.sessionService.isAuthenticated()
  );

  readonly showUserMenu = computed(
    () =>
      this.authService.initialized() && this.sessionService.isAuthenticated()
  );
  static getNavbarHeight(): number {
    if (AppConstants.navigation.background === NavbarBackground.Transparent)
      return 0;
    else return AppConstants.navigation.height;
  }

  setTransparentFixed() {
    this.background.set(NavbarBackground.Transparent);
    this.position.set('fixed');
    console.log('Bg', this.background(), 'Pos', this.position());
  }

  resetDefault() {
    this.background.set(NavbarBackground.White);
    this.position.set('auto');
    console.log('Bg', this.background(), 'Pos', this.position());
  }
}
