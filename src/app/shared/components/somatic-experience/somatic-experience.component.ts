import { Component } from '@angular/core';
import { Pages } from '../../enums/pages.enum';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-somatic-experience',
  imports: [],
  templateUrl: './somatic-experience.component.html',
  styleUrl: './somatic-experience.component.scss',
})
export class SomaticExperienceComponent {
  constructor(public navigationService: NavigationService) {}
  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
