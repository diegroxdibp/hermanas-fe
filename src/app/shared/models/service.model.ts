export interface Service {
  name: string;
  cardImage: string;
  cardDescription: string;
  serviceType: SericeType[];
}

export interface SericeType {
  name: string;
  description: string;
}
