import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { HeroComponent } from '../../../shared/components/hero/hero.component';
import { MarqueeTrackComponent } from '../../../shared/components/marquee-track/marquee-track.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { Pages } from '../../../shared/enums/pages.enum';
import { AppConstants } from '../../../app-constants';
import { NavigationService } from '../../../shared/services/navigation.service';
import { FaqComponent } from '../../../shared/components/faq/faq.component';
import { ServicesListComponent } from '../../../shared/components/services-list/services-list.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    CommonModule,
    MatExpansionModule,
    ScrollAnimateDirective,
    MarqueeTrackComponent,
    ServicesListComponent,
    FaqComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',

})
export class HomeComponent {
  readonly navigationService: NavigationService = inject(NavigationService);
  AppConstants = AppConstants;

  ngAfterViewInit() {
    const url = this.navigationService.router.url;

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
}
