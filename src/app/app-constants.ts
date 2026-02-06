import { environment } from './../environments/environment';
import { NavbarBackground } from './shared/enums/navbar-background.enum';
import { Pages } from './shared/enums/pages.enum';
import { Service } from './shared/models/service.model';

export const AppConstants = {
  apiEndpoints: {
    me: `${environment.apiUrl}/api/auth/me`,
    register: `${environment.apiUrl}/api/auth/register`,
    onboarding: `${environment.apiUrl}/api/user/onboarding`,
    updateProfile: `${environment.apiUrl}/api/user/profile`,
    getProfile: `${environment.apiUrl}/api/user/profile`,
    login: `${environment.apiUrl}/api/auth/login`,
    logout: `${environment.apiUrl}/api/auth/logout`,
    loginWithGoogle: `${environment.apiUrl}/oauth2/authorization/google`,
  },
  authentication: {
    exists: true,
    emailInputTitle: 'Email:',
    passwordInputTitle: 'Password:',
    nameInputTitle: 'Nome:',
    poneNumberTitle: 'Telefone:',
    birthdateTitle: 'Birthdate:',
    genderTitle: 'Gênero:',
    bioTitle: 'Bio:',
  },

  defaultCountry: 'pt',

  navigation: {
    background: NavbarBackground.White,
    height: 80,
  },

  scheduling: {
    minDate: new Date(),
    maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  },

  birthdate: {
    minDate: new Date(),
    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() - 100)),
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

        {
          name: 'Somatic Experience®',
          description:
            'Whaterevers revsdervs nervs rergvs drevs nergrsvs deris guervs.',
          knowMorePage: Pages.SOMATIC_EXPERIENCE,
        },
      ],
    } as Service,

    {
      name: 'Atendimento em grupo',
      cardDescription:
        'Atendimentos em grupo com psicóloga, visando o autoconhecimento e o restabelecimento da saúde mental.',
      serviceType: [
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

    {
      name: 'Para profissionais',
      cardDescription: 'Serviços orientados para profissionais.',
      serviceType: [
        {
          name: 'Supervisão',
          description:
            'Supervisão supervisiona da Luane pra você ficar 100% na terapeutica #CONFIA.',
          knowMorePage: Pages.SUPERVISION,
        },
      ],
    } as Service,
  ],
};
