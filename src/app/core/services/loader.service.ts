import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  readonly loading = signal(false);
  constructor() {}

  startLoader(): void {
    this.loading.set(true);
  }

  stopLoader(): void {
    this.loading.set(false);
  }
}
