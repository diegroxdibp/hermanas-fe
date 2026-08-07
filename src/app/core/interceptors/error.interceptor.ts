import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';

// Endpoints whose callers already render a specific, server-provided error
// message inline — skip the generic snackbar so it doesn't duplicate/clash.
const SELF_HANDLED_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/me',
  '/api/user/onboarding',
];

// The one-shot GET each SSE service fires when (re)connecting — retried
// automatically by that service's own 5 s reconnect loop (see
// notification.service.ts / message.service.ts). A brief network blip (e.g.
// the browser waking from sleep, or a stale service worker misbehaving)
// fails this every few seconds while the connection recovers on its own;
// navigating the whole app to /error or spamming a snackbar on every retry
// is worse than just letting it quietly reconnect.
const isBackgroundSyncCall = (url: string) =>
  url.endsWith('/api/notifications') || url.endsWith('/api/threads');

const ERROR_MESSAGES: Partial<Record<number, string>> = {
  400: 'Pedido inválido. Verifique os dados e tente novamente.',
  403: 'Não tem permissão para realizar esta ação.',
  404: 'O recurso solicitado não foi encontrado.',
  409: 'Conflito com dados existentes. Tente novamente.',
  422: 'Dados inválidos. Verifique os campos e tente novamente.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || isBackgroundSyncCall(req.url)) {
        return throwError(() => err);
      }

      const isSelfHandled = SELF_HANDLED_ENDPOINTS.some(e => req.url.includes(e));

      if (!isSelfHandled && (err.status === 0 || err.status >= 500)) {
        router.navigate(['/error']);
      } else if (!isSelfHandled) {
        const message =
          ERROR_MESSAGES[err.status] ??
          'Ocorreu um erro. Tente novamente mais tarde.';
        errorService.show(message);
      }

      return throwError(() => err);
    }),
  );
};
