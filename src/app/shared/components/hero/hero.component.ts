import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Pages } from '../../enums/pages.enum';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly PHRASES = ['Ressignificação', 'Saúde Relacional', 'Cuidado', 'Transformação'];

  readonly typedText = signal('');

  private wi = 0;
  private ci = 0;
  private deleting = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  heroImageLoaded = false;

  constructor(private readonly nav: NavigationService) {}

  ngOnInit(): void {
    this.tick();
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  navigateToScheduling(): void {
    this.nav.navigateTo(Pages.SCHEDULING);
  }

  private tick(): void {
    const phrase = this.PHRASES[this.wi];
    this.typedText.set(phrase.slice(0, this.ci));

    let delay: number;
    if (!this.deleting && this.ci < phrase.length)        { this.ci++;                                               delay = 95;   }
    else if (!this.deleting && this.ci === phrase.length) { this.deleting = true;                                   delay = 1900; }
    else if (this.deleting && this.ci > 0)                { this.ci--;                                               delay = 45;   }
    else                                                  { this.deleting = false; this.wi = (this.wi + 1) % this.PHRASES.length; delay = 320; }

    this.timer = setTimeout(() => this.tick(), delay);
  }
}
