// Service worker : le jeu fonctionne hors ligne et se met à jour au lancement suivant.
const CACHE = "valbrume-v2";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réponse immédiate depuis le cache, puis mise à jour en arrière-plan.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
