import { Component, HostBinding, HostListener } from '@angular/core';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { AppConstants } from '../../../app-constants';
import { NavbarBackground } from '../../enums/navbar-background.enum';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  standalone: true,
})
export class HeroComponent {
  @HostBinding('style.height') heroHeight = this.getHeroHeight();
  // Keep track of scroll position
  scrollPosition = 0;
  private animationFrame: number | null = null;
  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => {
        this.updateParallax();
        this.animationFrame = null;
      });
    }
  }

  constructor() {}
  private lastScrollPosition = 0;

  ngOnInit() {
    this.updateParallax();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }


  getHeroHeight(): string {
    if (AppConstants.navigation.background === NavbarBackground.Transparent)
      return '100vh';
    else return `calc(100vh - ${NavigationBarService.getNavbarHeight()}px)`;
  }

  private updateParallax() {
    const scrollPosition = window.scrollY;
    const image = document.querySelector('.hero-image') as HTMLElement;
    if (image) {
      const offset = scrollPosition * 0.5;
      image.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    this.lastScrollPosition = scrollPosition;
  }
}
