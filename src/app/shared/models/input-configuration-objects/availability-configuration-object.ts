import { FormControl } from '@angular/forms';
import { AvailabilityModel } from '../availability.model';

export interface AvailabilityConfigurationObject {
  title?: string;
  selectedDate: string;
  control: FormControl;
  availability: AvailabilityModel[];
}

export const emptyAvailabilityConfiguration: AvailabilityConfigurationObject = {
  title: '',
  selectedDate: '',
  control: new FormControl(),
  availability: [],
};
