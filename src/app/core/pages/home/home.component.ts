import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { HeroComponent } from '../../../shared/components/hero/hero.component';
import { MarqueeTrackComponent } from '../../../shared/components/marquee-track/marquee-track.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Pages } from '../../../shared/enums/pages.enum';
import { AppConstants } from '../../../app-constants';
import { Router } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation.service';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    ScrollAnimateDirective,
    CarouselModule,
    MarqueeTrackComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    // Expand / Collapse for service-box
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: 0,
          overflow: 'hidden',
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden',
        }),
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),

    // Rotate for arrow
    trigger('rotateArrow', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class HomeComponent {
  readonly router: Router = inject(Router);
  readonly routes: Router = inject(Router);
  readonly navigationService: NavigationService = inject(NavigationService);
  AppConstants = AppConstants;
  // Using an object instead of an array to track expanded state
  expandedItems: { [key: string]: boolean } = {};
  Pages = Pages;

  ngAfterViewInit() {
    const url = this.router.url;

    const routeSectionMap: { [key: string]: string } = {
      [`/${Pages.ATENDIMENTO}`]: 'atendimento',
      '/about': 'about',
      '/contact': 'contact',
    };

    const sectionId = routeSectionMap[url];
    if (sectionId) {
      this.intelligentScroll(sectionId);
    }
  }

  private intelligentScroll(sectionId: string) {
    // First, wait for all content to load
    this.waitForPageLoad().then(() => {
      // Then wait for the specific element and scroll
      this.waitForElementAndScroll(sectionId);
    });
  }

  private waitForPageLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        // Already loaded
        resolve();
      } else {
        // Wait for load event
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });
  }

  private waitForElementAndScroll(sectionId: string, maxAttempts: number = 30) {
    let attempts = 0;

    const checkForElement = () => {
      const element = document.getElementById(sectionId);

      if (element) {
        // Element found - wait a bit more for layout to settle, then scroll
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 200);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkForElement, 150); // Check every 150ms
      } else {
        console.warn(
          `Element with id '${sectionId}' not found after ${maxAttempts} attempts`,
        );
      }
    };

    checkForElement();
  }
  toggleItem(itemId: string) {
    // Toggle only the specific item
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
