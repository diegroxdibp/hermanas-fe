import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private destroyRef = inject(DestroyRef);
  
  // Screen size breakpoints (you can adjust these)
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly TABLET_BREAKPOINT = 1024;

  // Signals for different screen sizes
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(false);

  constructor() {
    // Initialize on service creation
    this.checkScreenSize();

    // Listen to window resize events
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200), // Debounce to avoid too many updates
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.checkScreenSize();
      });
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;

    this.isMobile.set(width < this.MOBILE_BREAKPOINT);
    this.isTablet.set(width >= this.MOBILE_BREAKPOINT && width < this.TABLET_BREAKPOINT);
    this.isDesktop.set(width >= this.TABLET_BREAKPOINT);
  }
}
