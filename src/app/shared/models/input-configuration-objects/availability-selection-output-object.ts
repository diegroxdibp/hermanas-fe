import { Modality } from '../../enums/modality.enum';
import { AvailabilityModel } from '../availability.model';

export interface AvailabilitySelectionOutputObject {
  availability: AvailabilityModel;
  modality: Modality;
}
