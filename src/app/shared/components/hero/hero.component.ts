import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  ViewChild,
} from '@angular/core';
import { NavigationBarService } from '../../services/navigation-bar.service';
import { AppConstants } from '../../../app-constants';
import { NavbarBackground } from '../../enums/navbar-background.enum';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  standalone: true,
})
export class HeroComponent {
  @HostBinding('style.height') get background(): string {
    return this.getHeroHeight();
  }
  @ViewChild('heroImage') heroImage: ElementRef | undefined;

  // Keep track of scroll position
  scrollPosition = 0;
  private lastScrollPosition = 0;
  private animationFrame: number | null = null;
  heroImageLoaded: boolean = false;
  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => {
        this.updateParallax();
        this.animationFrame = null;
      });
    }
  }
  @ViewChild('typedText') typedText: ElementRef | undefined;

  phrases = [
    'Ressignificação',
    'Saúde Relacional',
    'Cuidado',
    'Transformação',
  ];

  phraseIndex = 0;
  charIndex = 0;
  isDeleting = false;

  // 🔧 FIX: Use arrow function to preserve 'this' context
  type = () => {
    const currentPhrase = this.phrases[this.phraseIndex];
    const currentText = currentPhrase.substring(0, this.charIndex);

    if (this.typedText) {
      this.typedText.nativeElement.textContent = currentText;

      if (!this.isDeleting && this.charIndex < currentPhrase.length) {
        // Typing forward
        this.charIndex++;
        setTimeout(this.type, 100);
      } else if (this.isDeleting && this.charIndex > 0) {
        // Deleting backward
        this.charIndex--;
        setTimeout(this.type, 60);
      } else {
        // Switching between typing and deleting
        this.isDeleting = !this.isDeleting;
        if (!this.isDeleting) {
          // Move to next phrase
          this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        }
        // Pause before next action
        setTimeout(this.type, this.isDeleting ? 500 : 2000);
      }
    }
  };
  constructor(
    private router: Router,
    private navService: NavigationService,
  ) {}

  ngOnInit() {
    this.updateParallax();
    setTimeout(() => {
      this.type();
    }, 500);
  }

  imageLoaded() {
    console.log('Loaded!');
    this.heroImageLoaded = true;
  }

  getHeroHeight(): string {
    if (
      AppConstants.navigation.background === NavbarBackground.Transparent ||
      this.router.url === '/'
    )
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

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
