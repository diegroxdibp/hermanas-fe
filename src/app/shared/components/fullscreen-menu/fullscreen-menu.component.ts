import { Component, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MobileMenuSheetComponent } from '../mobile-menu-sheet/mobile-menu-sheet.component';

@Component({
  selector: 'app-fullscreen-menu',
  imports: [MatBottomSheetModule],
  templateUrl: './fullscreen-menu.component.html',
  styleUrl: './fullscreen-menu.component.scss',
})
export class FullscreenMenuComponent {
  private readonly bottomSheet = inject(MatBottomSheet);
  isMenuOpen = false;

  toggleMenu(): void {
    if (this.isMenuOpen) return;
    this.isMenuOpen = true;
    const ref = this.bottomSheet.open(MobileMenuSheetComponent, {
      panelClass: 'care-menu-sheet',
      backdropClass: 'care-menu-backdrop',
      ariaLabel: 'Menu',
      restoreFocus: true,
    });
    ref.afterDismissed().subscribe(() => { this.isMenuOpen = false; });
  }
}
