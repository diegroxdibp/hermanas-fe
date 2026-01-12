import { computed, Injectable, signal } from '@angular/core';
import { User } from '../../auth/user.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _user = signal<User | null>(null);
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this.user());

  setUser(user: User | null) {
    this._user.set(user);
  }

  updateUser(userPartial: Partial<User>) {
    const current = this.user();
    if (!current) return;

    this._user.set({
      ...current,
      ...userPartial,
    });
  }

  clear() {
    this._user.set(null);
  }
}
