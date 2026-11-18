/* Service worker do Fifa Legends — permite instalar como app e usar offline.
   Suba a versão do CACHE_NAME sempre que quiser forçar os celulares a buscar
   os arquivos atualizados em vez de continuar usando a cópia guardada. */
const CACHE_NAME = 'fifa-legends-v19';

const ASSETS = [
  'firebase-sync.js',
  'Fifa.html',
  'Fifa_stats.html',
  'LostMedia.html',
  'Clarinha.html',
  'WL.html',
  'WLStats.html',
  'theme.css',
  'Fifa.css',
  'Fifa_stats.css',
  'LostMedia.css',
  'Clarinha.css',
  'WL.css',
  'Fifa.js',
  'Fifa_cards.js',
  'Fifa_stats.js',
  'graficos-mobile.js',
  'LostMedia.js',
  'Clarinha.js',
  'WL.js',
  'WLHistorico.js',
  'WLStats.js',
  'chart.umd.min.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isNavigation = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    // Páginas HTML: tenta buscar a versão mais nova na rede; se não tiver internet, usa a guardada.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('Fifa.html')))
    );
    return;
  }

  // CSS/JS/imagens: usa a cópia guardada na hora (rápido) e atualiza o cache por trás, pra próxima vez.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
