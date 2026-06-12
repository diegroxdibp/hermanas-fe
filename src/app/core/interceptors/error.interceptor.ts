import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/me'];

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
      if (err.status === 401) {
        return throwError(() => err);
      }

      const isAuthEndpoint = AUTH_ENDPOINTS.some(e => req.url.includes(e));

      if (!isAuthEndpoint && (err.status === 0 || err.status >= 500)) {
        router.navigate(['/error']);
      } else if (!isAuthEndpoint) {
        const message =
          ERROR_MESSAGES[err.status] ??
          'Ocorreu um erro. Tente novamente mais tarde.';
        errorService.show(message);
      }

      return throwError(() => err);
    }),
  );
};
