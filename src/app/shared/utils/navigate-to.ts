import { inject } from '@angular/core';
import { Pages } from '../enums/pages.enum';
import { NavigationService } from '../services/navigation.service';

const navigationService = inject(NavigationService);

export const navigateTo = (page: Pages): void => {
  navigationService.navigateTo(page);
};
