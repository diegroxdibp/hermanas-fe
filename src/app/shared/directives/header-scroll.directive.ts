import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { NavigationService } from '../services/navigation.service';

@Directive({
  selector: '[appHeaderScroll]',
})
export class HeaderScrollDirective {
  @Input() heroHeight: string = '100vh';
  @Input() backgroundColor: string = '#ffffff';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    public navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.setInitialPosition();
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  private setInitialPosition() {
  }

  private checkScroll() {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    const isHeroPage = document.querySelector('.hero-section') !== null;
    const headerHeight = this.el.nativeElement.offsetHeight;

    if (isHeroPage) {
      // For pages with hero section
      const heroHeight = this.convertVhToPx(this.heroHeight);
      const triggerPosition = heroHeight - headerHeight;

      if (scrollPosition >= triggerPosition) {
        this.addBackground();
      } else {
        this.removeBackground();
      }
    } else {
      // For pages without hero section
      if (scrollPosition > headerHeight) {
        this.addBackground();
      } else {
        this.removeBackground();
      }
    }
  }

  private convertVhToPx(vh: string): number {
    const value = parseInt(vh);
    return (value * window.innerHeight) / 100;
  }

  private addBackground() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.backgroundColor
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.3s ease'
    );
  }

  private removeBackground() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      'transparent'
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.3s ease'
    );
  }
}
