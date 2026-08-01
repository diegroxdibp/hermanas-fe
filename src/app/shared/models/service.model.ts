import { Pages } from '../enums/pages.enum';
import { ProfessionalSessionService } from '../enums/professional-session-service.enum';

export interface Services {
  service: Service[]
}


export interface Service {
  name: string;
  cardDescription: string;
  serviceType: ServiceType[];
  available: boolean;
}

export interface ServiceType {
  name: string;
  description: string;
  knowMorePage: Pages;
  /** Backend's ProfessionalService.name (ProfessionalSessionService enum key). Omit for offerings not bookable via Scheduling (e.g. group services). */
  sessionService?: keyof typeof ProfessionalSessionService;
}
