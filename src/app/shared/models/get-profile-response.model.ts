import { Genders } from '../enums/genders.enum';
import { Roles } from '../enums/roles.enum';

export interface GetProfileResponse {
  email: string;
  name: string;
  bio?: string;
  picture?: string,
  profileCompleted: boolean,
  birthDate: string;
  phone: string;
  gender: Genders;
  roles: Set<Roles>
}
