import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';

@Component({
  selector: 'app-fullscreen-menu',
  imports: [ CommonModule],
  templateUrl: './fullscreen-menu.component.html',
  styleUrl: './fullscreen-menu.component.scss',
  animations: [
    trigger('menuAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('400ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class FullscreenMenuComponent {
  isMenuOpen = false;
  protected readonly Pages = Pages;

  constructor(public navigationService: NavigationService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
    this.toggleMenu();
  }
}
