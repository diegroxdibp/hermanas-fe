import { Pages } from '../enums/pages.enum';

export interface Service {
  name: string;
  cardDescription: string;
  serviceType: ServiceType[];
}

export interface ServiceType {
  name: string;
  description: string;
  knowMorePage: Pages;
}
