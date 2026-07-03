import { DayOfWeek } from '../enums/day-of-week.enum';
import { Modality } from '../enums/modality.enum';

export interface Appointment {
  id: number;
  professionalId: number;
  professionalName: string;
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
  clientName?: string;
  clientEmail?: string;
}
