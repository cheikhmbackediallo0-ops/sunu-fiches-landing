/* ==========================================================================
   SUÑU FICHES — fiche « écrite à la main » animée (décor des pages)
   Chaque ligne apparaît de gauche à droite, au rythme d'un stylo qui avance.
   L'animation recommence en boucle ; elle est coupée si l'utilisateur
   a demandé à réduire les animations.
   ========================================================================== */
(function () {
  'use strict';

  function today() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
  }

  // [classe, texte] : 'l' = libellé rouge, 'v' = contenu bleu
  var SCRIPT = [
    ['head-left', [['l big', 'Grande Section'], ['l', 'Durée :'], ['v', ' 25 mn']]],
    ['head-center', [['l title', 'Fiche pédagogique'], ['v act', 'Activités de mesure']]],
    ['head-right', [['l', 'Date :'], ['v', ' ' + today()], ['l', 'Séance :'], ['v', ' N° 03']]],
    ['row', [['l', 'OA :'], ['v', ' Explorer les grandeurs']]],
    ['row', [['l', 'OS :'], ['v', ' Ranger selon la longueur']]],
    ['row', [['l', 'Contenus :'], ['v', ' Rangement selon la longueur']]],
    ['step', [['l', '2. Révision'], ['v', 'Rappelez-moi la notion apprise… (la toise)'], ['v t', '3 mn']]],
    ['step', [['l', '3. Modélisation'], ['v', 'Range les baguettes en disant chaque geste'], ['v t', '4 mn']]],
    ['step', [['l', '4. Pratique guidée'], ['v', 'Fait ranger du plus court au plus long'], ['v t', '6 mn']]]
  ];

  function build(root) {
    var delay = 0.3;
    function piece(cls, text) {
      var t = Math.max(0.3, text.length * 0.03);
      var html = '<span class="hw ' + cls + '" style="--d:' + delay.toFixed(2) + 's;--t:' + t.toFixed(2) + 's">' +
        '<span class="hw-ink">' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span><i class="hw-pen" aria-hidden="true"></i></span>';
      delay += t + 0.08;
      return html;
    }
    function block(parts, wrapEach) {
      return parts.map(function (p) { var h = piece(p[0], p[1]); return wrapEach ? '<div>' + h + '</div>' : h; }).join('');
    }
    var head = '<div class="hwf-head">' +
      '<div class="hwf-cell">' + '<div>' + piece('l big', SCRIPT[0][1][0][1]) + '</div><div>' + piece('l', SCRIPT[0][1][1][1]) + piece('v', SCRIPT[0][1][2][1]) + '</div></div>' +
      '<div class="hwf-cell hwf-center">' + block(SCRIPT[1][1], true) + '</div>' +
      '<div class="hwf-cell">' + '<div>' + piece('l', SCRIPT[2][1][0][1]) + piece('v', SCRIPT[2][1][1][1]) + '</div><div>' + piece('l', SCRIPT[2][1][2][1]) + piece('v', SCRIPT[2][1][3][1]) + '</div></div>' +
    '</div>';
    var rows = '<div class="hwf-rows">' + SCRIPT.slice(3, 6).map(function (r) {
      return '<div class="hwf-row"><div class="hwf-k">' + piece(r[1][0][0], r[1][0][1]) + '</div><div class="hwf-v">' + piece(r[1][1][0], r[1][1][1].trim()) + '</div></div>';
    }).join('') + '</div>';
    var steps = '<div class="hwf-steps">' + SCRIPT.slice(6).map(function (r) {
      return '<div class="hwf-step"><div>' + piece(r[1][0][0], r[1][0][1]) + '</div><div>' + piece(r[1][1][0], r[1][1][1]) + '</div><div class="hwf-t">' + piece(r[1][2][0], r[1][2][1]) + '</div></div>';
    }).join('') + '</div>';
    var stamp = '<div class="hwf-stamp" style="--d:' + (delay + 0.2).toFixed(2) + 's">Conforme au guide GS 2024</div>';
    root.innerHTML = '<div class="hwf-paper">' + head + rows + steps + stamp + '</div>';
    return delay + 0.8;
  }

  function start(root) {
    var total = build(root);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { root.classList.add('is-static'); return; }
    function run() {
      root.classList.remove('is-writing', 'is-fading');
      void root.offsetWidth; // relance des animations
      root.classList.add('is-writing');
      setTimeout(function () { root.classList.add('is-fading'); }, (total + 4) * 1000);
      setTimeout(run, (total + 4.8) * 1000);
    }
    run();
  }

  function boot() { document.querySelectorAll('[data-hw-fiche]').forEach(start); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
