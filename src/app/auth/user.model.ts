import { Genders } from '../shared/enums/genders.enum';
import { Roles } from '../shared/enums/roles.enum';

export interface User {
  name?: string;
  email: string;
  birthDate?: string;
  phone?: string;
  gender?: Genders;
  bio?: string;
  picture?: string;
  roles: string[];
  profileCompleted: boolean;
}

export const emptyUser: User = {
  name: 'SAMPLE_NAME',
  email: 'SAMPLE_EMAIL@EMAIL.COM',
  roles: [Roles.USER],
  profileCompleted: false,
};
