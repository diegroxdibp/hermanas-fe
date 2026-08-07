// "Kill switch" — este site nunca teve service worker de propósito (sem
// ngsw-config.json, sem Workbox, sem manifest.webmanifest no repositório).
// Uma versão antiga do deploy deixou um sw.js instalado em browsers que já
// tinham visitado o site; esse worker fica a interceder pedidos (incluindo
// chamadas de fundo como /api/notifications) e, ao acordar de suspensão ou
// numa falha de rede passageira, essas interceções falham com
// "no-response" — o que mandava a app para a página de erro.
//
// Este ficheiro substitui esse worker antigo: ativa-se imediatamente,
// desinstala-se a si próprio e recarrega os separadores que ainda controla.
// Depois disto, nenhum browser volta a ter um service worker instalado.
// Ver public/_headers — tem de ficar sempre sem cache, senão os browsers
// com o worker antigo nunca chegam a ver esta versão nova.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
