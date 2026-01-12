import { FormControl } from '@angular/forms';
import { CalendarType } from '../../enums/calendar-type.enum';

export interface CalendarConfigurationObject {
  title?: string;
  control: FormControl;
  calendarType: CalendarType;
}

export const emptyCalendarConfiguration: CalendarConfigurationObject = {
  title: '',
  control: new FormControl(),
  calendarType: CalendarType.SCHEDULING,
};
