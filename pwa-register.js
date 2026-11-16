/* Registra o service worker do Fifa Legends para permitir instalação como app e uso offline.
   Em ambiente de teste local (Live Server, 127.0.0.1, file aberto direto, etc.) o service
   worker NUNCA é registrado — e qualquer registro antigo dele é removido automaticamente.
   Isso evita o navegador "travar" numa versão antiga guardada em cache enquanto você está
   testando mudanças localmente. O service worker só entra em ação no site publicado. */
if ('serviceWorker' in navigator) {
  const isLocalDev = ['localhost', '127.0.0.1', '::1', ''].includes(location.hostname)
    || location.hostname.endsWith('.local');

  if (isLocalDev) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    }).catch(() => {});
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('Falha ao registrar o service worker do Fifa Legends:', err);
      });
    });
  }
}
