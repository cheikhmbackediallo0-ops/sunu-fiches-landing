/* ==========================================================================
   SUÑU FICHES — installation de l'application (PWA)
   - Enregistre le service worker (sw.js).
   - Bouton « Installer » :
       Android, ordinateur (Chrome, Edge, Samsung Internet) : fenêtre officielle du navigateur ;
       iPhone / iPad, Safari sur Mac, Firefox Android : instructions pas à pas
       (ces navigateurs n'ont pas de bouton d'installation programmable).
   - Bandeau « Nouvelle version disponible » : la mise à jour se fait sur demande,
     jamais pendant la modification d'une fiche.
   - Message hors ligne / de retour en ligne.
   ========================================================================== */
(function () {
  'use strict';

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var isMacSafari = !isIOS && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
  var isFirefoxAndroid = isAndroid && /Firefox/.test(ua);
  var DISMISS_KEY = 'sunu_install_banner_off';

  function standalone() {
    return (window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: minimal-ui)').matches)) ||
      window.navigator.standalone === true;
  }
  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { return null; }
  }
  function say(msg) { if (window.SUNU && SUNU.toast) SUNU.toast(msg); }

  var ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';
  var ICON_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ---------- Service worker ----------
  var canSW = 'serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');

  function showUpdate(worker) {
    if (document.getElementById('pwaUpdate')) return;
    var bar = document.createElement('div');
    bar.id = 'pwaUpdate';
    bar.className = 'pwa-bar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>Nouvelle version de SUÑU FICHES disponible.</span>' +
      '<button type="button" class="btn btn-primary btn-sm" data-pwa-update>Mettre à jour</button>' +
      '<button type="button" class="pwa-bar-close" data-pwa-later aria-label="Plus tard">' + ICON_X + '</button>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('is-visible'); });
    bar.querySelector('[data-pwa-update]').addEventListener('click', function () {
      // Une fiche en cours de modification ? On l'enregistre d'abord.
      var save = document.getElementById('btnEditSave');
      var editBar = document.getElementById('editBar');
      if (save && editBar && !editBar.hidden) save.click();
      worker.postMessage({ type: 'SKIP_WAITING' });
      bar.querySelector('[data-pwa-update]').disabled = true;
    });
    bar.querySelector('[data-pwa-later]').addEventListener('click', function () { bar.remove(); });
  }

  if (canSW) {
    window.addEventListener('load', function () {
      var hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
        if (reg.waiting && hadController) showUpdate(reg.waiting);
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw);
          });
        });
        // Vérifier les mises à jour quand on revient sur l'application
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') reg.update().catch(function () {});
        });
      }).catch(function () { /* navigateur sans service worker : le site marche quand même */ });

      var reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!hadController) { hadController = true; return; } // première installation : pas de rechargement
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });
    });
  }

  // Garder les fiches enregistrées même si le téléphone manque de place
  function persist() {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persisted().then(function (ok) { if (!ok) return navigator.storage.persist(); }).catch(function () {});
    }
  }
  if (standalone()) persist();

  // ---------- Installation ----------
  var deferred = null;
  var buttons = [];

  function manualHelp() {
    if (isIOS) return 'ios';
    if (isMacSafari) return 'mac';
    if (isFirefoxAndroid) return 'firefox';
    return null;
  }
  function installable() { return !standalone() && (deferred || manualHelp()); }

  function refresh() {
    var ok = !!installable();
    buttons.forEach(function (b) { b.hidden = !ok; });
    if (ok) maybeBanner(); else hideBanner();
  }

  function makeButton() {
    var slot = document.querySelector('.header-actions') || document.querySelector('.auth-top');
    if (!slot || slot.querySelector('[data-pwa-install]')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-outline btn-sm pwa-install';
    b.setAttribute('data-pwa-install', '');
    b.setAttribute('aria-label', "Installer l'application");
    b.title = "Installer l'application sur cet appareil";
    b.innerHTML = ICON_DL + '<span class="pwa-install-label">Installer</span>';
    b.hidden = true;
    var before = slot.querySelector('[data-theme-toggle]');
    slot.insertBefore(b, before || null);
    b.addEventListener('click', install);
    buttons.push(b);
  }

  function install() {
    var kind = manualHelp();
    // iPhone / iPad : jamais de fenêtre automatique, seulement les instructions
    if (deferred && kind !== 'ios') {
      var ev = deferred;
      var shown;
      try { shown = ev.prompt(); } catch (e) { shown = Promise.reject(e); }
      Promise.resolve(shown).then(function () {
        deferred = null;
        return ev.userChoice;
      }).then(function (choice) {
        if (choice && choice.outcome === 'accepted') { hideBanner(); store(DISMISS_KEY, String(Date.now())); }
        refresh();
      }, function () {
        // Fenêtre refusée par le navigateur : on garde l'événement pour un autre essai
        if (kind) openHelp(kind); else say("Utilisez le menu du navigateur : « Installer l'application »");
      });
      return;
    }
    if (kind) openHelp(kind);
  }

  function openHelp(kind) {
    hideBanner();
    var modal = document.getElementById('pwaHelp');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pwaHelp';
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'pwaHelpTitle');
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-pwa-close]')) closeHelp(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeHelp(); });
    }
    var steps, title, note = '';
    if (kind === 'ios') {
      var ipad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      title = 'Installer sur ' + (ipad ? 'iPad' : 'iPhone');
      steps = [
        'Touchez le bouton <strong>Partager</strong> <span class="pwa-ico">' + ICON_SHARE + '</span> ' + (ipad ? 'en haut' : 'en bas') + ' de l\'écran.',
        'Faites défiler et choisissez <strong>Sur l\'écran d\'accueil</strong> <span class="pwa-ico">' + ICON_PLUS + '</span>.',
        'Touchez <strong>Ajouter</strong>. L\'icône SUÑU FICHES apparaît sur l\'écran d\'accueil.'
      ];
      if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) note = 'Si vous ne voyez pas « Sur l\'écran d\'accueil », ouvrez cette page dans <strong>Safari</strong>.';
      else note = 'Sur iPhone, l\'application garde ses propres données : reconnectez-vous une fois dans l\'application installée.';
    } else if (kind === 'mac') {
      title = 'Installer sur Mac';
      steps = [
        'Dans la barre de menus de Safari, ouvrez <strong>Fichier</strong>.',
        'Choisissez <strong>Ajouter au Dock</strong>.',
        'Cliquez sur <strong>Ajouter</strong>. SUÑU FICHES s\'ouvre ensuite comme une application.'
      ];
      note = 'Cette option demande macOS Sonoma (Safari 17) ou plus récent. Sinon, utilisez Chrome ou Edge.';
    } else {
      title = 'Installer avec Firefox';
      steps = [
        'Touchez le menu <strong>⋮</strong> en haut ou en bas de l\'écran.',
        'Choisissez <strong>Installer</strong> (ou <strong>Ajouter à l\'écran d\'accueil</strong>).',
        'Confirmez. L\'icône SUÑU FICHES apparaît sur l\'écran d\'accueil.'
      ];
    }
    modal.innerHTML =
      '<div class="modal-card pwa-help">' +
        '<button type="button" class="icon-btn modal-close" data-pwa-close aria-label="Fermer">' + ICON_X + '</button>' +
        '<div class="pwa-help-head"><img src="assets/icons/icon-192.png" alt="" width="56" height="56"><div><h2 id="pwaHelpTitle">' + title + '</h2><p>Trois gestes, moins d\'une minute.</p></div></div>' +
        '<ol class="pwa-steps">' + steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
        (note ? '<p class="pwa-note">' + note + '</p>' : '') +
        '<button type="button" class="btn btn-primary btn-block" data-pwa-close>J\'ai compris</button>' +
      '</div>';
    modal.classList.add('is-open');
    var close = modal.querySelector('.modal-close');
    if (close) close.focus();
  }
  function closeHelp() {
    var modal = document.getElementById('pwaHelp');
    if (modal) modal.classList.remove('is-open');
  }

  // Bandeau discret (une fois tous les 14 jours au plus, refermable)
  var bannerTimer = null;
  function maybeBanner() {
    if (document.getElementById('pwaBanner') || bannerTimer) return;
    var off = +store(DISMISS_KEY) || 0;
    if (Date.now() - off < 14 * 864e5) return;
    bannerTimer = setTimeout(function () {
      bannerTimer = null;
      if (!installable() || document.getElementById('pwaBanner')) return;
      var bar = document.createElement('div');
      bar.id = 'pwaBanner';
      bar.className = 'pwa-bar pwa-banner';
      bar.innerHTML = '<img src="assets/icons/icon-192.png" alt="" width="40" height="40">' +
        '<span><strong>Installez SUÑU FICHES</strong><small>Sur l\'écran d\'accueil, même sans Internet.</small></span>' +
        '<button type="button" class="btn btn-primary btn-sm" data-pwa-banner-install>Installer</button>' +
        '<button type="button" class="pwa-bar-close" data-pwa-banner-close aria-label="Fermer">' + ICON_X + '</button>';
      document.body.appendChild(bar);
      requestAnimationFrame(function () { bar.classList.add('is-visible'); });
      bar.querySelector('[data-pwa-banner-install]').addEventListener('click', function () { hideBanner(); install(); });
      bar.querySelector('[data-pwa-banner-close]').addEventListener('click', function () { store(DISMISS_KEY, String(Date.now())); hideBanner(); });
    }, 2500);
  }
  function hideBanner() {
    clearTimeout(bannerTimer); bannerTimer = null;
    var bar = document.getElementById('pwaBanner');
    if (bar) bar.remove();
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();          // on garde la fenêtre pour notre bouton
    deferred = e;
    refresh();
  });
  window.addEventListener('appinstalled', function () {
    deferred = null;
    hideBanner();
    store(DISMISS_KEY, String(Date.now()));
    refresh();
    persist();
    say('SUÑU FICHES est installée sur cet appareil');
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(display-mode: standalone)');
    if (mq.addEventListener) mq.addEventListener('change', refresh);
  }

  // ---------- Hors ligne ----------
  window.addEventListener('offline', function () { say('Hors ligne : vos fiches et le générateur restent disponibles'); });
  window.addEventListener('online', function () { say('De nouveau en ligne'); });

  function init() { makeButton(); refresh(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.SUNU_PWA = { install: install, standalone: standalone };
})();
