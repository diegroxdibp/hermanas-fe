import { DayOfWeek } from "../enums/day-of-week.enum";

export interface AvailabilityModel {
  id: number;
  therapistId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringDay: DayOfWeek;
}

export const emptyAvailability: AvailabilityModel = {
  id: 1,
  therapistId: 1,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  isRecurring: false,
  recurringDay: DayOfWeek.MONDAY
};
