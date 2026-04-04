import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-marquee-track',
  imports: [],
  templateUrl: './marquee-track.component.html',
  styleUrl: './marquee-track.component.scss',
})
export class MarqueeTrackComponent {
  slidesStore = signal<any[]>([
    {
      id: 'Saúde Mental',
      text: 'Slide 1 HM',
      width: 300,
      image: 'thoughts.svg',
    },
    {
      id: 'Comunidade',
      text: 'Slide 2 HM',
      width: 500,
      image: 'tree.svg',
    },
    {
      id: 'Suporte',
      text: 'Slide 3 HM',
      width: 500,
      image: 'trifecta.svg',
    },
    {
      id: 'Educação',
      text: 'Slide 5 HM',
      width: 500,
      image: 'book.svg',
    },
    {
      id: 'Medicina',
      text: 'Slide 5 HM',
      width: 500,
      image: 'cross.svg',
    },
  ]);
}
