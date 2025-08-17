import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Pages } from '../enums/pages.enum';
import { NavigationItem } from '../models/navigation-item.model';
import { ViewportScroller } from '@angular/common';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  navigationItems: NavigationItem[] = [
    { name: 'Home', destination: Pages.HOME },
    { name: 'About', destination: Pages.ABOUT },
    { name: 'Contact', destination: Pages.CONTACT },
    { name: 'Scheduling', destination: Pages.SCHEDULING },
    // { name: 'AR', destination: Pages.ANALISE_REICHANA },
  ];
  private routesWithAnchor = [`/${Pages.ATENDIMENTO}`, '/', '/contact'];
  readonly currentUrl: BehaviorSubject<string> = new BehaviorSubject('/');

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {
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
    this.router.navigate([page]);
  }
}
