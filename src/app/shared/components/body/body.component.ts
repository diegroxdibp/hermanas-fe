import { AppConstants } from './../../../app-constants';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { CommonModule, NgFor } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Pages } from '../../enums/pages.enum';
import { NavigationService } from '../../services/navigation.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';

@Component({
  selector: 'app-body',
  imports: [
    HeroComponent,
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    ScrollAnimateDirective,
    NgFor,
  ],
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss',
  standalone: true,
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
export class BodyComponent implements AfterViewInit {
  AppConstants = AppConstants;
  // Using an object instead of an array to track expanded state
  expandedItems: { [key: string]: boolean } = {};
  Pages = Pages;
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLDivElement>;
  constructor(
    private router: Router,
    public navigationService: NavigationService,
    private zone: NgZone,
  ) {}

  items = [
    {
      title: 'O FUTURO É PARA VOCÊ',
      description: 'Hoje, com uma comunidade forte...',
    },
    { title: 'CRESCIMENTO', description: 'Novas ferramentas...' },
    { title: 'COMUNIDADE', description: 'Estamos juntos...' },
  ];

  slideWidth = 280;
  gap = 20;

  currentIndex = 1;
  isAnimating = false;

  // drag state
  isDragging = false;
  startX = 0;
  currentX = 0;
  animationFrame: any = null;

  get displayItems() {
    return [this.items[this.items.length - 1], ...this.items, this.items[0]];
  }

  /* ---------------- POSITION ---------------- */

  getTranslate(index: number) {
    const offset = (this.slideWidth + this.gap) * index;
    const center = this.slideWidth / 2;
    return -offset + center;
  }

  setPosition(animated = true) {
    const el = this.track.nativeElement;
    const x = this.getTranslate(this.currentIndex);

    el.style.transition = animated
      ? 'transform 400ms cubic-bezier(0.22,1,0.36,1)'
      : 'none';

    el.style.transform = `translate3d(${x}px,0,0)`;
  }

  /* ---------------- NAV ---------------- */

  next() {
    if (this.isAnimating) return;
    this.currentIndex++;
    this.snap();
  }

  prev() {
    if (this.isAnimating) return;
    this.currentIndex--;
    this.snap();
  }

  snap() {
    this.isAnimating = true;
    this.setPosition(true);

    setTimeout(() => {
      this.isAnimating = false;

      // seamless reset (no flicker)
      if (this.currentIndex === this.displayItems.length - 1) {
        this.currentIndex = 1;
        this.setPosition(false);
      }

      if (this.currentIndex === 0) {
        this.currentIndex = this.items.length;
        this.setPosition(false);
      }
    }, 400);
  }

  /* ---------------- DRAG ---------------- */

  startDrag(event: MouseEvent | TouchEvent) {
    if (this.isAnimating) return;

    this.isDragging = true;
    this.startX = this.getX(event);
    this.currentX = this.startX;

    this.track.nativeElement.style.transition = 'none';
  }

  moveDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    this.currentX = this.getX(event);

    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => {
        this.updateDrag();
      });
    }
  }

  updateDrag() {
    const diff = this.currentX - this.startX;
    const base = this.getTranslate(this.currentIndex);

    this.track.nativeElement.style.transform = `translate3d(${base + diff}px,0,0)`;

    this.animationFrame = null;
  }

  endDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;

    const diff = this.currentX - this.startX;

    // threshold to prevent click triggering swipe
    if (Math.abs(diff) > 60) {
      this.currentIndex += diff < 0 ? 1 : -1;
    }

    this.snap();
  }

  getX(event: any) {
    return event.type.includes('mouse')
      ? event.clientX
      : event.touches[0].clientX;
  }

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
    this.setPosition(false);
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
