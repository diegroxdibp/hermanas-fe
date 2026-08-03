import { Pipe, PipeTransform, inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { detectBrowserTimezone } from '../utils/timezones.util';

type UserTimeFormat = 'time' | 'date' | 'full' | 'weekday';

/**
 * Formata um instante (ISO em UTC vindo da API) no fuso guardado no perfil.
 * Regra do produto: nunca exibimos hora dupla — a hora mostrada é sempre a do
 * fuso do usuário. A única exceção fica na tela de disponibilidade da pessoa
 * profissional, que autoria no relógio dela e por isso não usa este pipe.
 *
 * Impuro de propósito: o fuso vem de um signal na SessionService e pode mudar
 * sem que a entrada do pipe mude.
 */
@Pipe({ name: 'userTime', pure: false })
export class UserTimePipe implements PipeTransform {
  private readonly sessionService = inject(SessionService);

  transform(value: string | Date | null | undefined, format: UserTimeFormat = 'time'): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const timeZone = this.sessionService.user()?.timeZone || detectBrowserTimezone();
    const options: Intl.DateTimeFormatOptions = { timeZone };

    switch (format) {
      case 'time':
        Object.assign(options, { hour: '2-digit', minute: '2-digit' });
        break;
      case 'date':
        Object.assign(options, { day: '2-digit', month: '2-digit', year: 'numeric' });
        break;
      case 'weekday':
        Object.assign(options, { weekday: 'long', day: 'numeric', month: 'long' });
        break;
      case 'full':
        Object.assign(options, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }
}
