import { Component } from '@angular/core';
import { MobileMenuSheetComponent } from '../mobile-menu-sheet/mobile-menu-sheet.component';

@Component({
  selector: 'app-fullscreen-menu',
  imports: [MobileMenuSheetComponent],
  templateUrl: './fullscreen-menu.component.html',
  styleUrl: './fullscreen-menu.component.scss',
})
export class FullscreenMenuComponent {
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
