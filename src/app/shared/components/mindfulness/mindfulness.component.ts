import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mindfulness',
  imports: [MatButtonModule],
  templateUrl: './mindfulness.component.html',
  styleUrl: './mindfulness.component.scss',
})
export class MindfulnessComponent {
  constructor(public navigationService: NavigationService) {}
  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
