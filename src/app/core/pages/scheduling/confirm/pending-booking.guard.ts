import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SchedulingService } from '../../../../shared/services/scheduling.service';
import { Pages } from '../../../../shared/enums/pages.enum';

/**
 * A confirmação só existe na sequência de uma escolha. Chegar aqui por URL
 * direto, recarregar a página ou voltar depois de marcar deixa a rota sem
 * seleção — nesse caso volta-se à lista de horários em vez de mostrar uma
 * revisão vazia.
 */
export const pendingBookingGuard: CanActivateFn = () => {
  const schedulingService = inject(SchedulingService);
  const router = inject(Router);

  if (schedulingService.pendingBooking()) {
    return true;
  }
  return router.createUrlTree([Pages.SCHEDULING]);
};
