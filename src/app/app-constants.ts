import { NavbarBackground } from './shared/enums/navbar-background.enum';
import { Pages } from './shared/enums/pages.enum';
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
      cardDescription:
        'Atendimentos individuais com psicóloga, visando o autoconhecimento e o restabelecimento da saúde mental.',
      serviceType: [
        {
          name: 'Análise Corporal Reichiana',
          description:
            'A análise corporal reichiana reintegra a terapia verbal à análise do corpo e tem como objetivo flexibilizar os bloqueios somáticos, considerando o ser humano como uma unidade psicossomática, na qual corpo e mente formam um sistema indissociável.',
          knowMorePage: Pages.ANALISE_REICHANA,
        },

        {
          name: 'Mindfulness',
          description:
            'A prática em Mindfulness fomenta a regulação atencional e emocional por meio de propostas com o body scan, a respiração consciente, a meditação em movimento e a atenção plena nas atividades cotidianas.',
          knowMorePage: Pages.MINDFULLNESS,
        },
      ],
    } as Service,

    {
      name: 'Atendimento em grupo',
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
