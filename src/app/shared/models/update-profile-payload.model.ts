import { Currency } from '../enums/currency.enum';
import { Genders } from '../enums/genders.enum';

export interface UpdateProfilePayload {
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  gender: Genders;
  bio: string;
  currency: Currency;
  /** Fuso IANA — todas as horas da CARE são exibidas nele. */
  timeZone: string;
}
