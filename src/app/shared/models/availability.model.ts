import { DayOfWeek } from '../enums/day-of-week.enum';
import {
  emptyProfessionalService,
  ProfessionalService,
} from './professional-service.model';
export interface AvailabilityModel {
  id: number;
  professionalId: number;
  professionalName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringDay: DayOfWeek;
  services: ProfessionalService[];
}

export const emptyAvailability: AvailabilityModel = {
  id: 1,
  professionalId: 1,
  professionalName: 'Terapeuta da Silva',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  isRecurring: false,
  recurringDay: DayOfWeek.MONDAY,
  services: [emptyProfessionalService],
};
