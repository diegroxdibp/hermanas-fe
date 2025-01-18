import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Pages } from '../enums/pages.enum';
import { NavigationItem } from '../models/navigation-item.model';

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

  constructor(private router: Router) {}

  navigateTo(page: Pages): void {
    this.router.navigate([page]);
  }
}
