import { Component, effect, inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/components/header/header.component';
import { LoadingService } from './core/services/loading.service';
import { FooterComponent } from './core/components/footer/footer.component';
import { NotificationService } from './core/services/notification.service';
import { SessionService } from './shared/services/session.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  title = 'CARE - Clínica Ampliada Resignificações';
  loader = inject(LoadingService);
  router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly sessionService = inject(SessionService);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loader.setRouteLoading(true);
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loader.setRouteLoading(false);
      }
    });

    effect(() => {
      if (this.sessionService.user()?.profileCompleted) {
        this.notificationService.connect();
      } else {
        this.notificationService.disconnect();
      }
    });
  }
}
