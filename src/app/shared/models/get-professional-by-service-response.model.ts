export interface Professional {
  id: number;
  name: string;
  picture: string;
  bio: string;
}

export const emptyProfessionalService: Professional = {
  id: 0,
  name: 'SAMPLE_NAME',
  picture: '',
  bio: 'Sample bio',
};
