import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation.service';
import { Pages } from '../../../shared/enums/pages.enum';
import { LogoHorizontalComponent } from '../../../shared/components/logo-horizontal/logo-horizontal.component';

@Component({
  selector: 'app-footer',
  imports: [LogoHorizontalComponent, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: true,
})
export class FooterComponent {
  private readonly navigationService = inject(NavigationService);
  readonly Pages = Pages;

  navigateTo(page: Pages, fragment?: string): void {
    this.navigationService.navigateTo(page, fragment);
  }
}
