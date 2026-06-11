import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  readonly message = signal<string | null>(null);

  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  show(msg: string, durationMs = 5000): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.message.set(msg);
    this.clearTimer = setTimeout(() => this.message.set(null), durationMs);
  }

  clear(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.message.set(null);
  }
}
