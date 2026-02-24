import { Component, inject, Input } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';

@Component({
  selector: 'logo-horizontal',
  imports: [],
  templateUrl: './logo-horizontal.component.html',
  styleUrl: './logo-horizontal.component.scss',
})
export class LogoHorizontalComponent {
  readonly navigationService = inject(NavigationService);
  @Input() hasHomeNavigation: boolean = false;

  navigateToHome() {
    if (this.hasHomeNavigation) {
      this.navigationService.navigateTo(Pages.HOME);
    }
  }
}
