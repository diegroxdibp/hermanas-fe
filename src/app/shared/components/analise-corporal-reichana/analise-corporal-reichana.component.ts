import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ProfessionalSessionService } from '../../enums/professional-session-service.enum';

// Backend's ProfessionalService.name is the enum KEY, not its display value.
const SERVICE_KEY: keyof typeof ProfessionalSessionService = 'REICHIAN_BODY_ANALYSIS';

@Component({
  selector: 'app-analise-corporal-reichana',
  imports: [],
  templateUrl: './analise-corporal-reichana.component.html',
  styleUrl: './analise-corporal-reichana.component.scss',
})
export class AnaliseCorporalReichanaComponent {
  constructor(public navigationService: NavigationService) {}

  navigateToScheduling(): void {
    this.navigationService.navigateToScheduling(SERVICE_KEY);
  }
}
