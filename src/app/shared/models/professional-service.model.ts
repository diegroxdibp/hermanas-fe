import { ProfessionalServiceFormat } from '../enums/professional-service-format.enum';
import { ProfessionalServiceModality } from '../enums/professional-service-modality.enum';
import { ProfessionalSessionService } from '../enums/professional-session-service.enum';

export interface ProfessionalService {
  id: number;
  sessionService: ProfessionalSessionService;
  format: ProfessionalServiceFormat;
  modality: ProfessionalServiceModality;
  price: string;
  active: boolean;
}

export const emptyProfessionalService: ProfessionalService = {
  id: 1,
  sessionService: ProfessionalSessionService.REICHIAN_BODY_ANALYSIS,
  format: ProfessionalServiceFormat.INDIVIDUAL,
  modality: ProfessionalServiceModality.LOCAL,
  price: '100',
  active: false,
};
