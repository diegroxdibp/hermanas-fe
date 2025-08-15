import { FormControl } from '@angular/forms';
import { AvailabilityModel } from '../availability.model';

export interface AvailabilityConfigurationObject {
  title?: string;
  dayControl: FormControl;
  timeSlotControl: FormControl;
  availability: AvailabilityModel[];
}

export const emptyAvailabilityConfiguration: AvailabilityConfigurationObject = {
  title: '',
  dayControl: new FormControl(),
  timeSlotControl: new FormControl(),
  availability: [],
};
