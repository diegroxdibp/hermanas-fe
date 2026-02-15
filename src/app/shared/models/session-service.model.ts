import { ProfessionalServiceFormat } from '../enums/professional-service-format.enum';
import { ProfessionalServiceModality } from '../enums/professional-service-modality.enum';
import { ProfessionalSessionService } from '../enums/professional-session-service.enum';

export interface ProfessionalService {
  id: number;
  active: boolean;
  format: ProfessionalServiceFormat;
  name: string;
  modality: ProfessionalServiceModality;
  price: string;
  sessionService: ProfessionalSessionService[];
}
