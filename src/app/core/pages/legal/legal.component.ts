import { Component, inject, AfterViewInit, OnDestroy, DOCUMENT } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Pages } from '../../../shared/enums/pages.enum';
import { smoothScrollToElement } from '../../../shared/utils/smooth-scroll-to-element';

const FIXED_HEADER_HEIGHT = 70;

@Component({
  selector: 'app-legal',
  imports: [RouterLink],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss',
})
export class LegalPageComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly sub: Subscription;
  private initialized = false;
  readonly Pages = Pages;

  constructor() {
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (this.initialized) {
          this.scrollToSection((e as NavigationEnd).url);
        }
      });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.scrollToSection(this.router.url);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private scrollToSection(url: string): void {
    let sectionId: string | null = null;
    if (url.includes(Pages.TERMOS_USO)) sectionId = 'termos-de-uso';
    else if (url.includes(Pages.POLITICA_PRIVACIDADE)) sectionId = 'politica-de-privacidade';

    if (sectionId) {
      const id = sectionId;
      setTimeout(() => {
        const element = this.document.getElementById(id);
        if (element) {
          smoothScrollToElement(element, FIXED_HEADER_HEIGHT, 1000);
        }
      }, 80);
    }
  }
}
