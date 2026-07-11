import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Pages } from '../enums/pages.enum';
import { NavigationItem } from '../models/navigation-item.model';
import { ViewportScroller } from '@angular/common';
import { BehaviorSubject, filter, Subject } from 'rxjs';
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
    { name: 'Home',            destination: Pages.HOME,         icon: 'home' },
    { name: 'Sobre',           destination: Pages.ABOUT,        icon: 'info' },
    { name: 'Contato',         destination: Pages.CONTACT,      icon: 'mail' },
    { name: 'Disponibilidade', destination: Pages.AVAILABILITY, icon: 'calendar_month' },
    { name: 'Agendar',         destination: Pages.SCHEDULING,   icon: 'calendar_today' },
  ];
  private routesWithAnchor = [`/${Pages.ATENDIMENTO}`, '/', '/contact'];
  readonly currentUrl: BehaviorSubject<string> = new BehaviorSubject('/');

  // Emits whenever a link to a section on Home is clicked, even if the
  // Router treats it as a same-URL no-op (e.g. already on '/#faq' and the
  // FAQ link is clicked again). HomeComponent listens for this directly
  // instead of relying on the Router's fragment navigation completing.
  readonly scrollToSectionRequested = new Subject<string>();
  private pendingSection: string | null = null;

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

  navigateTo(page: Pages, fragment?: string): void {
    this.snackbarService.closeSnackbar();
    if (fragment) {
      // Read by HomeComponent on (re)creation, for navigation from another route.
      this.pendingSection = fragment;
    }
    this.router.navigate([page], fragment ? { fragment } : undefined);
    if (fragment) {
      // Also fire directly, for when HomeComponent is already mounted.
      this.scrollToSectionRequested.next(fragment);
    }
  }

  /** Reads and clears the section requested via navigateTo(), if any. */
  consumePendingSection(): string | null {
    const section = this.pendingSection;
    this.pendingSection = null;
    return section;
  }
}
