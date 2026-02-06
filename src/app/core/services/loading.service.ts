import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal(0);
  private routeLoading = signal(false);

  // public signals
  isHttpLoading = computed(() => this.activeRequests() > 0);
  isRouteLoading = this.routeLoading;

  // global loading
  isLoading = computed(() => this.isHttpLoading() || this.isRouteLoading());

  startRequest() {
    this.activeRequests.update((v) => v + 1);
  }

  endRequest() {
    this.activeRequests.update((v) => Math.max(0, v - 1));
  }

  setRouteLoading(state: boolean) {
    this.routeLoading.set(state);
  }
}
