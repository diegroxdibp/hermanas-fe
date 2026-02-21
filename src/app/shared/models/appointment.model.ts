import { DayOfWeek } from '../enums/day-of-week.enum';
import { Modality } from '../enums/modality.enum';
import { Roles } from '../enums/roles.enum';

export interface Appointment {
  id: number;
  professionalId: number;
  professionalName: Roles;
  clientId: number;
  availabilityId: number;
  professionalServiceId: number;
  modality: Modality;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  dayOfWeek: DayOfWeek;
}
