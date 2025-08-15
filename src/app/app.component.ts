import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderScrollDirective } from './shared/directives/header-scroll.directive';
import { NavigationBarService } from './shared/services/navigation-bar.service';
import { NavigationService } from './shared/services/navigation.service';
import { ScreenSizeService } from './shared/services/screen-size.service';
import { Pages } from './shared/enums/pages.enum';
import { FullscreenMenuComponent } from './shared/components/fullscreen-menu/fullscreen-menu.component';
import { CommonModule } from '@angular/common';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    HeaderScrollDirective,
    FullscreenMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  title = 'hermanas-fe';
  fixedHeader = true;
  heroHeight: string = '100vh';
  backgroundColor: string = 'white';
  @ViewChild('header') el!: ElementRef;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.navigationService.currentUrl.value === '/') {
      this.checkScroll();
    }
  }

  constructor(
    public navbarService: NavigationBarService,
    public screenSizeService: ScreenSizeService,
    public navigationService: NavigationService,
    private renderer: Renderer2
  ) {
    this.navigationService.currentUrl.subscribe((url: string) => {
      console.log(url);
      if (url === '/') {
        console.log('entrou true');

        this.fixedHeader = true;
        this.backgroundColor = 'transparent';
      } else {
        console.log('entrou false');

        this.fixedHeader = false;
        this.backgroundColor = 'white';
      }
    });
  }

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
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'white');
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
