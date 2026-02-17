import { Modality } from '../enums/modality.enum';

export interface AppointmentPayload {
  availabilityId: number;
  professionalServiceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  modality: Modality;
}
