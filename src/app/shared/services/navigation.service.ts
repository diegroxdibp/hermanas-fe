import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Pages } from '../enums/pages.enum';
import { NavigationItem } from '../models/navigation-item.model';
import { ViewportScroller } from '@angular/common';
import { BehaviorSubject, filter } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  router = inject(Router);
  viewportScroller = inject(ViewportScroller);
  snackbarService = inject(SnackbarService);
  Pages = Pages;
  navigationItems: NavigationItem[] = [
    { name: 'Home', destination: Pages.HOME },
    { name: 'Sobre', destination: Pages.ABOUT },
    { name: 'Contato', destination: Pages.CONTACT },
    { name: 'Disponibilidade', destination: Pages.AVAILABILITY },
    { name: 'Agendar', destination: Pages.SCHEDULING },
    { name: 'Disponibilidade', destination: Pages.AVAILABILITY },
  ];
  private routesWithAnchor = [`/${Pages.ATENDIMENTO}`, '/', '/contact'];
  readonly currentUrl: BehaviorSubject<string> = new BehaviorSubject('/');

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.next(event.url);

        // Only scroll to top if it's NOT a routesWithAnchor
        if (this.isRouteWithAnchor(event.url)) {
          setTimeout(() => {
            this.viewportScroller.scrollToPosition([0, 0]);
          }, 50);
        }
      });
  }

  isRouteWithAnchor(url: string): boolean {
    const cleanUrl = url.split(/[?#]/)[0]; // remove ?query and #fragment
    return this.routesWithAnchor.some(
      (route) => cleanUrl === route || cleanUrl.startsWith(route)
    );
  }

  navigateTo(page: Pages): void {
    this.snackbarService.closeSnackbar();
    this.router.navigate([page]);
  }
}
