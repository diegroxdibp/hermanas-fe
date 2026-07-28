import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ProfessionalSessionService } from '../../enums/professional-session-service.enum';

// Backend's ProfessionalService.name is the enum KEY, not its display value.
const SERVICE_KEY: keyof typeof ProfessionalSessionService = 'SOMATIC_EXPERIENCE';

@Component({
  selector: 'app-somatic-experience',
  imports: [],
  templateUrl: './somatic-experience.component.html',
  styleUrl: './somatic-experience.component.scss',
})
export class SomaticExperienceComponent {
  constructor(public navigationService: NavigationService) {}

  navigateToScheduling(): void {
    this.navigationService.navigateToScheduling(SERVICE_KEY);
  }
}
