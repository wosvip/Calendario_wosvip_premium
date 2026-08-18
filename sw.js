"use strict";

const CACHE_NAME = "calendario-wosvip-v3-2-2-timepicker-20260818";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css?v=3.2.2",
  "./js/holidays.js?v=3.2.2",
  "./js/calendar.js?v=3.2.2",
  "./js/agenda.js?v=3.2.2",
  "./js/timepicker.js?v=3.2.2",
  "./js/app.js?v=3.2.2",
  "./js/diario.js?v=3.2.2",
  "./assets/icons/icone-192.png",
  "./assets/icons/icone-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(
        chaves
          .filter(chave => chave !== CACHE_NAME)
          .map(chave => caches.delete(chave))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(respostaRede => {
        const copia = respostaRede.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        return respostaRede;
      })
      .catch(() =>
        caches.match(event.request).then(resposta =>
          resposta || caches.match("./index.html")
        )
      )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type:"window", includeUncontrolled:true }).then(janelas => {
      for(const janela of janelas){
        if("focus" in janela) return janela.focus();
      }
      if(clients.openWindow) return clients.openWindow("./");
      return undefined;
    })
  );
});
