import { Component } from '@angular/core';
import { Pages } from '../../enums/pages.enum';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-supervision',
  imports: [],
  templateUrl: './supervision.component.html',
  styleUrl: './supervision.component.scss',
})
export class SupervisionComponent {
  constructor(public navigationService: NavigationService) {}
  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
