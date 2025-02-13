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

  scheduling: {
    minDate: new Date(),
    maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  },

  services: [
    {
      name: 'Psicoterapia individual',
      cardImage: 'assets/images/atendimentoindividual.jpeg',
      cardDescription:
        'Atendimentos individuais com psicóloga, visando o autoconhecimento e o restabelecimento da saúde mental.',
      serviceType: [
        {
          name: 'curta duração',
          description:
            'De 10 a 12 sessões, modalidade indicada para pessoas com questões relacionadas ao autoconhecimento e com sofrimento psíquico leve.',
        },
        {
          name: 'longa duração',
          description:
            'No mínimo 12 sessões com avaliação periódica, modalidade indicada para pessoas com sofrimento psíquico moderado e grave.',
        },
        {
          name: 'abordagem corporal Reichiana',
          description:
            'A abordagem reichiana pode ser realizada em curta ou longa duração.',
        },
        {
          name: 'abordagem Junguiana',
          description:
            'A abordagem junguiana pode ser realizada em curta ou longa duração.',
        },
        {
          name: 'abordagem fenomenológica',
          description:
            'A abordagem fenomenológica pode ser realizada em curta ou longa duração.',
        },
        {
          name: 'abordagem fenomenológica',
          description:
            'A abordagem fenomenológica pode ser realizada em curta ou longa duração.',
        },
        {
          name: 'abordagem fenomenológica',
          description:
            'A abordagem fenomenológica pode ser realizada em curta ou longa duração.',
        },
      ],
    } as Service,
    // {
    //   name: 'Oficinas de autorregulação',
    //   cardImage: 'assets/images/autoregulacao.jpg',
    //   cardDescription:
    //     'Oficiniares iares regulares ares. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
    //   serviceType: [
    //     'mindfulness',
    //     'de movimento',
    //     'escrita terapêutica',
    //     'relaxamento',
    //     'mandala',
    //   ],
    // } as Service,
    // {
    //   name: 'Grupos',
    //   cardImage: 'assets/images/grupos.jpg',
    //   cardDescription:
    //     'Grupos grupais grupasticos. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
    //   serviceType: ['de estudo', 'de leitura', 'supervisão'],
    // } as Service,
    // {
    //   name: 'Linha de suporte para crises',
    //   cardImage: 'assets/images/surtando.jpg',
    //   cardDescription:
    //     'Linha de prevencao suicida disque sucidio agora. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
    //   serviceType: ['crises com ideação suicida', 'crises pontuais'],
    // } as Service,
  ],
};
