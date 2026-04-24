import { Component, inject } from '@angular/core';
import { AppConstants } from '../../../app-constants';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-services-list',
  imports: [MatButtonModule],
  templateUrl: './services-list.component.html',
  styleUrl: './services-list.component.scss',
  animations: [
    // Expand / Collapse for service-box
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: 0,
          overflow: 'hidden',
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden',
        }),
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),

    // Rotate for arrow
    trigger('rotateArrow', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class ServicesListComponent {
  readonly navigationService: NavigationService = inject(NavigationService);
  AppConstants = AppConstants;
  Pages = Pages;
  expandedItems: { [key: string]: boolean } = {};

  toggleItem(itemId: string) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }

  navigateTo(page: Pages) {
    this.navigationService.navigateTo(page);
  }
}
