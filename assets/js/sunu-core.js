/* ==========================================================================
   SUÑU FICHES — fonctions communes à toutes les pages
   - thème clair / sombre
   - comptes enseignants (inscription, connexion, déconnexion)
   - historique des fiches
   - fenêtre d'abonnement (Wave / Orange Money / Free Money + WhatsApp)

   Les comptes sont enregistrés dans le navigateur (localStorage) : ils restent
   sur l'appareil utilisé. Pour des comptes accessibles depuis n'importe quel
   téléphone, il faudra brancher un service en ligne (Supabase, Firebase…) :
   seul l'objet SUNU.auth est à remplacer.
   ========================================================================== */
(function () {
  'use strict';

  var PAY_NUMBER = '77 533 56 04';
  var WHATSAPP_NUMBER = '221775335604';
  var KEY_USERS = 'sunu_users_v2';
  var KEY_SESSION = 'sunu_session_v2';
  var KEY_THEME = 'sunu_theme';
  var KEY_FICHES = 'sunu_fiches_v1_';

  // ---------- Stockage (toujours protégé : navigation privée, stockage bloqué…) ----------
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    remove: function (key) {
      try { window.localStorage.removeItem(key); } catch (e) { /* rien */ }
    }
  };

  // ---------- Petits outils ----------
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); }
      catch (err) { reject(err); }
      finally { document.body.removeChild(ta); }
    });
  }

  var toastTimer = null;
  function toast(message) {
    var el = document.getElementById('sunuToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sunuToast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'SF';
    var a = parts[0].charAt(0);
    var b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : (parts[0].charAt(1) || '');
    return (a + b).toUpperCase();
  }

  function firstName(name) {
    var parts = String(name || '').trim().split(/\s+/);
    return parts[0] || '';
  }

  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name); }
    catch (e) { return null; }
  }

  // ---------- Thème ----------
  var ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function paintThemeButtons() {
    var dark = currentTheme() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.innerHTML = dark ? ICON_SUN : ICON_MOON;
      btn.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode sombre');
      btn.title = btn.getAttribute('aria-label');
    });
  }

  function initTheme() {
    paintThemeButtons();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { window.localStorage.setItem(KEY_THEME, next); } catch (e) { /* rien */ }
        paintThemeButtons();
      });
    });
  }

  // ---------- Comptes ----------
  function normalizePhone(raw) {
    var digits = String(raw || '').replace(/\D/g, '').replace(/^(00)?221/, '');
    return digits.length === 9 ? digits : null;
  }

  function formatPhone(digits) {
    return digits.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
  }

  function randomSalt() {
    var bytes = new Uint8Array(12);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  // Empreinte du mot de passe (jamais stocké en clair)
  function hashPassword(password, salt) {
    var text = salt + ':' + password;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return 'sha256:' + Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    }
    // Repli (page ouverte hors https sur un vieux navigateur)
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Promise.resolve('fnv:' + (h >>> 0).toString(16));
  }

  // Deux modes :
  // - en ligne (Supabase configuré dans sunu-config.js) : vrai compte, e-mail de confirmation ;
  // - local (sans configuration) : compte enregistré sur l'appareil, sans e-mail.
  var CFG = window.SUNU_CONFIG || {};
  var REMOTE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  var SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  var clientPromise = null;

  function supa() {
    if (!clientPromise) {
      clientPromise = new Promise(function (resolve, reject) {
        function make() {
          resolve(window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
          }));
        }
        if (window.supabase && window.supabase.createClient) return make();
        var s = document.createElement('script');
        s.src = SUPABASE_JS;
        s.onload = make;
        s.onerror = function () { clientPromise = null; reject({ message: 'Connexion impossible. Vérifiez votre accès à Internet puis réessayez.' }); };
        document.head.appendChild(s);
      });
    }
    return clientPromise;
  }

  function siteBase() {
    return window.location.href.split('#')[0].split('?')[0].replace(/[^/]*$/, '');
  }

  function cleanName(s) { return String(s || '').trim().replace(/\s+/g, ' '); }
  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

  function profileFromSupabase(u) {
    var m = (u && u.user_metadata) || {};
    var prenom = cleanName(m.prenom), nom = cleanName(m.nom);
    return { id: u.id, email: u.email, prenom: prenom, nom: nom, name: cleanName(prenom + ' ' + nom) || u.email, createdAt: u.created_at };
  }

  function publicUser(u) {
    if (!u) return null;
    return {
      id: u.id, email: u.email || '', prenom: u.prenom || '', nom: u.nom || '', name: u.name || '',
      phone: u.phone || '', school: u.school || '', ief: u.ief || '',
      plan: u.plan || 'essai', planRequest: u.planRequest || null, createdAt: u.createdAt, direct: !!u.direct
    };
  }

  // Le profil de la personne connectée est gardé en cache pour que chaque page
  // le connaisse tout de suite ; en mode en ligne, la session Supabase est vérifiée ensuite.
  function cacheSession(profile) {
    var prev = store.get(KEY_SESSION, null);
    if (prev && prev.id === profile.id) {
      ['phone', 'school', 'ief', 'plan', 'planRequest'].forEach(function (k) { if (prev[k] && !profile[k]) profile[k] = prev[k]; });
    }
    store.set(KEY_SESSION, profile);
    return publicUser(profile);
  }

  function checkSignup(data) {
    var prenom = cleanName(data.prenom), nom = cleanName(data.nom);
    var email = String(data.email || '').trim().toLowerCase();
    var password = String(data.password || '');
    if (prenom.length < 2) return { field: 'prenom', message: 'Indiquez votre prénom.' };
    if (nom.length < 2) return { field: 'nom', message: 'Indiquez votre nom.' };
    if (!validEmail(email)) return { field: 'email', message: 'Indiquez une adresse e-mail valide (ex : awa.ndiaye@gmail.com).' };
    if (password.length < 6) return { field: 'password', message: 'Le mot de passe doit avoir au moins 6 caractères.' };
    if (password !== String(data.confirm || '')) return { field: 'confirm', message: 'Les deux mots de passe ne sont pas identiques.' };
    return { prenom: prenom, nom: nom, email: email, password: password };
  }

  function remoteError(err) {
    var msg = String((err && err.message) || '');
    if (/already registered|already exists/i.test(msg)) return { field: 'email', message: 'Un compte existe déjà avec cette adresse. Connectez-vous.' };
    if (/not confirmed/i.test(msg)) return { code: 'unconfirmed', field: 'email', message: "Votre adresse n'est pas encore confirmée. Ouvrez le lien reçu par e-mail, puis reconnectez-vous." };
    if (/invalid login credentials/i.test(msg)) return { field: 'password', message: 'Adresse e-mail ou mot de passe incorrect.' };
    if (/rate limit|too many/i.test(msg)) return { message: 'Trop de tentatives. Patientez quelques minutes puis réessayez.' };
    if (/password/i.test(msg)) return { field: 'password', message: 'Ce mot de passe est refusé. Choisissez-en un plus long.' };
    return { message: msg || 'Une erreur est survenue. Réessayez.' };
  }

  var auth = {
    remote: REMOTE,
    // Accès direct sans compte (phase de test, réglage accesDirect de sunu-config.js)
    directAllowed: CFG.accesDirect === true,
    direct: function () {
      var profile = { id: 'acces-direct', email: '', prenom: 'Enseignant(e)', nom: '', name: 'Enseignant(e)', direct: true, plan: 'essai', createdAt: new Date().toISOString() };
      var prev = store.get(KEY_SESSION, null);
      if (prev && prev.direct) profile = prev;
      store.set(KEY_SESSION, profile);
      return publicUser(profile);
    },


    current: function () {
      var s = store.get(KEY_SESSION, null);
      if (!s || !s.id) return null;
      if (s.direct) return CFG.accesDirect === true ? publicUser(s) : null;
      if (REMOTE) return publicUser(s);
      var users = store.get(KEY_USERS, {});
      return publicUser(users[s.id]);
    },

    // Résultat : { status: 'ok', user } ou { status: 'verify', email } (e-mail de confirmation envoyé)
    register: function (data) {
      var d = checkSignup(data);
      if (d.message) return Promise.reject(d);
      if (REMOTE) {
        return supa().then(function (client) {
          return client.auth.signUp({
            email: d.email, password: d.password,
            options: { data: { prenom: d.prenom, nom: d.nom }, emailRedirectTo: siteBase() + 'index.html?confirme=1' }
          });
        }).then(function (res) {
          if (res.error) throw remoteError(res.error);
          var u = res.data && res.data.user;
          // Supabase ne signale pas toujours un e-mail déjà inscrit : identités vides = compte existant
          if (u && u.identities && u.identities.length === 0) throw remoteError({ message: 'already registered' });
          if (res.data.session) return { status: 'ok', user: cacheSession(profileFromSupabase(u)) };
          return { status: 'verify', email: d.email };
        });
      }
      var users = store.get(KEY_USERS, {});
      if (users[d.email]) return Promise.reject({ field: 'email', message: 'Un compte existe déjà avec cette adresse sur cet appareil. Connectez-vous.' });
      var salt = randomSalt();
      return hashPassword(d.password, salt).then(function (hash) {
        users[d.email] = {
          id: d.email, email: d.email, prenom: d.prenom, nom: d.nom, name: d.prenom + ' ' + d.nom,
          plan: 'essai', salt: salt, hash: hash, createdAt: new Date().toISOString()
        };
        if (!store.set(KEY_USERS, users)) throw { message: "Votre navigateur bloque l'enregistrement. Quittez la navigation privée puis réessayez." };
        store.set(KEY_SESSION, { id: d.email });
        return { status: 'ok', user: publicUser(users[d.email]) };
      });
    },

    login: function (emailRaw, password) {
      var email = String(emailRaw || '').trim().toLowerCase();
      if (!validEmail(email)) return Promise.reject({ field: 'email', message: 'Indiquez votre adresse e-mail.' });
      if (!password) return Promise.reject({ field: 'password', message: 'Indiquez votre mot de passe.' });
      if (REMOTE) {
        return supa().then(function (client) {
          return client.auth.signInWithPassword({ email: email, password: String(password) });
        }).then(function (res) {
          if (res.error) throw remoteError(res.error);
          var user = cacheSession(profileFromSupabase(res.data.user));
          // Récupère le profil et les fiches enregistrés en ligne avant d'ouvrir la page suivante
          return sync.pull().then(function () { return auth.current() || user; });
        });
      }
      var users = store.get(KEY_USERS, {});
      var u = users[email];
      if (!u) return Promise.reject({ field: 'email', message: "Aucun compte avec cette adresse sur cet appareil. Créez votre compte avec l'onglet « S'inscrire »." });
      return hashPassword(String(password), u.salt).then(function (hash) {
        if (hash !== u.hash) throw { field: 'password', message: 'Mot de passe incorrect.' };
        store.set(KEY_SESSION, { id: email });
        return publicUser(u);
      });
    },

    // Renvoyer l'e-mail de confirmation
    resend: function (emailRaw) {
      if (!REMOTE) return Promise.resolve();
      var email = String(emailRaw || '').trim().toLowerCase();
      return supa().then(function (client) {
        return client.auth.resend({ type: 'signup', email: email, options: { emailRedirectTo: siteBase() + 'index.html?confirme=1' } });
      }).then(function (res) { if (res.error) throw remoteError(res.error); });
    },

    // Après un clic sur le lien de confirmation : Supabase ouvre une session depuis l'adresse de la page
    fromRedirect: function () {
      if (!REMOTE) return Promise.resolve(null);
      var url = window.location.href;
      if (!/access_token=|[?&]code=|confirme=1|error_description=/.test(url)) return Promise.resolve(null);
      return supa().then(function (client) { return client.auth.getSession(); }).then(function (res) {
        var session = res && res.data && res.data.session;
        if (!session) return null;
        var user = cacheSession(profileFromSupabase(session.user));
        return sync.pull().then(function () { return auth.current() || user; });
      }).catch(function () { return null; });
    },

    update: function (fields) {
      var s = store.get(KEY_SESSION, null);
      if (!s || !s.id) return null;
      if (REMOTE || s.direct) {
        Object.keys(fields).forEach(function (k) { s[k] = fields[k]; });
        store.set(KEY_SESSION, s);
        if (REMOTE && !s.direct) sync.pushProfile(s);
        return publicUser(s);
      }
      var users = store.get(KEY_USERS, {});
      if (!users[s.id]) return null;
      Object.keys(fields).forEach(function (k) { users[s.id][k] = fields[k]; });
      store.set(KEY_USERS, users);
      return publicUser(users[s.id]);
    },

    logout: function () {
      store.remove(KEY_SESSION);
      if (!REMOTE) return Promise.resolve();
      return supa().then(function (client) { return client.auth.signOut(); }).catch(function () {});
    }
  };

  // Pages réservées aux comptes connectés
  function goLogin() {
    var here = window.location.pathname.split('/').pop() + window.location.search;
    window.location.replace('index.html?next=' + encodeURIComponent(here));
  }
  function requireAuth() {
    var user = auth.current();
    if (!user) { goLogin(); return null; }
    if (REMOTE && !user.direct) {
      // Session expirée ou fermée ailleurs : retour à la connexion
      supa().then(function (client) { return client.auth.getSession(); }).then(function (res) {
        if (!res || !res.data || !res.data.session) { store.remove(KEY_SESSION); goLogin(); }
        else sync.pull(); // fiches faites sur un autre appareil
      }).catch(function () { /* hors ligne : on garde la session en cache */ });
    }
    return user;
  }

  function safeNext(next) {
    // Uniquement une page du site (pas d'adresse externe)
    if (next && /^[a-z0-9-]+\.html(\?[\w=&%.-]*)?$/i.test(next)) return next;
    return 'accueil.html';
  }

  function renderUser(user) {
    if (!user) return;
    document.querySelectorAll('[data-user-name]').forEach(function (el) { el.textContent = user.name; });
    document.querySelectorAll('[data-user-first]').forEach(function (el) { el.textContent = user.prenom || firstName(user.name); });
    document.querySelectorAll('[data-user-initials]').forEach(function (el) { el.textContent = initials(user.name); });
    document.querySelectorAll('[data-logout]').forEach(function (el) {
      el.addEventListener('click', function () {
        auth.logout().then(function () { window.location.href = 'index.html'; });
      });
    });
  }

  // ---------- Historique des fiches ----------
  var fiches = {
    list: function () {
      var u = auth.current();
      return u ? store.get(KEY_FICHES + u.id, []) : [];
    },
    get: function (id) {
      return fiches.list().filter(function (f) { return f.id === id; })[0] || null;
    },
    save: function (entry) {
      var u = auth.current();
      if (!u) return null;
      var list = store.get(KEY_FICHES + u.id, []);
      entry.id = entry.id || ('f' + Date.now().toString(36));
      entry.createdAt = new Date().toISOString();
      list = list.filter(function (f) { return f.id !== entry.id; });
      list.unshift(entry);
      store.set(KEY_FICHES + u.id, list.slice(0, 40));
      sync.pushFiche(entry);
      return entry;
    },
    remove: function (id) {
      var u = auth.current();
      if (!u) return;
      store.set(KEY_FICHES + u.id, fiches.list().filter(function (f) { return f.id !== id; }));
      sync.run(function (client) { return client.from('fiches').delete().eq('id', id); });
    }
  };

  // ---------- Synchronisation avec Supabase (comptes en ligne) ----------
  // Le navigateur garde une copie (les pages restent rapides et marchent hors ligne) ;
  // chaque changement est aussi envoyé à la base, et la base est relue à la connexion.
  var sync = {
    user: function () {
      var u = auth.current();
      return REMOTE && u && !u.direct ? u : null;
    },
    run: function (fn) {
      if (!sync.user()) return Promise.resolve(null);
      return supa().then(fn).then(function (res) {
        if (res && res.error) console.warn('Supabase :', res.error.message);
        return res;
      }).catch(function (e) { console.warn('Supabase :', e && e.message); return null; });
    },
    pushProfile: function (s) {
      return sync.run(function (client) {
        return client.from('profiles').update({
          prenom: s.prenom || '', nom: s.nom || '',
          telephone: s.phone || null, ecole: s.school || null, ief: s.ief || null
        }).eq('id', s.id);
      });
    },
    pushFiche: function (f) {
      var p = f.params || {};
      return sync.run(function (client) {
        return client.from('fiches').upsert({
          id: f.id, titre: p.os || p.activiteLabel || null, cycle: p.cycle || null, niveau: p.niveau || null,
          params: p, html: f.html || null, cree_le: f.createdAt
        }, { onConflict: 'user_id,id' });
      });
    },
    pushDemande: function (d) {
      return sync.run(function (client) { return client.from('demandes_abonnement').insert(d); });
    },
    // Relit le profil et les fiches enregistrés en ligne
    pull: function () {
      var u = sync.user();
      if (!u) return Promise.resolve();
      return supa().then(function (client) {
        return Promise.all([
          client.from('profiles').select('prenom, nom, telephone, ecole, ief, plan, plan_expire_le').eq('id', u.id).maybeSingle(),
          client.from('fiches').select('id, params, html, cree_le, modifie_le').order('modifie_le', { ascending: false }).limit(40)
        ]);
      }).then(function (r) {
        var p = r[0] && r[0].data;
        var s = store.get(KEY_SESSION, null);
        if (p && s && s.id === u.id) {
          if (p.telephone) s.phone = p.telephone;
          if (p.ecole) s.school = p.ecole;
          if (p.ief) s.ief = p.ief;
          s.plan = p.plan || 'essai';
          s.planExpire = p.plan_expire_le || null;
          store.set(KEY_SESSION, s);
        }
        var remote = r[1] && !r[1].error ? r[1].data : null;
        if (remote) {
          var byId = {};
          remote.forEach(function (f) {
            var e = { id: f.id, params: f.params || {}, createdAt: f.modifie_le || f.cree_le };
            if (f.html) e.html = f.html;
            byId[f.id] = e;
          });
          // Fiches faites hors ligne et pas encore envoyées
          store.get(KEY_FICHES + u.id, []).forEach(function (f) {
            if (!byId[f.id]) { byId[f.id] = f; sync.pushFiche(f); }
          });
          var list = Object.keys(byId).map(function (k) { return byId[k]; })
            .sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
          store.set(KEY_FICHES + u.id, list.slice(0, 40));
        }
        document.dispatchEvent(new CustomEvent('sunu:synced'));
      }).catch(function (e) { console.warn('Supabase :', e && e.message); });
    }
  };

  // ---------- Abonnement (Wave / Orange Money / Free Money + WhatsApp) ----------
  var PLANS = {
    monthly: { title: 'Abonnement mensuel', amount: '1 500 F CFA', per: '/ mois' },
    yearly: { title: 'Abonnement annuel', amount: '7 500 F CFA', per: '/ an' }
  };
  var PAY = {
    wave: { label: 'Wave', hint: '0 % de frais', how: 'Envoyez le montant au compte Wave' },
    om: { label: 'Orange Money', hint: '#144#', how: 'Transférez le montant par Orange Money (#144#) au' },
    free: { label: 'Free Money', hint: '#150#', how: 'Transférez le montant par Free Money (#150#) au' }
  };
  var checkout = { plan: 'yearly', pay: 'wave', url: '' };

  function buildCheckout() {
    var el = document.createElement('div');
    el.className = 'modal';
    el.id = 'checkoutModal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'coTitle');
    el.innerHTML =
      '<div class="modal-card">' +
        '<button type="button" class="icon-btn modal-close" data-co-close aria-label="Fermer">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
        '</button>' +
        '<h3 id="coTitle" style="font-size:1.35rem;padding-right:48px;">Activer mon abonnement</h3>' +
        '<div class="modal-plan"><div><small>Formule choisie</small><strong id="coPlanTitle"></strong></div><div class="amount" id="coPlanAmount"></div></div>' +
        '<div id="coStepForm" class="modal-body">' +
          '<div class="grid-2">' +
            '<div class="field"><label for="coName">Prénom et nom</label><input class="input" id="coName" autocomplete="name"></div>' +
            '<div class="field"><label for="coPhone">Téléphone WhatsApp</label><input class="input" id="coPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="77 123 45 67"></div>' +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field"><label for="coSchool">École</label><input class="input" id="coSchool" placeholder="ex : École Mbour 1"></div>' +
            '<div class="field"><label for="coIef">IEF</label><input class="input" id="coIef" placeholder="ex : IEF Mbour"></div>' +
          '</div>' +
          '<div class="field"><span class="field-label" id="coPayLabel">Moyen de paiement</span>' +
            '<div class="pay-grid" role="group" aria-labelledby="coPayLabel">' +
              Object.keys(PAY).map(function (k) {
                return '<button type="button" class="pay-opt" data-co-pay="' + k + '" aria-pressed="false">' + PAY[k].label + '<small>' + PAY[k].hint + '</small></button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="pay-info" id="coPayInfo"></div>' +
          '<div class="form-error" id="coError" role="alert"></div>' +
          '<button type="button" class="btn btn-outline btn-block" id="coCopy">Copier le numéro ' + PAY_NUMBER + '</button>' +
          '<button type="button" class="btn btn-whatsapp btn-lg btn-block" id="coConfirm">J\'ai payé · Confirmer sur WhatsApp</button>' +
          '<p class="form-note" style="text-align:center;">Votre accès est activé dès que le paiement est vérifié. Vous recevez la confirmation sur WhatsApp.</p>' +
        '</div>' +
        '<div id="coStepDone" class="modal-body" hidden style="text-align:center;">' +
          '<div class="success-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17 19 7"/></svg></div>' +
          '<h3 style="font-size:1.4rem;">Demande envoyée</h3>' +
          '<p>Envoyez le message WhatsApp qui vient de s\'ouvrir. Votre abonnement sera activé sur le <strong id="coDonePhone"></strong> après vérification du paiement.</p>' +
          '<div class="ref-box">Référence : <strong id="coRef"></strong></div>' +
          '<button type="button" class="btn btn-outline btn-block" id="coRetry">Le message ne s\'est pas ouvert ? Réessayer</button>' +
          '<button type="button" class="btn btn-primary btn-block" data-co-close>Terminer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    el.addEventListener('click', function (e) {
      if (e.target === el || e.target.closest('[data-co-close]')) closeCheckout();
      var pay = e.target.closest('[data-co-pay]');
      if (pay) selectPay(pay.getAttribute('data-co-pay'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.classList.contains('is-open')) closeCheckout();
    });
    el.querySelector('#coCopy').addEventListener('click', function () {
      var btn = this;
      copyText(PAY_NUMBER.replace(/\s/g, '')).then(function () {
        btn.textContent = 'Numéro copié : ' + PAY_NUMBER;
      }).catch(function () {
        btn.textContent = 'Numéro : ' + PAY_NUMBER;
      });
      setTimeout(function () { btn.textContent = 'Copier le numéro ' + PAY_NUMBER; }, 2500);
    });
    el.querySelector('#coConfirm').addEventListener('click', confirmCheckout);
    el.querySelector('#coRetry').addEventListener('click', function () {
      if (checkout.url) window.location.href = checkout.url;
    });
    return el;
  }

  function selectPay(key) {
    checkout.pay = key;
    var modal = document.getElementById('checkoutModal');
    modal.querySelectorAll('[data-co-pay]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-co-pay') === key));
    });
    modal.querySelector('#coPayInfo').innerHTML =
      escapeHtml(PAY[key].how) + ' <span class="num">' + PAY_NUMBER + '</span> : <strong>' + PLANS[checkout.plan].amount + '</strong>' +
      (key === 'wave' ? ' (titulaire : Cheikh Mbacké Diallo / SUÑU FICHES).' : '.');
  }

  var lastFocus = null;
  function openCheckout(plan) {
    checkout.plan = PLANS[plan] ? plan : 'yearly';
    var modal = document.getElementById('checkoutModal') || buildCheckout();
    var u = auth.current();
    modal.querySelector('#coPlanTitle').textContent = PLANS[checkout.plan].title;
    modal.querySelector('#coPlanAmount').textContent = PLANS[checkout.plan].amount + ' ' + PLANS[checkout.plan].per;
    if (u) {
      modal.querySelector('#coName').value = modal.querySelector('#coName').value || u.name || '';
      modal.querySelector('#coPhone').value = modal.querySelector('#coPhone').value || u.phone || '';
      modal.querySelector('#coSchool').value = modal.querySelector('#coSchool').value || u.school || '';
      modal.querySelector('#coIef').value = modal.querySelector('#coIef').value || u.ief || '';
    }
    modal.querySelector('#coStepForm').hidden = false;
    modal.querySelector('#coStepDone').hidden = true;
    modal.querySelector('#coError').classList.remove('is-visible');
    selectPay(checkout.pay);
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('#coName').focus();
  }

  function closeCheckout() {
    var modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    document.dispatchEvent(new CustomEvent('sunu:checkout-closed'));
  }

  function confirmCheckout() {
    var modal = document.getElementById('checkoutModal');
    var err = modal.querySelector('#coError');
    var name = modal.querySelector('#coName').value.trim();
    var phoneRaw = modal.querySelector('#coPhone').value.trim();
    var school = modal.querySelector('#coSchool').value.trim();
    var ief = modal.querySelector('#coIef').value.trim();
    var showErr = function (msg, id) { err.textContent = msg; err.classList.add('is-visible'); modal.querySelector(id).focus(); };
    if (!name) return showErr('Indiquez votre prénom et votre nom.', '#coName');
    var digits = normalizePhone(phoneRaw);
    if (!digits) return showErr('Indiquez un numéro à 9 chiffres (ex : 77 123 45 67).', '#coPhone');
    err.classList.remove('is-visible');

    var ref = 'SF-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    var plan = PLANS[checkout.plan];
    var lines = [
      'Bonjour SUÑU FICHES ! 👋',
      'Je souhaite activer mon compte :',
      '- Référence : ' + ref,
      '- Nom : ' + name,
      '- Téléphone : ' + formatPhone(digits)
    ];
    if (school) lines.push('- École : ' + school);
    if (ief) lines.push('- IEF : ' + ief);
    lines.push('- Formule : ' + plan.title + ' (' + plan.amount + ')');
    lines.push('- Paiement effectué via : ' + PAY[checkout.pay].label);
    checkout.url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(checkout.url, '_blank', 'noopener');

    if (auth.current()) auth.update({ phone: formatPhone(digits), school: school || auth.current().school, ief: ief || auth.current().ief, planRequest: { plan: checkout.plan, ref: ref, at: new Date().toISOString() } });
    sync.pushDemande({
      reference: ref, nom: name, telephone: formatPhone(digits), ecole: school || null, ief: ief || null,
      formule: checkout.plan, moyen_paiement: checkout.pay
    });
    modal.querySelector('#coDonePhone').textContent = formatPhone(digits);
    modal.querySelector('#coRef').textContent = ref;
    modal.querySelector('#coStepForm').hidden = true;
    modal.querySelector('#coStepDone').hidden = false;
  }

  // Boutons « S'abonner » déclarés dans le HTML
  function bindCheckoutButtons() {
    document.querySelectorAll('[data-checkout]').forEach(function (btn) {
      btn.addEventListener('click', function () { openCheckout(btn.getAttribute('data-checkout')); });
    });
  }

  // ---------- Démarrage ----------
  function boot() {
    initTheme();
    bindCheckoutButtons();
    var y = document.querySelectorAll('[data-year]');
    y.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.SUNU = {
    store: store,
    auth: auth,
    fiches: fiches,
    escapeHtml: escapeHtml,
    copyText: copyText,
    toast: toast,
    initials: initials,
    firstName: firstName,
    param: param,
    requireAuth: requireAuth,
    safeNext: safeNext,
    renderUser: renderUser,
    openCheckout: openCheckout,
    formatPhone: formatPhone,
    normalizePhone: normalizePhone
  };
})();
