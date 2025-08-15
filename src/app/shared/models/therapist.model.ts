export interface TherapistModel {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  title: string;
  picture: string;
  roles: string[];
}

export const emptyTherapist: TherapistModel = {
  id: 1,
  name: 'THERAPIST_NAME',
  email: 'THERAPIST_EMAIL',
  phone: '0',
  roles: ['THERAPIST'],
  bio: 'Bio description',
  title: 'Title',
  picture: ''
};
