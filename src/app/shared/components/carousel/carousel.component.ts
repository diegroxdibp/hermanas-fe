import { Component, signal } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-carousel',
  imports: [CarouselModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent {
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

  carouselOptions: OwlOptions = {
    loop: true,
    center: true,
    margin: 20,
    // nav: true,
    dots: true,
    autoWidth: true, // 🔥 IMPORTANT for Elementor feel
    smartSpeed: 600,
    navText: ['‹', '›'],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 3,
      },
      2000: {
        items: 3,
      },
    },
  };
}
