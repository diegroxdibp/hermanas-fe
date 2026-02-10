import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';
import { Bio } from '../../models/bio.model';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  Pages = Pages;
  bio: Bio = {
    name: 'Luane Souza Bastos',
    title: 'Psicoterapeuta corporal Reichiana',
    image: 'assets/images/luane.jpeg',
    description: [
      'Sou Luane Souza Bastos e trago um olhar para o corpo desde a infância quando o amor pela dança deu-se início. Contudo, foi na formação em psicologia que reencontro o corpo quando conheço o trabalho de Wilhelm Reich na psicanálise e, sobretudo, o trabalho psicoterapêutico para além da linguagem verbal.',
      'A partir do trabalho reichiano segui minha jornada profissional entre formações, atendimentos clínicos, workshops, supervisões até os grupos de movimento que desenvolvi na prefeitura do Rio de Janeiro.',
      'Formada em psicologia pela Universidade Federal de São Paulo (UNIFESP) em 2013, pós-graduada através da Residência Multiprofissional na Universidade Federal do Rio de Janeiro (UFRJ) em 2016, cursou a formação no Instituto de Formação e Pesquisa Wilhelm Reich (IFP) no Rio de Janeiro em 2017, pós-graduada pela Universidade Nova de Lisboa (NOVA) em sociologia e estudos sobre as mulheres em 2020, cursou a formação no Centro Português de Estudos Reichianos (CPER) em Lisboa no ano de 2021 e atualmente na formação em trauma com o método Somatic Experiencing de Peter Levine na Associação Brasileira de Trauma (ABT). Além de trabalhos na rede pública como no Sistema Nacional de Saúde (SUS) e centros de cidadanias para mulheres, assim como, em clínica particular e trabalhos coletivos na construção de clínica social em Lisboa.',
    ],
  };
  constructor(public navigationService: NavigationService) {}

  ngOnInit(): void {
    // this.navigationService.navigateTo(Pages.LUANE);
  }
}
