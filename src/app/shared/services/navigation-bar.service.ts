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
  constructor() {}

  static getNavbarHeight(): number {
    if(AppConstants.navigation.background === NavbarBackground.Transparent) return 0
    else return AppConstants.navigation.height;
  }
}
