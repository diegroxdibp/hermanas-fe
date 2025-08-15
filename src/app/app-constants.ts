import { NavbarBackground } from './shared/enums/navbar-background.enum';
import { Service } from './shared/models/service.model';

export const AppConstants = {
  authentication: {
    exists: false,
  },

  navigation: {
    background: NavbarBackground.White,
    height: 80,
  },

  scheduling: {
    minDate: new Date(),
    maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  },

  services: [
    {
      name: 'Atendimento individual',
      cardImage: 'assets/images/atendimentoindividual.jpeg',
      cardDescription:
        'Atendimentos individuais com psicóloga, visando o autoconhecimento e o restabelecimento da saúde mental.',
      serviceType: [
        {
          name: 'Análise Corporal Reichiana',
          description:
            'A abordagem reichiana pode ser realizada em curta ou longa duração.',
        },

        {
          name: 'Mindfulness',
          description:
            'Supera amiga, ja deu segue em frente ele nao te quer mais.',
        },
      ],
    } as Service,

    {
      name: 'Atendimento em grupo',
      cardImage: 'assets/images/atendimentoindividual.jpeg',
      cardDescription:
        'Atendimentos em grupo com psicóloga, visando o autoconhecimento e o restabelecimento da saúde mental.',
      serviceType: [
        {
          name: 'Supervisão',
          description:
            'Supervisão supervisiona da Luane pra você ficar 100% na terapeutica #CONFIA.',
        },
        {
          name: 'Grupo de Mulheres',
          description: 'Mulher, só que em grupo.',
        },
        {
          name: 'Grupo de Leitura',
          description: 'Leitura, só que em grupo.',
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
