import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
} from '@angular/core';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { ScreenSizeService } from '../../services/screen-size.service';
import { FullscreenMenuComponent } from '../fullscreen-menu/fullscreen-menu.component';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [FullscreenMenuComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }
  Pages = Pages;
  heroHeight: string = '100vh';
  backgroundColor: string = '#ffffff';
  constructor(
    public navbarService: NavigationBarService,
    public screenSizeService: ScreenSizeService,
    public navigationService: NavigationService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
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
