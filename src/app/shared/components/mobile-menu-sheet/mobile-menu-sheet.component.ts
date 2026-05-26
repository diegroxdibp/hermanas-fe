import { Component, computed, effect, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { SessionService } from '../../services/session.service';
import { ScreenSizeService } from '../../services/screen-size.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Pages } from '../../enums/pages.enum';

interface NavRow {
  label: string;
  icon: string;
  page: Pages;
  showBadge?: boolean;
  ariaLabel?: string;
}

@Component({
  selector: 'app-mobile-menu-sheet',
  imports: [MatIconModule],
  templateUrl: './mobile-menu-sheet.component.html',
  styleUrl: './mobile-menu-sheet.component.scss',
})
export class MobileMenuSheetComponent {
  private readonly ref = inject(MatBottomSheetRef<MobileMenuSheetComponent>);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly screenSizeService = inject(ScreenSizeService);
  readonly navigationService = inject(NavigationService);
  readonly navbarService = inject(NavigationBarService);
  readonly notificationService = inject(NotificationService);
  readonly Pages = Pages;

  constructor() {
    // Auto-dismiss when the viewport expands to tablet or desktop.
    effect(() => {
      if (this.screenSizeService.isTablet() || this.screenSizeService.isDesktop()) {
        this.ref.dismiss();
      }
    });
  }

  private readonly user = this.sessionService.user;

  readonly userInitials = computed(() => {
    const parts = (this.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly userName = computed(() => this.user()?.name ?? '');
  readonly userEmail = computed(() => this.user()?.email ?? '');

  readonly publicRows: NavRow[] = [
    { label: 'Home',    icon: 'home',           page: Pages.HOME },
    { label: 'Sobre',   icon: 'info',           page: Pages.ABOUT },
    { label: 'Contato', icon: 'mail',           page: Pages.CONTACT },
    { label: 'Agendar', icon: 'calendar_today', page: Pages.SCHEDULING },
  ];

  readonly userRows: NavRow[] = [
    {
      label: 'Notificações',
      icon: 'notifications',
      page: Pages.DASHBOARD,
      showBadge: true,
      ariaLabel: 'Notificações',
    },
    { label: 'Conta', icon: 'person', page: Pages.DASHBOARD_PROFILE },
  ];

  go(page: Pages): void {
    this.navigationService.navigateTo(page);
    this.ref.dismiss();
  }

  signIn(): void {
    this.navigationService.navigateTo(Pages.SIGN_IN);
    this.ref.dismiss();
  }

  logout(): void {
    this.authService.logout();
    this.ref.dismiss();
  }

  close(): void {
    this.ref.dismiss();
  }
}
