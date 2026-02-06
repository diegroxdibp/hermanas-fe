import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { ScreenSizeService } from '../../services/screen-size.service';
import { FullscreenMenuComponent } from '../fullscreen-menu/fullscreen-menu.component';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [
    FullscreenMenuComponent,
    CommonModule,
    MatIcon,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly navbarService = inject(NavigationBarService);
  readonly screenSizeService = inject(ScreenSizeService);
  readonly navigationService = inject(NavigationService);
  readonly renderer = inject(Renderer2);

  fixedHeader = true;
  heroHeight: string = '100vh';
  backgroundColor: string = 'white';
  isHomePage: boolean = true;
  @ViewChild('header') el!: ElementRef;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  constructor() {
    this.navigationService.currentUrl.subscribe((url: string) => {
      if (url === '/') {
        this.isHomePage = true;
        this.fixedHeader = true;
        this.backgroundColor = 'transparent';
      } else {
        this.isHomePage = false;
        this.backgroundColor = 'white';
      }
    });
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }

  logOut(): void {
    this.authService.logout();
  }

  private checkScroll() {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    const isHeroPage = document.querySelector('.hero-section') !== null;
    const headerHeight = this.el.nativeElement.offsetHeight;

    if (isHeroPage) {
      // For pages with hero section
      const heroHeight = this.convertVhToPx(this.heroHeight);
      const triggerPosition = heroHeight - headerHeight;

      if (scrollPosition >= triggerPosition) {
        this.addBackground();
      } else {
        this.removeBackground();
      }
    } else {
      // For pages without hero section
      if (scrollPosition > headerHeight) {
        this.addBackground();
      } else {
        this.removeBackground();
      }
    }
  }

  private convertVhToPx(vh: string): number {
    const value = parseInt(vh);
    return (value * window.innerHeight) / 100;
  }

  private addBackground() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'white');
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.3s ease',
    );
  }

  private removeBackground() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      'transparent',
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.3s ease',
    );
  }
}
