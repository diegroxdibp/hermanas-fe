import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NavigationBarService } from '../../../shared/services/navigation-bar.service';
import { ScreenSizeService } from '../../../shared/services/screen-size.service';
import { FullscreenMenuComponent } from '../../../shared/components/fullscreen-menu/fullscreen-menu.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { Pages } from '../../../shared/enums/pages.enum';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LogoHorizontalComponent } from "../../../shared/components/logo-horizontal/logo-horizontal.component";
import { SessionService } from '../../../shared/services/session.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationResponse } from '../../../shared/models/notification.types';

@Component({
  selector: 'app-header',
  imports: [
    FullscreenMenuComponent,
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    LogoHorizontalComponent,
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
  readonly notificationsService = inject(NotificationService);
  readonly renderer = inject(Renderer2);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  private readonly user = this.sessionService.user;

  readonly userInitials = computed(() => {
    const parts = (this.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly firstName = computed(() => this.user()?.name?.split(' ')[0] ?? '');
  readonly userEmail = computed(() => this.user()?.email ?? '');

  readonly currentUrl = toSignal(this.navigationService.currentUrl, { initialValue: '/' });

  isActive(destination: Pages): boolean {
    const url = this.currentUrl();
    if (destination === Pages.HOME) return url === '/' || url === '';
    return url === `/${destination}` || url.startsWith(`/${destination}/`);
  }

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

  onNotifClick(n: NotificationResponse): void {
    if (!n.read) {
      this.notificationsService.markAsRead(n.id).subscribe();
    }
    this.router.navigate(['/dashboard', 'notifications']);
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe();
  }

  goToNotifications(): void {
    this.router.navigate(['/dashboard', 'notifications']);
  }

  relativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `há ${diffD} dia${diffD !== 1 ? 's' : ''}`;
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
