import { DayOfWeek } from './../enums/day-of-week.enum';
import { Modality } from '../enums/modality.enum';

export interface AppointmentPayload {
  availabilityId: number;
  professionalServiceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  dayOfWeek: DayOfWeek;
  modality: Modality;
}
