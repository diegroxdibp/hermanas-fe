import { Component, computed, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-biography',
  imports: [],
  templateUrl: './biography.component.html',
  styleUrl: './biography.component.scss'
})
export class BiographyComponent implements OnInit {
  private routeParamSignal = signal<string | null>(null);
  private targetNames = ['Luane', 'Rayssa', 'Yara'];

  matchFound: Signal<string | null> = computed(() => {
    const paramValue = this.routeParamSignal();
    return this.targetNames.includes(paramValue || '') ? paramValue : null;
  });

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.routeParamSignal.set(params['name'] || null);
    });
  }
}
