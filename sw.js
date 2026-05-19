const CACHE = 'evisynth-v1';
const SHELL = ['./index.html', './leaderboard.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Firebase and CDN requests: network only (never cache live data)
  const url = e.request.url;
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis') ||
      url.includes('cdnjs') || url.includes('fonts.g')) return;
  // App shell: network first, fall back to cache
  e.respondWith(
    fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
