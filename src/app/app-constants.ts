import { NavbarBackground } from './shared/enums/navbar-background.enum';
import { Service } from './shared/models/service.model';

export const AppConstants = {
  authentication: {
    exists: false,
  },

  navigation: {
    background: NavbarBackground.Transparent,
    height: 80,
  },

  services: [
    {
      name: 'Atendimento Individualizado',
      cardImage: 'assets/images/atendimentoindividual.jpeg',
      cardDescription:
        'Terapias curtas. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
      serviceType: [
        'curta duração',
        'longa duração',
        'abordagem corporal Reichiana',
        'abordagem Junguiana',
        'abordagem fenomenológica',
      ],
    } as Service,
    {
      name: 'Oficinas de autorregulação',
      cardImage: 'assets/images/autoregulacao.jpg',
      cardDescription:
        'Oficiniares iares regulares ares. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
      serviceType: [
        'mindfulness',
        'de movimento',
        'escrita terapêutica',
        'relaxamento',
        'mandala',
      ],
    } as Service,
    {
      name: 'Grupos',
      cardImage: 'assets/images/grupos.jpg',
      cardDescription:
        'Grupos grupais grupasticos. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
      serviceType: [
        'de estudo',
        'de leitura',
        'supervisão',
      ],
    } as Service,
    {
      name: 'Linha de suporte para crises',
      cardImage: 'assets/images/surtando.jpg',
      cardDescription:
        'Linha de prevencao suicida disque sucidio agora. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
      serviceType: [
        'crises com ideação suicida',
        'crises pontuais',
      ],
    } as Service,
  ],
};
