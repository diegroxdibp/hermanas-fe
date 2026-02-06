import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  loader = inject(LoadingService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.headers.has('X-Skip-Loader')) {
      return next.handle(req);
    }

    this.loader.startRequest();

    return next.handle(req).pipe(finalize(() => this.loader.endRequest()));
  }
}
