// O login com Google não vive debaixo de /api: começa em
// /oauth2/authorization/google e volta em /login/oauth2/code/google. Sem estes
// dois caminhos no proxy, o pedido nunca chegava ao backend local — caía no
// fallback de SPA do dev-server em vez de iniciar a sessão.
const backend = {
  target: 'http://localhost:8080',
  secure: false,
  changeOrigin: true,
};

module.exports = {
  '/oauth2': backend,
  '/login/oauth2': backend,
  '/api': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('error', (err) => console.error('[proxy error]', err));

      // Disable response buffering so SSE events stream through immediately
      proxy.on('proxyRes', (proxyRes) => {
        if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
          proxyRes.headers['x-accel-buffering'] = 'no';
          proxyRes.headers['cache-control'] = 'no-cache';
        }
      });
    }
  }
};
