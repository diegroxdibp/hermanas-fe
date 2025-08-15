import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Pages } from '../enums/pages.enum';
import { NavigationItem } from '../models/navigation-item.model';
import { Location } from '@angular/common';
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
  ];

  readonly currentUrl: BehaviorSubject<string> = new BehaviorSubject('/');

  constructor(private router: Router, private location: Location) {
    // 1) Initial URL detection (sync, no waiting for Router)
    // const raw = this.location.path();
    // const normalized = raw ? (raw.startsWith('/') ? raw : `/${raw}`) : '/';
    // this._currentUrl.set(normalized);

    // 2) Listen for navigation completion
    this.router.events.subscribe((event: any) => {
      console.log('url:', event.url);
      this.currentUrl.next(event.url);
    });
  }

  navigateTo(page: Pages): void {
    this.router.navigate([page]);
  }
}
