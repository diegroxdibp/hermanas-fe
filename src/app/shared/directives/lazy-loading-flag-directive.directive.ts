import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';
import { fromEvent, debounceTime } from 'rxjs';

@Directive({
  selector: '[appLazyLoadingFlagDirective]',
  standalone: true,
})
export class LazyLoadingFlagDirective implements AfterViewInit {
  @Input() appLazyLoadingFlagDirective!: string;
  private observer!: IntersectionObserver;

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const scrollableContainer = this.getScrollableParent(this.el.nativeElement);

    if (scrollableContainer) {
      const target =
        scrollableContainer instanceof Window ? window : scrollableContainer;
      fromEvent(scrollableContainer, 'scroll')
        .pipe(debounceTime(100))
        .subscribe(() => this.lazyLoadItems(target));
    }
    this.setupIntersectionObserver();
  }

  lazyLoadItems(container: HTMLElement | Window): void {
    const element = this.el.nativeElement as HTMLElement;

    if (container instanceof HTMLElement) {
      if (this.isInView(container, element)) {
        this.loadFlag(element);
      }
    } else if (container === window) {
      if (this.isInViewPort(element)) {
        this.loadFlag(element);
      }
    }
  }

  getScrollableParent(element: HTMLElement): HTMLElement | Window {
    let parent = element.parentElement;

    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }

    return window;
  }

  setupIntersectionObserver(): void {
    const element = this.el.nativeElement as HTMLElement;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadFlag(element);
        }
      });
    });

    this.observer.observe(element);
  }

  loadFlag(element: HTMLElement): void {
    this.renderer.addClass(element, this.appLazyLoadingFlagDirective);
    this.observer.unobserve(element);
  }

  isInView(container: HTMLElement, element: HTMLElement): boolean {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return (
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom &&
      elementRect.left >= containerRect.left &&
      elementRect.right <= containerRect.right
    );
  }

  isInViewPort(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight &&
      rect.right <= windowWidth
    );
  }
}
