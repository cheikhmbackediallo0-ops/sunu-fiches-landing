/* ==========================================================================
   SUÑU FICHES — service worker (application installable, utilisable hors ligne)

   - Pages et fichiers du site : le réseau d'abord (toujours la dernière version),
     la copie enregistrée si le réseau ne répond pas en 4 s ou s'il n'y a pas
     d'Internet.
   - Polices Google, html2pdf (cdnjs), supabase-js (jsdelivr) : la copie
     enregistrée d'abord. Ces adresses portent un numéro de version, elles ne
     changent pas.
   - Tout le reste n'est pas touché : comptes Supabase, WhatsApp, Wave, etc.

   À chaque mise en ligne qui modifie ce fichier, changer VERSION. Le site
   propose alors « Mettre à jour » ; il ne recharge jamais la page tout seul,
   pour ne pas perdre une fiche en cours de modification.
   ========================================================================== */
'use strict';

var VERSION = 'v2-2026-10-30';
var CORE = 'sunu-core-' + VERSION;   // pages et fichiers du site (une seule copie de chaque)
var CDN = 'sunu-cdn-v1';             // polices et bibliothèques versionnées

// Le minimum pour ouvrir l'application sans Internet (≈ 450 Ko)
var PRECACHE = [
  './',
  'index.html',
  'accueil.html',
  'generateur.html',
  'connexion.html',
  'offline.html',
  'manifest.webmanifest',
  'assets/css/sunu.css',
  'assets/js/sunu-config.js',
  'assets/js/sunu-core.js',
  'assets/js/pwa.js',
  'assets/js/hw-fiche.js',
  'assets/js/data-prescolaire.js',
  'assets/js/data-elementaire.js',
  'assets/js/materiel.js',
  'assets/js/fiche-engine.js',
  'assets/icons/icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-192.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32.png'
];

var CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net'];
var NETWORK_TIMEOUT = 4000;

// Une réponse propre à enregistrer (sans trace de redirection)
function clean(res) {
  if (!res.redirected) return Promise.resolve(res);
  return res.blob().then(function (body) {
    return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CORE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (url) {
        return fetch(new Request(url, { cache: 'reload' })).then(function (res) {
          if (!res.ok) throw new Error('Précache impossible : ' + url + ' (' + res.status + ')');
          return clean(res).then(function (r) { return cache.put(url, r); });
        });
      }));
    }).then(function () {
      // Première installation : prendre la main tout de suite
      return self.registration.active ? null : self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return /^sunu-/.test(k) && k !== CORE && k !== CDN;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () {
      if (self.registration.navigationPreload) return self.registration.navigationPreload.enable().catch(function () {});
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'GET_VERSION' && event.ports[0]) event.ports[0].postMessage(VERSION);
});

// Clé d'enregistrement d'une page : sans les paramètres (?section=GS…)
function pageKey(url) {
  var u = new URL(url);
  var path = u.pathname.replace(/^.*\//, '');
  return path === '' ? './' : path;
}

function fromCache(request, isPage) {
  var key = isPage ? pageKey(request.url) : request;
  return caches.match(key, { ignoreSearch: isPage }).then(function (hit) {
    if (hit || !isPage) return hit;
    return caches.match('offline.html');
  });
}

// Le réseau d'abord ; la copie enregistrée si le réseau échoue ou tarde
function networkFirst(event, isPage) {
  var request = event.request;
  var network = Promise.resolve(isPage ? event.preloadResponse : null).then(function (pre) {
    return pre || fetch(request);
  }).then(function (res) {
    if (res && res.ok && res.type === 'basic') {
      var copy = res.clone();
      event.waitUntil(clean(copy).then(function (r) {
        // Même cache que le précache : la nouvelle copie remplace l'ancienne
        return caches.open(CORE).then(function (c) { return c.put(isPage ? pageKey(request.url) : request.url.split('?')[0], r); });
      }).catch(function () {}));
    }
    return res;
  });

  return new Promise(function (resolve) {
    var done = false;
    var finish = function (res) { if (!done && res) { done = true; resolve(res); } };
    // Réseau trop lent : on sert la copie enregistrée (jamais la page « hors ligne »,
    // le réseau peut encore répondre)
    var timer = setTimeout(function () {
      caches.match(isPage ? pageKey(request.url) : request, { ignoreSearch: isPage }).then(finish);
    }, NETWORK_TIMEOUT);
    network.then(function (res) {
      clearTimeout(timer);
      if (res && (res.ok || res.type === 'opaqueredirect' || !isPage)) return finish(res);
      // Erreur du serveur sur une page : la copie, sinon la réponse telle quelle
      return fromCache(request, isPage).then(function (hit) { finish(hit || res); });
    }, function () {
      clearTimeout(timer);
      fromCache(request, isPage).then(function (hit) {
        finish(hit || new Response('Hors ligne', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
      });
    });
  });
}

// La copie d'abord (adresses versionnées des CDN), sinon le réseau
function cacheFirst(request) {
  return caches.open(CDN).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone()).catch(function () {});
        return res;
      });
    });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);

  if (url.origin === self.location.origin) {
    // Le service worker lui-même et le dossier ressources ne passent pas par ici
    if (url.pathname.endsWith('/sw.js') || url.pathname.indexOf('/ressources/') >= 0) return;
    var isPage = request.mode === 'navigate' || (request.headers.get('accept') || '').indexOf('text/html') >= 0;
    event.respondWith(networkFirst(event, isPage));
    return;
  }

  if (CDN_HOSTS.indexOf(url.hostname) >= 0) {
    event.respondWith(cacheFirst(request).catch(function () {
      return new Response('', { status: 504 });
    }));
  }
  // Autres adresses (Supabase, WhatsApp…) : le navigateur s'en occupe
});
