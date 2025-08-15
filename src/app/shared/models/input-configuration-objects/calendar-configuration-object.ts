import { FormControl } from '@angular/forms';
import { AvailabilityModel } from '../availability.model';

export interface CalendarConfigurationObject {
  title?: string;
  dayControl: FormControl;
  timeSlotControl: FormControl;
  availability: AvailabilityModel[];
}

export const emptyCalendarConfiguration: CalendarConfigurationObject = {
  title: '',
  dayControl: new FormControl(),
  timeSlotControl: new FormControl(),
  availability: [],
};
