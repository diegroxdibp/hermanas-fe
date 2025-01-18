import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  Pages = Pages;
  constructor(public navigationService: NavigationService) {}
}
