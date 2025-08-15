import { Injectable, signal } from '@angular/core';
import { AppConstants } from '../../app-constants';
import { NavbarBackground } from '../enums/navbar-background.enum';

@Injectable({
  providedIn: 'root',
})
export class NavigationBarService {
  isColapsed = signal<boolean>(false);
  navbarHeight = signal<number>(NavigationBarService.getNavbarHeight());
  navbarBackground = AppConstants.navigation.background;
  authentication = AppConstants.authentication.exists;
  background = signal<NavbarBackground>(NavbarBackground.White);
  position = signal<'auto' | 'fixed'>('auto');
  constructor() {}

  static getNavbarHeight(): number {
    if (AppConstants.navigation.background === NavbarBackground.Transparent)
      return 0;
    else return AppConstants.navigation.height;
  }

  setTransparentFixed() {
    this.background.set(NavbarBackground.Transparent);
    this.position.set('fixed');
    console.log('Bg',this.background(),'Pos', this.position())
  }

  resetDefault() {
    this.background.set(NavbarBackground.White);
    this.position.set('auto');
        console.log('Bg',this.background(),'Pos', this.position())
  }
}
