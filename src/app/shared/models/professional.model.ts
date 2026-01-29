export interface ProfessionalModel {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  title: string;
  picture: string;
  roles: string[];
}

export const emptyProfessional: ProfessionalModel = {
  id: 1,
  name: 'PROFESSIONAL_NAME',
  email: 'PROFESSIONAL_EMAIL',
  phone: '0',
  roles: ['THERAPIST'],
  bio: 'Bio description',
  title: 'Title',
  picture: ''
};
