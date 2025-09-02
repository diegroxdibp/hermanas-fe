import { Component } from '@angular/core';
import { Pages } from '../../enums/pages.enum';
import { NavigationService } from '../../services/navigation.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-analise-corporal-reichana',
  imports: [MatButtonModule],
  templateUrl: './analise-corporal-reichana.component.html',
  styleUrl: './analise-corporal-reichana.component.scss',
})
export class AnaliseCorporalReichanaComponent {
  constructor(public navigationService: NavigationService) {}
  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
