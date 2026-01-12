import { AppointmentType } from '../enums/appointment-type.enum';

export interface AppointmentPayload {
  clientId: number;
  therapistId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  type: AppointmentType;
}
