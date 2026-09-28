self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter(key => key.startsWith('creative-chicken-points-')).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
// Network-only: never serve obsolete UI or balances from this worker.
