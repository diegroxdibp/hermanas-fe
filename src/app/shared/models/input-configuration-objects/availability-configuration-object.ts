import { FormControl } from '@angular/forms';
import { AvailabilityModel } from '../availability.model';

export interface AvailabilityConfigurationObject {
  title?: string;
  timeSlotControl: FormControl;
  availability: AvailabilityModel[];
}

export const emptyAvailabilityConfiguration: AvailabilityConfigurationObject = {
  title: '',
  timeSlotControl: new FormControl(),
  availability: [],
};
