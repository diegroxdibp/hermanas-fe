import { Component, signal, computed, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqTopic {
  topicName: string;
  items: FaqItem[];
}

/**
 * FAQ — "Lateral" direction.
 *
 * Desktop (>= 768px): a sticky left rail of topics + the selected topic's
 * questions in the right column (single accordion of answers).
 *
 * Mobile (< 768px): a NESTED accordion — only topic rows show at first;
 * tapping a topic expands it in place to reveal its questions, and tapping a
 * question reveals its answer. One topic open at a time.
 *
 * Note on animation: Angular's [@expand] trigger animates real height (*),
 * so the nested topic -> question expand works fine here. (The HTML prototype
 * had to avoid CSS `grid-template-rows: 0fr/1fr` because a flexible grid track
 * nested inside another flexible grid track collapses to 0 in the browser.)
 */
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  animations: [
    trigger('expand', [
      state('collapsed', style({ height: '0px', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class FaqComponent {
  /** Replace with your AppConstants.faq / a resolver / an input(). */
  readonly faq: FaqTopic[] = [
    {
      topicName: 'Consulta',
      items: [
        { question: 'Qual a duração de uma consulta?', answer: 'A duração é estipulada por cada pessoa profissional, contudo, no geral, varia entre 30 minutos até 2 horas.' },
        { question: 'Há consulta no formato online?', answer: 'Sim, a plataforma utilizada é de escolha de cada pessoa profissional. Ademais, em alguns serviços há também o formato presencial. As opções estão visíveis no momento do agendamento.' },
        { question: 'Como faço o cancelamento de uma consulta?', answer: 'O cancelamento pode ser feito até 24 horas antes do horário marcado, diretamente pelo painel da sua conta, na área de agendamentos.' },
      ],
    },
    {
      topicName: 'Agendamento',
      items: [
        { question: 'Como faço um agendamento?', answer: 'Para o agendamento é necessário primeiramente fazer Log in. Depois poderá clicar no botão de Agendamento e prosseguirá para a escolha do serviço e, em seguida, da pessoa profissional — tendo assim acesso à agenda com horários disponíveis.' },
        { question: 'É obrigatório fazer Log in para iniciar o agendamento?', answer: 'Sim, é obrigatório e sem custos.' },
        { question: 'Como tenho acesso à agenda da pessoa profissional?', answer: 'Ao fazer o Log in e escolher o serviço e o profissional, terá acesso à agenda com as datas e horários disponíveis.' },
        { question: 'Como cancelo um agendamento?', answer: 'O cancelamento é feito pelo painel da sua conta, na área de agendamentos, até 24 horas antes do horário marcado.' },
        { question: 'Após a pactuação de continuidade com a pessoa profissional, terei de agendar as próximas consultas pela CARE?', answer: 'O meio de agendamento poderá ser negociado diretamente com a pessoa profissional.' },
      ],
    },
    {
      topicName: 'Clínica',
      items: [
        { question: 'O que é a CARE?', answer: 'A CARE — Clínica Ampliada Ressignificações — é uma clínica digital que oferece cuidado em saúde mental, relacional, física e social, orientada pelos quatro pilares da clínica ampliada.' },
        { question: 'O que é a clínica ampliada?', answer: 'A clínica ampliada é uma formulação conceitual que compreende o cuidado para além do sintoma, integrando as dimensões biológica, psicológica e social de cada pessoa.' },
        { question: 'Quais modalidades de cuidado estão disponíveis?', answer: 'Entre as modalidades estão a Análise Corporal Reichiana, o Mindfulness, o Somatic Experiencing®, a supervisão e o trabalho em grupo.' },
      ],
    },
    {
      topicName: 'Política de privacidade e Termo de uso',
      items: [
        { question: 'Como os meus dados são armazenados?', answer: 'Os dados são armazenados em servidores em conformidade com o RGPD europeu e a LGPD brasileira.' },
        { question: 'Posso solicitar a exclusão dos meus dados?', answer: 'Sim. A qualquer momento poderá solicitar a exclusão dos seus dados diretamente pelo painel da sua conta ou através do nosso contato.' },
        { question: 'Quem tem acesso ao conteúdo das consultas?', answer: 'O conteúdo das consultas é sigiloso e acessível apenas à pessoa profissional responsável pelo seu cuidado.' },
      ],
    },
  ];

  /** Desktop: which topic's answers are shown in the right column. */
  readonly selectedTopic = signal<string>(this.faq[0].topicName);
  /** Mobile: which topic is expanded inline (null = none open). */
  readonly openTopic = signal<string | null>(null);
  /** Either layout: which question is open (key = topic + index). */
  readonly openQuestion = signal<string | null>(null);

  readonly isMobile = signal<boolean>(typeof window !== 'undefined' && window.innerWidth < 768);

  readonly selected = computed<FaqTopic>(
    () => this.faq.find((t) => t.topicName === this.selectedTopic()) ?? this.faq[0],
  );

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  qKey(topic: string, i: number): string {
    return `${topic}::${i}`;
  }

  /** Desktop rail. */
  selectTopic(name: string): void {
    if (this.selectedTopic() === name) return;
    this.selectedTopic.set(name);
    this.openQuestion.set(null);
  }

  /** Mobile topic accordion. */
  toggleTopic(name: string): void {
    const isOpen = this.openTopic() === name;
    this.openTopic.set(isOpen ? null : name);
    this.openQuestion.set(null);
  }

  /** Question accordion (both layouts). */
  toggleQuestion(key: string): void {
    this.openQuestion.set(this.openQuestion() === key ? null : key);
  }
}
