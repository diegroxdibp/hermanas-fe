import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Ponto único de leitura das flags de funcionalidade.
 *
 * Os templates nunca leem `environment` diretamente: quando as flags passarem a
 * vir do backend, muda só o que está aqui dentro.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly payments = signal(environment.paymentsEnabled);

  readonly paymentsEnabled = this.payments.asReadonly();

  /** Reservado para quando as flags chegarem do servidor. */
  setPaymentsEnabled(enabled: boolean): void {
    this.payments.set(enabled);
  }
}
