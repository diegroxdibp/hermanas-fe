import { Component, HostBinding } from '@angular/core';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { AppConstants } from '../../../app-constants';
import { NavbarBackground } from '../../enums/navbar-background.enum';
import { ScreenSizeService } from '../../services/screen-size.service';
import { FullscreenMenuComponent } from '../fullscreen-menu/fullscreen-menu.component';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [FullscreenMenuComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  Pages = Pages;
  @HostBinding('style.position') position = this.navbarPosition();
  @HostBinding('style.background') background = this.navbarBackground();
  constructor(
    public navbarService: NavigationBarService,
    public screenSizeService: ScreenSizeService,
    public navigationService: NavigationService
  ) {}

  navbarPosition(): string {
    return AppConstants.navigation.background === NavbarBackground.Transparent
      ? 'fixed'
      : 'auto';
  }
  navbarBackground(): string {
    return AppConstants.navigation.background;
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
