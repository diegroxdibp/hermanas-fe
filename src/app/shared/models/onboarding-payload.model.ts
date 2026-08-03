import { Currency } from '../enums/currency.enum';

export interface OnboardingPayload {
  name: string;
  birthDate: string;
  phone: string;
  gender: string;
  currency: Currency;
  /** Fuso IANA detectado no navegador — o onboarding não pergunta. */
  timeZone: string;
}
