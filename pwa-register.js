/* Registra o service worker do Fifa Legends para permitir instalação como app e uso offline. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('Falha ao registrar o service worker do Fifa Legends:', err);
    });
  });
}
