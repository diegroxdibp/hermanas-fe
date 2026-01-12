import { Genders } from '../enums/genders.enum';
import { Roles } from '../enums/roles.enum';

export interface ProfileView {
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  gender: Genders;
  bio: string;
  picture: string;
  roles: Set<Roles>;
  profileCompleted: boolean;
}
