import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Este site nunca teve service worker de propósito. Um deploy antigo deixou
// um sw.js instalado nalguns browsers, que ficava a interceder pedidos de
// fundo (ex.: /api/notifications) — depois de o browser acordar de
// suspensão essas interceções falhavam e mandavam a app para a página de
// erro. Isto desinstala qualquer worker ativo assim que a app arranca; ver
// também public/sw.js, para o caso de o worker antigo continuar a controlar
// um separador já aberto.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
