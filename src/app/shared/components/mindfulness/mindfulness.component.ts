import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ProfessionalSessionService } from '../../enums/professional-session-service.enum';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';

// Backend's ProfessionalService.name is the enum KEY, not its display value.
const SERVICE_KEY: keyof typeof ProfessionalSessionService = 'MINDFULNESS';

@Component({
  selector: 'app-mindfulness',
  imports: [ScrollAnimateDirective],
  templateUrl: './mindfulness.component.html',
  styleUrl: './mindfulness.component.scss',
})
export class MindfulnessComponent {
  constructor(public navigationService: NavigationService) {}

  navigateToScheduling(): void {
    this.navigationService.navigateToScheduling(SERVICE_KEY);
  }
}
