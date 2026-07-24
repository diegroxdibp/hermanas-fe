import { Countries } from '../../../assets/countries';

export interface CountryModel {
  capital?: string;
  code: string;
  continent?: string;
  iso: boolean;
  name: string;
  namePt: string;
  ISOCode: string;
  InternationalAreaCode: number;
  LengthOfInternationalAreaCode: number;
}

export const defaultCountry =
  Countries.find((country: CountryModel) => country.code === 'pt') ||
  (Countries[0] as CountryModel);
