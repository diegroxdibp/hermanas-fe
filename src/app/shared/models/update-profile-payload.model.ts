import { Genders } from '../enums/genders.enum';

export interface UpdateProfilePayload {
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  gender: Genders;
  bio: string;
}
