import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-fullscreen-menu',
  imports: [CommonModule, MatDividerModule],
  templateUrl: './fullscreen-menu.component.html',
  styleUrl: './fullscreen-menu.component.scss',
})
export class FullscreenMenuComponent {
  readonly authService = inject(AuthService);
  navbarService = inject(NavigationBarService);
  navigationService = inject(NavigationService);

  isMenuOpen = false;
  isMenuVisible = false;

  protected readonly Pages = Pages;

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isMenuOpen = true;

    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.isMenuVisible = true;
    });
  }

  closeMenu() {
    this.isMenuVisible = false;

    document.body.style.overflow = 'auto';

    setTimeout(() => {
      this.isMenuOpen = false;
    }, 350);
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
    this.closeMenu();
  }

  logOut(): void {
    this.authService.logout();
    this.closeMenu();
  }
}
