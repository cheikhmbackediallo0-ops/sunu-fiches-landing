/* ==========================================================================
   SUÑU FICHES — matériel de chaque leçon du préscolaire
   Le guide ne donne qu'une liste générale par activité, valable toute l'année.
   Ici, chaque objet est nommé, avec sa couleur et sa quantité, d'après l'OS et
   les contenus de la séance : « jusqu'à 6 » → 6 capsules, « algorithme 1-2 »
   → 1 rouge, 2 jaunes, « puzzle de 4 pièces » → puzzles de 4 pièces.
   Objets faciles à trouver dans une école sénégalaise.
   Jamais de mot vague (« matériel de récupération », « manufacturé »…).
   Les règles sont lues dans l'ordre : la première qui correspond l'emporte.
   ========================================================================== */
(function () {
  'use strict';

  // ---------- Couleurs ----------
  // nom → [féminin singulier, féminin pluriel, masculin pluriel]
  var COUL = {
    rouge: ['rouge', 'rouges', 'rouges'], jaune: ['jaune', 'jaunes', 'jaunes'],
    bleu: ['bleue', 'bleues', 'bleus'], vert: ['verte', 'vertes', 'verts'],
    blanc: ['blanche', 'blanches', 'blancs'], noir: ['noire', 'noires', 'noirs'],
    orange: ['orange', 'orange', 'orange'], violet: ['violette', 'violettes', 'violets'],
    marron: ['marron', 'marron', 'marron'], rose: ['rose', 'roses', 'roses']
  };
  var PALETTE = ['rouge', 'jaune', 'bleu', 'vert'];
  var COUL_RE = {
    rouge: /\brouges?\b/, jaune: /\bjaunes?\b/, bleu: /\bbleu(e|s|es)?\b/, vert: /\bvert(e|s|es)?\b/,
    blanc: /\bblanc(he|s|hes)?\b/, noir: /\bnoir(e|s|es)?\b/, orange: /\borange\b/,
    violet: /\bviolet(te|s|tes)?\b/, marron: /\bmarron\b/, rose: /\broses?\b/
  };

  function liste(arr, mot) {
    arr = arr.filter(Boolean);
    if (arr.length < 2) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' ' + (mot || 'et') + ' ' + arr[arr.length - 1];
  }
  function couleursDe(t) {
    return Object.keys(COUL_RE).filter(function (c) { return COUL_RE[c].test(t); });
  }

  // ---------- Nombres de la leçon ----------
  function nombres(t) {
    var c = [];
    var push = function (v, d) { v = parseInt(v, 10) + (d || 0); if (v >= 0 && v <= 100) c.push(v); };
    var m, re;
    re = /jusqu'(?:à|a)\s*(\d+)/g; while ((m = re.exec(t))) push(m[1]);
    re = /de\s+\d+\s+à\s+(\d+)/g; while ((m = re.exec(t))) push(m[1]);
    re = /(?:≥|≤|>=|<=)\s*(\d+)/g; while ((m = re.exec(t))) push(m[1]);
    re = /(?:<|inférieures? à)\s*(\d+)/g; while ((m = re.exec(t))) push(m[1], -1);
    re = /(\d+)\s+(?:objets?|jetons|pièces|éléments)/g; while ((m = re.exec(t))) push(m[1]);
    re = /collection de (\d+)/g; while ((m = re.exec(t))) push(m[1]);
    re = /nombres?\s+((?:\d+\s*(?:,|et)\s*)*\d+)/g;
    while ((m = re.exec(t))) m[1].split(/\s*(?:,|et)\s*/).forEach(function (v) { push(v); });
    return c;
  }
  function chiffresCites(t) {
    var m = t.match(/nombres?\s+((?:\d+\s*(?:,|et)\s*)*\d+)/);
    return m ? m[1].split(/\s*(?:,|et)\s*/) : [];
  }
  var DEF_N = { PS: 3, MS: 6, GS: 10 };

  // Infos tirées de « OS + contenus »
  function infos(os, contenus, niveau) {
    var t = (os + ' ' + contenus).toLowerCase();
    var ns = nombres(os.toLowerCase());
    if (!ns.length) ns = nombres(t);
    var n = ns.length ? Math.max.apply(null, ns) : (DEF_N[niveau] || 5);
    var mo = os.match(/(\d)\s*[-\/]\s*(\d)(?:\s*[-\/]\s*(\d))?/) || contenus.match(/(\d)\s*[-\/]\s*(\d)(?:\s*[-\/]\s*(\d))?/);
    return {
      t: t, os: os, osl: os.toLowerCase(), niveau: niveau,
      n: Math.max(1, n),
      cites: chiffresCites(os.toLowerCase()),
      motif: mo ? mo.slice(1).filter(Boolean).map(Number) : null,
      couleurs: couleursDe(t),
      formes: ['cercle', 'carré', 'triangle', 'rectangle'].filter(function (f) { return t.indexOf(f) >= 0; }),
      solides: ['cube', 'cylindre', 'pyramide', 'boule'].filter(function (f) { return t.indexOf(f) >= 0; })
    };
  }

  // ---------- Modèles qui dépendent de la leçon ----------
  function algorithme(x) {
    var d = x.motif || [1, 1];
    if (/plus complexe|deux critères/.test(x.t) && !x.motif) d = [1, 2];
    var cols = (x.couleurs.length >= d.length ? x.couleurs : PALETTE).slice(0, d.length);
    var rep = 4;
    var perles = cols.map(function (c, i) { return (d[i] * rep) + ' perles ' + COUL[c][1]; });
    var motif = cols.map(function (c, i) { return d[i] + ' ' + COUL[c][d[i] > 1 ? 1 : 0]; }).join(', ');
    var out = ['Par enfant : 1 lacet, ' + liste(perles)];
    if (/erreur/.test(x.t)) out.push("bande d'algorithme avec 2 erreurs à trouver (motif : " + motif + ')');
    else if (/créer/.test(x.osl)) out.push('perles et capsules de ' + cols.length + ' couleurs au choix (' + liste(cols) + ')');
    else out.push('bande-modèle affichée au tableau (motif : ' + motif + ', …)');
    if (/forme/.test(x.t)) out.push('blocs logiques : 6 ronds et 6 carrés de même couleur (alternance de formes)');
    if (/taille/.test(x.t)) out.push('6 grosses et 6 petites capsules (alternance de tailles)');
    out.push("fiche d'algorithme à compléter, crayons de couleur (" + liste(cols) + ')');
    return out.join(' ; ');
  }
  function couleursLecon(x) {
    var cols = x.couleurs.length ? x.couleurs : ['rouge', 'jaune', 'bleu'];
    return 'Par enfant : 1 lacet, ' + liste(cols.map(function (c) { return '5 perles ' + COUL[c][1]; })) + ' ; ' +
      cols.length + ' boîtes de tri (' + liste(cols.map(function (c) { return 'une ' + COUL[c][0]; })) + ') ; ' +
      'gommettes ' + liste(cols.map(function (c) { return COUL[c][1]; })) + ' ; ' +
      'objets de la classe de ces couleurs (ballon, seau, crayons, bouchons) ; puzzle des couleurs de ' + (cols.length * 2) + ' pièces';
  }
  function de1a(n) { return '1 à ' + Math.max(n, 3); }
  function des(n) { return n <= 6 ? '1 dé à points' : '2 dés à points'; }

  // [motif cherché dans « OS » puis dans « OS + contenus », matériel (texte ou fonction), jeu associé]
  var R = {
    mesure: [
      [/toise/, "Toise tracée au mur (bande de papier graduée de 0 à 1,20 m), craie de couleur, règle plate de 30 cm, étiquettes-prénoms, pâte adhésive"],
      [/(rang|croissant|décroissant).*(longueur|long|taille)|(longueur|taille).*(rang|croissant)/, "Par groupe : 5 baguettes de 10, 15, 20, 25 et 30 cm, 5 crayons de tailles différentes, 5 bandes de papier de couleur de longueurs différentes ; fiche d'exercice (objets à ranger du plus court au plus long)", "RJMM 52 « jeu de baguettes »"],
      [/(rang|croissant|décroissant).*(masse|lourd)|masse.*(rang|croissant)/, "Par groupe : 4 bouteilles de 50 cl remplies de sable (pleine, aux trois quarts, à moitié, au quart), 3 sachets de riz (250 g, 500 g, 1 kg), 1 balance à plateaux ; fiche d'exercice", "RJMM 53 « Ranger sa collection »"],
      [/(rang|croissant|décroissant).*capacit|capacit.*(rang|croissant)/, "Par groupe : 4 récipients transparents de tailles différentes (verre, bouteille de 50 cl, bouteille de 1,5 l, seau de 5 l), 1 gobelet doseur, 1 entonnoir, bassine d'eau colorée", "RJMM 53 « Ranger sa collection »"],
      [/son.*(bref|long)|(bref|long).*son|\bsons\b/, "Sifflet, tam-tam, flûte, clochette, téléphone avec 4 sonneries enregistrées (2 courtes, 2 longues) ; 2 cartons-réponses par enfant (trait court, trait long)"],
      [/lent|rapide/, "1 sablier de 1 mn, chronomètre du téléphone, 2 petites voitures (une à pousser fort, une doucement), 1 escargot et 1 criquet en images, plan incliné (planche de 1 m), 1 tam-tam (rythme lent / rapide)"],
      [/durée/, "1 sablier de 1 mn, chronomètre du téléphone, 2 bouteilles d'1,5 l et de 50 cl à remplir au même robinet, 1 gobelet, 10 perles et 1 fil par enfant (enfiler pendant le sablier)"],
      [/lourd|léger|masse/, "Par groupe : 1 sac de sable et 1 sac de coton de même taille, 1 pierre et 1 plume, 1 bouteille de 1,5 l pleine et 1 vide, 1 gros livre et 1 cahier ; 1 balance à plateaux"],
      [/plein|vide|capacit/, "Par groupe : 2 bouteilles transparentes d'1,5 l (une pleine, une vide), 2 gobelets, 2 seaux, 1 entonnoir, 1 bassine d'eau, 1 sac de sable sec"],
      [/longueur|long|court/, "Par groupe : 2 baguettes de 15 et 30 cm, 2 crayons (un neuf, un usé), 2 rubans de 20 et 50 cm, 2 ficelles de longueurs différentes", "RJMM 52 « jeu de baguettes »"],
      [/petit|grand|taille/, "Paires d'objets petit / grand : 1 petit ballon et 1 grand ballon, 1 bouteille de 33 cl et 1 bouteille de 1,5 l, 1 petite et 1 grande cuillère, 1 petit et 1 gros caillou ; images d'un poussin et d'un bœuf"]
    ],
    numeriques: [
      [/algorithme/, algorithme],
      [/tableau à double entrée|tri\b/, "Affiche d'un tableau à double entrée de 3 × 3 cases (formes : rond, carré, triangle ; couleurs : rouge, jaune, bleu), 9 étiquettes-formes en carton de couleur, pâte adhésive ; fiche-tableau à compléter par enfant, crayons de couleur"],
      [/bande numérique/, "Bande numérique de 0 à 20 affichée au mur, 3 pinces à linge de couleur, cartes-nombres de 0 à 20 (grand format), 1 ardoise et 1 craie par enfant"],
      [/surcompt|rebours/, "Bande numérique de 0 à 20, piste numérotée de 1 à 20 (jeu de l'oie) par groupe, 1 dé à points par groupe, 4 pions de couleurs différentes, 20 capsules par groupe"],
      [/comptine|suite orale|réciter|mémoriser la suite/, function (x) { return 'Comptine numérique jusqu\'à ' + x.n + ' écrite sur une affiche illustrée, bande numérique de ' + de1a(x.n) + ' affichée, ' + x.n + ' bâtonnets (ou capsules) par enfant, cartes-nombres de ' + de1a(x.n); }],
      [/écrire|tracer chaque chiffre|écriture jusqu|écriture des nombres/, function (x) {
        var ch = x.cites.length ? liste(x.cites) : 'de 0 à ' + x.n;
        return 'Chiffres rugueux ' + ch + ' (découpés dans du papier de verre, collés sur carton), 1 plateau de sable par groupe, pâte à modeler, 1 ardoise et 1 craie par enfant ; fiche d\'écriture des chiffres ' + ch + ', crayon à papier';
      }],
      [/décompos|recompos|complément/, function (x) { return x.n + ' capsules (ou bouchons) par enfant, 2 assiettes (ou barquettes) par enfant, 1 boîte à chaussures (boîte-cache), cartes-nombres de 0 à ' + x.n + ' ; fiche d\'exercice (décompositions de ' + x.n + ')'; }],
      [/partage|distribution/, function (x) { var n = Math.max(x.n, 6); return n + ' bonbons (ou ' + n + ' capsules) par groupe, 2 assiettes, 2 poupées (ou marottes) qui reçoivent le partage, images de la situation-problème ; fiche d\'exercice'; }],
      [/problème|ajout|retrait/, function (x) { var n = Math.max(x.n, 5); return n + ' mangues (ou ' + n + ' capsules) pour jouer la scène, 1 panier, 2 assiettes, 1 marotte (le marchand), images de la situation-problème ; ' + n + ' jetons par enfant, fiche d\'exercice'; }],
      [/position|\brang\b|premier|dernier|deuxième|troisième/, function (x) { var n = Math.max(x.n, 4); return n + ' petites voitures de couleurs différentes (ou ' + n + ' figurines) alignées en file, image d\'une course de ' + n + ' enfants, cartes « 1er, 2e, 3e… dernier », ' + n + ' cerceaux posés au sol en file'; }],
      [/représentation|reconnaître une petite quantité/, function (x) { return ucf(des(x.n)) + ', dominos, cartes à points de ' + de1a(x.n) + ', cartes-nombres de ' + de1a(x.n) + ', ' + Math.max(x.n, 3) + ' jetons par enfant ; fiche d\'exercice (relier chaque nombre à sa représentation)'; }],
      [/lire|lecture|écriture chiffrée|identification/, function (x) { return 'Cartes-nombres de ' + de1a(x.n) + ' (grand format), cartes à points de ' + de1a(x.n) + ', ' + des(x.n) + ', bande numérique de ' + de1a(x.n) + ', ' + Math.max(x.n, 3) + ' capsules par enfant'; }],
      [/compar|plus que|moins que|autant|\bpeu\b|beaucoup/, function (x) {
        if (/\bpeu\b|beaucoup/.test(x.t)) return '2 paniers : 1 avec 2 mangues (peu), 1 avec 15 capsules (beaucoup) ; par groupe : 20 graines de haricot, 2 barquettes ; images de collections (peu / beaucoup)';
        var a = /petites/.test(x.t) ? 5 : Math.max(x.n, 4), b = Math.max(1, a - 2);
        return 'Par groupe : 2 barquettes, ' + a + ' capsules rouges et ' + b + ' bouchons bleus à comparer, ' + a + ' graines de haricot ; images de 2 collections (' + a + ' et ' + b + ' objets) ; fiche d\'exercice';
      }],
      [/dénombr|collection|quantité|équipotent|correspondance|comptage/, function (x) { return 'Par enfant : 1 barquette de ' + (x.n + 3) + ' capsules (ou bouchons) pour en prendre ' + x.n + ' ; ' + des(x.n) + ', cartes-nombres de ' + de1a(x.n) + ', cartes à points de ' + de1a(x.n) + ' ; fiche d\'exercice'; }]
    ],
    geometrie: [
      [/règle/, "1 règle plate de 20 cm, 1 crayon à papier et 1 gomme par enfant ; feuille avec des points à relier (traits droits) ; règle de tableau d'1 m pour la démonstration"],
      [/puzzle/, function (x) {
        var m = x.t.match(/(\d+)\s*pièces/), p = m ? m[1] : (x.niveau === 'GS' ? '12 à 20' : x.niveau === 'MS' ? '6' : '4');
        return 'Puzzles de ' + p + ' pièces (1 par enfant) avec des images connues : animal, fruit, voiture, famille ; image modèle complète pour chaque puzzle ; 1 enveloppe de rangement par puzzle';
      }],
      [/pav/, "Par enfant : 10 carrés et 10 triangles en carton de couleur (rouge, jaune, bleu), 1 surface à paver (rectangle de 20 × 15 cm tracé sur une feuille), colle ; tangram de 7 pièces pour la démonstration"],
      [/gabarit/, function (x) {
        var f = x.formes.length ? x.formes : ['cercle'];
        return 'Gabarits en carton : ' + liste(f.map(function (s) { return s + 's'; })) + (f.indexOf('cercle') >= 0 ? ' ; couvercles de pots et de boîtes (cercles)' : '') + ' ; feuilles blanches, crayons à papier et crayons de couleur, ciseaux à bouts ronds';
      }],
      [/solide|cube|cylindre|pyramide|boule/, function (x) {
        var r = { cube: '1 dé ou 1 boîte cubique (cube)', cylindre: '1 boîte de lait ou de tomate (cylindre)', pyramide: '1 pyramide en carton (pyramide)', boule: '1 ballon ou 1 orange (boule)' };
        var s = (x.solides.length ? x.solides : ['cube', 'cylindre', 'pyramide', 'boule']).map(function (k) { return r[k]; });
        return 'Solides réels : ' + liste(s) + ' ; 1 sac à toucher ; 10 cubes de construction par enfant';
      }],
      [/assemblage|construction|reproduire/, function (x) {
        if (/construction/.test(x.t)) return '10 cubes de construction (ou légos) par enfant, photo du modèle à reproduire (tour, maison, pont), 1 plateau par groupe';
        var f = x.formes.length ? x.formes : ['carré', 'triangle', 'cercle', 'rectangle'];
        return 'Formes découpées dans du carton de couleur (' + liste(f.map(function (s) { return s + 's'; })) + '), modèle d\'assemblage sur fiche (maison, bonhomme, bateau), colle, 1 feuille par enfant';
      }],
      [/dessiner|tracer/, function (x) {
        var f = x.formes.length ? x.formes : ['cercle', 'carré'];
        return 'Modèle de chaque forme affiché (' + liste(f) + '), gabarits en carton, 1 ardoise et 1 craie par enfant, feuilles blanches, crayons à papier et crayons de couleur';
      }],
      [/cercle|carré|triangle|rectangle|formes/, function (x) {
        var f = x.formes.length ? x.formes : ['cercle', 'carré', 'triangle', 'rectangle'];
        var obj = { cercle: 'assiette (cercle)', carré: 'mouchoir (carré)', triangle: 'équerre (triangle)', rectangle: 'ardoise (rectangle)' };
        return 'Par groupe : ' + liste(f.map(function (s) { return '4 ' + s + 's'; })) + ' en carton de couleur, blocs logiques ; objets de la classe : ' + liste(f.map(function (s) { return obj[s]; })) + ' ; ' + f.length + ' boîtes de tri étiquetées ; fiche de tri';
      }]
    ],
    ist: [
      [/illusion|optique|réfraction/, "1 verre transparent d'eau par groupe, 1 crayon ou 1 bâton (il paraît « cassé » dans l'eau), 1 loupe, 3 images d'illusions d'optique"],
      [/(identifier|reconna\S+|nommer|trier) (des|les) couleurs/, couleursLecon],
      [/fiche technique|jeu technique|fabriqu/, "Pour fabriquer un jeu de quilles : 6 bouteilles en plastique, sable, 1 balle ; cartons, bouchons, ficelle, colle, ciseaux ; fiche technique illustrée en 4 étapes"],
      [/\blangue\b|goût|saveur|sucré|salé|amer|acide/, "Par groupe : 1 bol de sucre, 1 bol de sel, 1 citron coupé, 1 gobelet de kinkéliba (amer), cuillères à café propres, 1 gobelet d'eau par enfant, 1 foulard ; image de la langue"],
      [/\bnez\b|odorat|odeurs?\b/, "6 petits pots opaques fermés d'un tissu troué : citron, menthe, oignon, parfum, café, fleur de jasmin ; 1 foulard ; image du nez"],
      [/oreille|ouïe|discriminer des sons|bruit/, "Tam-tam, sifflet, clochette, maracas (bouteille et graines), téléphone avec 5 cris d'animaux enregistrés (coq, mouton, chat, chien, âne), 1 foulard ; image de l'oreille"],
      [/l'œil|la vue/, "1 miroir par groupe, 1 loupe, 1 foulard, 6 objets de couleurs et de formes différentes (ballon rouge, cube jaune, crayon bleu…) ; image de l'œil"],
      [/corps|tronc|membres|\btête\b|visage/, "1 poupée, grande image du corps humain, 1 miroir, puzzle du corps de 6 pièces (tête, tronc, 2 bras, 2 jambes), étiquettes-mots (tête, tronc, membres)"],
      [/toucher|yeux bandés|chaud|froid|lisse|rugueux|\bdur(?![a-zàâéèêëîïôûùç])|\bmou(?![a-zàâéèêëîïôûùç])/, "Sac mystère avec 8 objets : éponge, caillou, coton, papier de verre, morceau de tissu, balle, cuillère, bouchon ; 1 gobelet d'eau tiède et 1 d'eau froide ; 1 foulard ; image de la main"],
      [/organes des sens/, "Images des 5 organes des sens (œil, nez, langue, oreille, main) ; 1 foulard ; 1 citron, 1 bol de sucre, 1 clochette, 1 balle en mousse, 1 miroir"],
      [/sablier/, "3 sabliers (1, 3 et 5 mn), chronomètre du téléphone ; 10 perles et 1 lacet par enfant (activité courte chronométrée)"],
      [/horloge/, "Horloge de la classe, horloge en carton à aiguilles mobiles, frise de la journée avec 5 photos (accueil, activités, récréation, goûter, sortie)"],
      [/calendrier|férié|frise des événements|événements à venir|événements les uns|noël|korité|tabaski/, "Calendrier mural de l'année, calendrier du mois de la classe, images des fêtes (Korité, Tabaski, Noël, Mardi gras, fête de fin d'année), 3 pinces à linge de couleur, gommettes rouges (jours fériés)"],
      [/simultan/, "Photos de 2 activités qui ont lieu à la même heure (une section au terrain, une autre en classe), horloge de la classe, frise de la journée"],
      [/journée|matin|après-midi|\bsoir\b|moments/, "6 cartes séquentielles (réveil, toilette, petit déjeuner, école, déjeuner, coucher), frise de la journée, photos de la classe (accueil, récréation, goûter), 6 pinces à linge"],
      [/semaine|hier|demain|aujourd'hui|\bjours?\b/, "Train de la semaine (7 wagons), 7 étiquettes des jours (lundi → dimanche), 1 pince à linge rouge pour « aujourd'hui », calendrier de la classe"],
      [/avant|après|pendant|chronolog|séquenti/, "4 cartes séquentielles par groupe (ex. : planter une graine → arroser → la plante pousse → la fleur), frise à compléter, colle"],
      [/circuit électrique/, "Par groupe : 1 pile de 4,5 V, 1 ampoule de lampe de poche et sa douille, 2 fils électriques avec pinces, 1 interrupteur ; fiche du montage"],
      [/aimant/, "Par groupe : 1 aimant, 1 plateau avec 10 objets (trombones, clous, pièces de monnaie, capsules, bouchon en plastique, morceau de bois, gomme, papier, clé, cuillère) ; 2 boîtes « attiré / pas attiré »"],
      [/\bl'air\b|\bair\b/, "Par groupe : 2 ballons de baudruche, 1 sachet plastique, 1 paille par enfant, 1 éventail en papier, 1 bouteille vide, 1 bassine d'eau"],
      [/soluble/, "Par groupe : 4 gobelets transparents d'eau, 1 cuillère de sel, 1 cuillère de sucre, 1 cuillère de sable, 1 petit morceau de bois, 1 cuillère pour mélanger"],
      [/de l'eau|glace|état solide|liquide|gazeux/, "Glaçons dans un bol, 1 bouteille d'eau, 1 casserole et 1 réchaud (manipulés par l'adulte), 1 couvercle froid (buée), 4 gobelets, 1 assiette"],
      [/parcours|itinéraire|labyrinthe|chemin|coder|décoder/, "10 plots, 4 cerceaux, 2 cordes, craie pour tracer le parcours au sol, 6 flèches en carton (haut, bas, droite, gauche) ; fiche du parcours à coder"],
      [/espace d'une page|\bpage\b/, "Par enfant : 1 feuille A4, 5 gommettes de couleurs différentes, crayons de couleur ; fiche avec des repères (en haut, en bas, au milieu, à gauche, à droite, la marge)"],
      [/organisation spatiale d'une image/, "Par binôme : 2 feuilles, 1 image simple (maison, arbre, soleil, voiture) ; 1 paravent (carton) pour cacher le modèle ; crayons de couleur"],
      [/droite|gauche/, "1 bracelet rouge à attacher au poignet de la main d'écriture, gommettes, 2 cerceaux (à droite, à gauche), images d'enfants, jeu « Jacques a dit »"],
      [/espace de la classe|espaces importants|repérer dans l'école|se repérer dans l'école|en dehors de l'école|espace plus vaste|explorer l'espace/, "Plan de l'école ou du quartier dessiné sur une affiche, photos des lieux (classes, toilettes, bureau du directeur, cour, terrain de foot, mosquée, marché, point d'eau), étiquettes-noms, pâte adhésive"],
      [/dans une file/, "6 chaises alignées en file, 6 foulards de couleurs différentes, image d'une file d'enfants, ballon"],
      [/situer|position|\bsur\b|sous|devant|derrière|dedans|dehors|frontière|intérieur|extérieur|\bloin\b|près de|entre\b/, "1 boîte en carton, 1 chaise, 1 table, 1 ballon, 1 poupée, 4 cerceaux, 2 cordes (frontière) ; images de positions (sur / sous, dedans / dehors) ; fiche à compléter"],
      [/perles/, function (x) {
        var s = /grosses/.test(x.t) ? 'grosses perles (2 cm)' : /petite/.test(x.t) ? 'petites perles (0,5 cm)' : 'perles moyennes (1 cm)';
        return 'Par enfant : 15 ' + s + ' rouges, jaunes et bleues, 1 lacet (ou fil de nylon) avec un nœud au bout ; 1 boîte de perles par groupe ; collier-modèle';
      }],
      [/ciseaux|découp/, "Par enfant : 1 paire de ciseaux à bouts ronds, 1 bande de papier avec des traits droits à découper, 1 morceau de carton fin et 1 chute de tissu ; 1 corbeille pour les chutes"],
      [/collage/, "Par enfant : 1 feuille cartonnée, 1 pot de colle et 1 pinceau à colle, morceaux de papier de couleur déchirés (rouge, jaune, bleu, vert) ; 1 chiffon par groupe"],
      [/pinces? à linge/, "20 pinces à linge, 1 corde à linge tendue dans la classe, 10 petits linges (chaussettes, mouchoirs), travaux d'enfants à accrocher"],
      [/visser|dévisser|écrou/, "Par groupe : 5 bocaux et bouteilles à bouchons vissés, 5 boulons et écrous en plastique, 1 boîte de rangement"],
      [/fermeture|glissière/, "3 vestes, 2 blousons, 1 pantalon, 3 trousses et 2 sacs à fermeture à glissière"],
      [/assembl|construire|construction|blocs|légos|tangram/, "Par groupe : 20 cubes de construction (ou légos), 1 tangram de 7 pièces, photo du modèle à reproduire (maison, voiture, poupée)"],
      [/clavier|écrire des|effacer|ligne/, function (x) {
        var e = /prénom/.test(x.t) ? 'étiquette-prénom de chaque enfant (capitales et script)' : /lettre/.test(x.t) ? 'cartes-lettres modèles (A, B, C…)' : 'étiquettes-modèles de mots courts (papa, maman, école)';
        return '1 ordinateur allumé pour 2 enfants (clavier, souris), logiciel de traitement de texte ouvert, ' + e + ', multiprise';
      }],
      [/clichés|appareil photo|prises? de vue|prendre des photos/, "1 appareil photo numérique (ou tablette) chargé pour 3 enfants, 5 objets à photographier (ballon, poupée, plante…), coins de la classe, écran pour regarder les photos"],
      [/téléphone/, "3 téléphones portables chargés, 3 paires d'écouteurs, 3 comptines enregistrées, photos de la classe enregistrées"],
      [/tablette/, "1 tablette chargée pour 3 enfants (lecteur audio, galerie photos, jeu éducatif installé), 3 housses de protection, comptines enregistrées"],
      [/ordinateur|programme|composantes/, "1 ordinateur (unité centrale, écran, clavier, souris, haut-parleurs) pour 3 enfants, multiprise ; images des composants (écran, clavier, souris, unité centrale) à associer"],
      [/insecte/, "1 bocal aéré, 3 loupes, insectes du milieu (fourmis, criquet, escargot) observés puis relâchés, images (papillon, mouche)"],
      [/sauvage/, "Images et figurines d'animaux sauvages (lion, éléphant, girafe, singe, hyène) et domestiques (mouton, chèvre, poule, chat) ; 2 cerceaux de tri ; courte vidéo"],
      [/(croissance|mode de vie).*(poule|mouton|domestique)/, "Images du poulailler et de la bergerie, cartes séquentielles œuf → poussin → poule et agneau → mouton ; 1 œuf réel, 3 plumes, 1 poignée de mil (nourriture de la poule), 1 botte d'herbe (nourriture du mouton)"],
      [/animal|animaux|crustacé/, "Images et figurines d'animaux domestiques (bœuf, mouton, chèvre, poule, chat, âne) ; 1 crabe ou des crevettes séchées (crustacés) ; 2 cerceaux de tri"],
      [/entretien des plantes/, "1 arrosoir, 1 binette, 1 sécateur (manipulé par l'adulte), 2 tuteurs et de la ficelle, plantes du jardin de l'école"],
      [/utilité des plantes/, "Images : arbre qui donne de l'ombre, bois de chauffe, fruits et légumes, feuilles de kinkéliba et de moringa (médicaments) ; vraies feuilles de kinkéliba"],
      [/plante|germination|racine|tige|feuille|fleur|arbre/, "Par groupe : 5 graines de haricot (ou d'arachide), coton, 2 gobelets transparents, terre, 1 arrosoir ; 1 plante entière arrachée (racines, tige, feuilles, fleur)"],
      [/aliment/, "Aliments réels : 1 sachet de riz, mil, 1 poisson (sec), 1 orange, 1 carotte, 1 tomate, 1 bouteille de lait ; images de viande ; 4 paniers de tri (fruits, légumes, poisson / viande, boissons)"],
      [/utilité de quelques matières/, "1 bouteille d'eau, 1 arrosoir, 1 ballon gonflé, 1 éventail, 1 pompe à vélo, images (eau à boire, linge qui sèche au vent)"],
      [/matière|malaxer|transvaser|argile|farine|sable/, "Par groupe : 1 bol d'argile, 1 bol de farine, 1 bol de sable, 1 bouteille d'eau, un peu d'huile, 2 feuilles d'arbre, 2 gobelets, 1 cuillère, 1 bassine ; tabliers"],
      [/couleur/, couleursLecon]
    ],
    hygiene: [
      [/temps|habillement|parapluie/, "Habits légers et habits chauds (tee-shirt, pull, bonnet, écharpe), 1 paire de sandales et 1 paire de chaussures fermées, 1 parapluie, 1 imperméable ; 4 images du temps (soleil, pluie, vent, froid)"],
      [/blouse|vestimentaire|habits|repassage|boutonnage|linge/, "1 blouse d'école propre et 1 sale, 1 chemise à boutons, 1 fer à repasser (débranché), 2 cintres, 1 savon, 1 bassine d'eau ; images (linge qui sèche, enfant bien habillé)"],
      [/mains|dents|mouchoir|toilette|savon|propreté du corps|peigne/, "1 savon, 1 bouilloire (« satala ») ou 1 robinet, 1 bassine, 1 serviette propre, 1 brosse à dents par enfant et 1 tube de dentifrice, 1 paquet de mouchoirs en papier, 1 peigne, 1 miroir, 1 poubelle"],
      [/fruit/, "4 mangues, 4 oranges, 4 bananes, 1 bassine d'eau potable, quelques gouttes d'eau de Javel (manipulées par l'adulte), 1 torchon propre, 1 assiette"],
      [/impropre|souillé|altéré|conserve/, "1 fruit frais et 1 fruit pourri, 1 pain frais et 1 pain moisi (dans un sachet fermé), 1 boîte de conserve normale et 1 boîte gondolée ; images"],
      [/eau potable/, "2 bouteilles transparentes : 1 d'eau potable, 1 d'eau sale ; 1 morceau de tissu propre (filtre), 3 gobelets ; images de points d'eau (robinet, puits, mare)"],
      [/protéger/, "2 assiettes avec couvercle, 2 boîtes fermées, 1 morceau de moustiquaire, 1 sachet propre, images de mouches et de cafards sur des aliments non couverts"]
    ],
    environnement: [
      [/routi|route/, "4 panneaux du code de la route en carton (stop, passage piétons, feu, interdit), passage piéton tracé à la craie dans la cour, feu tricolore en carton (rouge, orange, vert), 2 petites voitures"],
      [/poubelle|ordure|déchet|tri|salir|recycl/, "3 cartons de tri marqués d'une couleur (papier, plastique, restes de repas), papiers froissés, 3 bouteilles en plastique vides, épluchures en image, 1 paire de gants par groupe, 1 sac poubelle"],
      [/nettoyage|balayage|rendre propre|matériel de nettoyage/, "2 balais, 2 balayettes, 2 pelles à poussière, 1 serpillière, 1 seau, 4 chiffons, 1 paire de gants par groupe, 1 savon ; 1 bouteille d'eau de Javel fermée (montrée par l'adulte)"],
      [/eau|énergie|électricité|économ/, "Images d'un robinet qui coule et d'une lampe allumée en plein jour, 1 bouilloire (« satala »), 1 gobelet, 1 bassine, l'interrupteur de la classe"],
      [/reboiser|arbre|planter|plantation/, "5 jeunes plants (manguier, neem, fleurs), 2 pelles, 2 arrosoirs, 2 seaux d'eau, 1 sac de terreau, 5 tuteurs et de la ficelle"],
      [/danger|sécurité|tranchant|produits|objets/, "Images ou photos d'objets et de lieux dangereux (allumettes, couteau, lame, prise électrique, eau de Javel, bouteille de gaz, route, chien errant), 2 boîtes « danger » / « sans danger », pictogrammes de danger"]
    ],
    valeurs: [
      [/drapeau|symboles|nation|hymne/, function (x) {
        return 'Drapeau du Sénégal (vert, jaune, rouge, étoile verte), mât de la cour, enregistrement de l\'hymne national « Le Lion rouge » (téléphone), fiche du drapeau à colorier, crayons de couleur vert, jaune et rouge' +
          (/voisins/.test(x.t) ? ' ; images des drapeaux des pays voisins (Mali, Mauritanie, Gambie, Guinée, Guinée-Bissau)' : '');
      }],
      [/rangement|ranger|entretien|bien collectif|matériel/, "Livres du coin bibliothèque, boîte de crayons, ardoises, jouets du coin jeu, 4 bacs de rangement étiquetés (photo + mot), 2 chiffons"],
      [/usages|bonjour|merci|politesse|savoir-vivre/, "2 marottes (un enfant, une grand-mère), 4 images de situations (dire bonjour, merci, au revoir, pardon), petite saynète préparée"],
      [/relations sociales|partage|coopér|entraide|solidarit|accepter/, "Images de partage et d'entraide (partager le goûter, aider un camarade tombé), 1 goûter à partager (biscuits), 1 ballon, 2 marottes"],
      [/besoins|émotion|famille/, "2 marottes, photos de familles (papa, maman, frère, sœur, grand-parent), 4 images de besoins (toilettes, soif, se moucher, jouer)"],
      [/autonome|prudence|adresse/, "Fiche avec le nom et le numéro de téléphone des parents de chaque enfant, 1 téléphone, images de situations de prudence (route, inconnu, feu), 2 marottes"],
      [/règle|règlement|groupe|école|organisation|culte|fêtes/, "Affiche des règles de vie de la classe en pictogrammes (lever le doigt, ranger, ne pas courir), 6 images de bons et de mauvais comportements, photos de l'école"]
    ],
    langage: [
      [/quelque chose|permission|autorisation/, "Objets à demander : 1 ballon, 1 livre d'images, 1 gobelet d'eau, 1 poupée ; 2 marottes (un enfant, la maîtresse) ; 4 images de demandes (aller aux toilettes, boire, sortir, jouer)"],
      [/salu|présent|prénom|\bnom\b|appelles/,"2 marottes (un enfant, un adulte), 4 images de rencontres (à l'école, au marché, à la maison), photos de la famille, 1 ballon pour le « Ball game »"],
      [/règles d'un jeu/, "Matériel d'un jeu connu des enfants (jeu du mouchoir : 1 foulard ; jeu de la balle : 1 ballon, 4 cerceaux), 4 images des étapes du jeu"],
      [/emprunter|réclamer|prête|rends/, "Objets de la classe à prêter et à rendre : 1 crayon, 1 gomme, 1 ballon, 1 poupée, 1 livre ; 2 marottes"],
      [/consigne/, "Fiche d'activité, crayons, ardoises, 4 objets de la classe à manipuler (ballon, livre, craie, cerceau), images des gestes (s'asseoir, ranger, colorier)"],
      [/date|jours?|événement/, "Calendrier de la classe, étiquettes des 7 jours, 4 images d'événements (fête de l'école, baptême, Korité, Tabaski), 2 marottes"],
      [/adresse|destination|lieu|où se trouve|où vas/, "Images de lieux (marché, mosquée, école, maison, boutique, poste de santé), plan simple du quartier, 2 marottes"],
      [/école|section|classe/, "Photos de l'école, de la classe, de l'enseignant(e) et du directeur (de la directrice), panneau du nom de l'école, 2 marottes"],
      [/sais|compris/, "4 images-devinettes (animaux, objets de la classe), 2 marottes, 1 sac mystère avec 3 objets"]
    ],
    conte: [
      [/audiovisuel|numérique|télévision|radio|tablette/, "1 téléphone ou 1 tablette avec une courte vidéo (3 mn) d'un conte, 4 images tirées de la vidéo"],
      [/vécu/, "4 photos d'un événement vécu par la classe (sortie, fête de l'école, plantation), frise pour les ranger"],
      [/imaginé/, "6 images variées (un lièvre, une hyène, un enfant, une forêt, un puits, un trésor) pour inventer, 2 marottes"],
      [/animal|bouki|lièvre/, "Album du conte, grandes images de Leuk-le-lièvre et de Bouki-l'hyène, marottes des 2 personnages, tam-tam pour ouvrir le conte"]
    ],
    vocabulaire: [
      [/émotion/, "Cartes des émotions (visages joyeux, triste, en colère, surpris, apeuré), 1 miroir, 1 dé des émotions, 2 marottes"],
      [/corps/, "1 poupée, grande image du corps, imagier du corps, loto du corps de 12 cartes-images"],
      [/couleur|école|fruits|légumes/, "Cartons de couleur (rouge, jaune, bleu, vert) ; objets de l'école : 1 crayon, 1 ardoise, 1 cahier, 1 gomme, 1 cartable ; fruits et légumes réels : 1 mangue, 1 orange, 1 banane, 1 carotte, 1 tomate, 1 oignon ; loto de 24 cartes-images et Memory de 12 paires"],
      [/conte|livre/, "Album du conte, 8 cartes-images des mots choisis (noms, adjectifs, verbes), planche du conte, marottes des personnages"]
    ],
    lecture: [
      [/\brime|riment/, "10 cartes-images de mots qui riment (gâteau / bateau, souris / tapis, maison / poisson), 1 tambourin, 2 cerceaux"],
      [/\ble jour\b|reconstituer la date|\bdate\b/, "7 étiquettes des jours de la semaine (capitales et script), calendrier de la classe, 1 ardoise et 1 craie par enfant"],
      [/lettres mobiles/, function (x) {
        return /prénom/.test(x.t)
          ? 'Par enfant : lettres mobiles en carton (capitales) de son prénom, étiquette-prénom modèle, 1 barquette'
          : 'Par enfant : lettres mobiles en carton (capitales), 1 barquette ; 4 étiquettes-modèles de mots simples (PAPA, MAMAN, BALLON, ÉCOLE) avec leur image';
      }],
      [/reconstitu.*(mots|phrase)/, "Par groupe : étiquettes-mots et étiquettes-phrases découpées, lettres mobiles (capitales), modèle affiché au tableau, 2 barquettes"],
      [/prénom|étiquette|présences/, "Étiquettes-prénoms de tous les enfants (avec la photo au verso en PS), tableau des présences, pâte adhésive ou pinces"],
      [/produire|inventer|dictée|dicter|faire écrire|raconter|message|texte|phrase correcte/, "Grande feuille (affiche) et marqueur, 4 images ou photos de l'événement, tableau, 1 crayon de couleur par enfant"],
      [/syllab|\bun son\b|\bsons?\b/, "12 cartes-images de mots de 1, 2 et 3 syllabes (chat, ballon, banane…), 1 tambourin pour frapper les syllabes, 3 cerceaux numérotés 1, 2, 3, jetons"],
      [/à l'oral|oral/, "10 cartes-images d'objets familiers, objets de la classe (ballon, livre, crayon), 1 tambourin"],
      [/lettre|alphabet|voyelle|capitale|script|cursive|graphie|phrase, mot/, "Abécédaire mural, cartes-lettres (capitales, script, cursive), lettres mobiles, 1 ardoise et 1 craie par enfant"],
      [/livre|couverture|titre|auteur|illustrateur|bande dessinée|album|revue/, "8 albums et livres d'images du coin bibliothèque, couvertures photocopiées, 2 revues, 1 bande dessinée"],
      [/comptine|formulette/, "Texte de la comptine (ou de la formulette) écrit sur une affiche illustrée, enregistrement sur téléphone"],
      [/histoire|conte|personnage|chronolog|restitu|lieux|anticip|dénouement|intention/, "Album de l'histoire, 4 à 6 images séquentielles agrandies, marottes des personnages"],
      [/consigne/, "Fiche d'activité par enfant, crayons de couleur, ciseaux à bouts ronds, colle"],
      [/dessin/, "1 feuille blanche par enfant, crayons de couleur, feutres"],
      [/cahier|écrit|calendrier|journal|recette|mots?\b/, "Différents écrits : 1 cahier, 1 journal, 1 calendrier, 1 recette, 1 facture, 1 boîte de médicament ; étiquettes-mots"]
    ],
    graphisme: [
      [/posture|tenir|outil scripteur|supports/, "Tables et chaises à la taille des enfants, par enfant : 1 ardoise, 1 craie, 1 crayon gras, 1 pinceau, 1 feuille A4"],
      [/prénom|lettre|mot|phrase|date|écri/, "Modèle écrit sur une bande (étiquette), 1 ardoise et 1 craie par enfant, cahier d'écriture ligné, crayon à papier, gomme"],
      [/./, function (x) {
        var m = x.os.match(/tracer (?:des |les )?(.+)/i), tr = m ? m[1].replace(/\s*\(.*$/, '') : 'tracés de la leçon';
        return 'Modèle des ' + tr + ' sur une affiche ; craie pour tracer au sol ; 1 plateau de sable (ou de farine) par groupe ; 1 ardoise et 1 craie par enfant ; fiche de graphisme (' + tr + ') et crayon gras';
      }]
    ],
    psychomotricite: [
      [/cloche-pied|marelle/, "Marelle de 8 cases tracée à la craie, 4 cerceaux, 4 palets (capsules), 1 sifflet"],
      [/coopér|opposer|équipe|collectif|bras de fer|pirogue/, "10 chasubles (ou foulards) de 2 couleurs (5 rouges, 5 bleus), 1 ballon, 1 corde de 5 m (tir à la corde), 4 plots, 1 sifflet"],
      [/grimper/, "1 corde à nœuds, 1 échelle basse, 2 nattes de réception, 1 arbre bas (sous surveillance)"],
      [/balanc|rouler|chuter|toboggan|tricycle|trottinette|vélo/, "1 balançoire, 1 toboggan, 2 tricycles, 2 trottinettes, 2 nattes de réception"],
      [/danse|pivoter|courber|tourniquet/, "1 téléphone avec enceinte, musique rythmée, 1 tam-tam, 10 foulards de couleur"],
      [/attraper|bloquer|passe/, "5 ballons en mousse, 5 balles, 3 peluches, 5 foulards, 1 sifflet"],
      [/lancer|cible|réceptacle|massacre|coup de pied/, "10 balles et 10 sacs de graines, 2 ballons, 4 seaux (réceptacles), 6 boîtes de conserve vides (jeu de massacre), craie pour la ligne de lancer"],
      [/équilibre|hamac|banc|support/, "1 banc, 1 poutre basse (planche posée sur 2 briques), 6 briques, 1 plan incliné, 5 sacs de graines à porter sur la tête, 2 nattes"],
      [/sauter|saut/, "6 cerceaux, 2 cordes, 1 élastique de 3 m, 4 lattes posées sur 2 briques, 2 nattes de réception, 1 sifflet"],
      [/courir|course/, "1 sifflet, 8 plots, craie (lignes de départ et d'arrivée), chronomètre du téléphone, 10 foulards de couleur"],
      [/marcher|marche|slalom|enjamb/, "10 plots (ou bouteilles remplies de sable), 4 lattes, 2 cordes, craie pour le départ et l'arrivée, 1 sifflet"]
    ],
    arts_musicaux: [
      [/danse|danser/, "1 djembé et 1 sabar, 1 téléphone avec enceinte (wango, diambadon, maagn, ndawrabine), 10 foulards, 5 pagnes"],
      [/dramatis|rôle|déguisement|scène|spectacle/, "Déguisements : 5 pagnes, 3 boubous, 3 chapeaux, 1 canne ; 2 marottes ; décor simple (natte, calebasse, tabouret)"],
      [/poème|\bvers\b/, function (x) { return 'Texte ' + (/comptine/.test(x.t) ? 'de la comptine et du poème' : 'du poème') + ' écrit sur une affiche illustrée de 3 images, 1 tambourin pour marquer le rythme'; }],
      [/hymne/, "Enregistrement de l'hymne national « Le Lion rouge » (téléphone et enceinte), texte des premiers vers sur une affiche, drapeau du Sénégal"],
      [/comptine|chant|phrases? musicales?|mélodie/, "Texte de la comptine (ou du chant) écrit sur une affiche illustrée, enregistrement sur téléphone, 1 tam-tam pour le rythme"],
      [/instrument|rythm|discriminer|imiter|produire des sons|objets sonores|sons/, "1 tam-tam, 4 maracas (bouteilles remplies de graines), 4 paires de bâtons, 2 calebasses, 2 pots en métal, 1 sifflet, 1 clochette"]
    ],
    arts_plastiques: [
      [/récupération|techniques artistiques/, "Objets récupérés et nettoyés : 10 rouleaux de papier toilette, 10 bouteilles en plastique, 30 capsules et bouchons de couleur, cartons d'emballage, chutes de tissu wax ; colle, ciseaux à bouts ronds, gouache, pinceaux"],
      [/poupée|marionnette|peluche/, "Par enfant : 1 chaussette, coton pour bourrer, 2 boutons (yeux), laine (cheveux), 1 morceau de tissu ; colle, ciseaux ; fil et aiguille (adulte)"],
      [/roulant|mécanique|vélo|voiturette|sablier|clepsydre/, "Par groupe : 2 boîtes en carton, 2 bouteilles en plastique, 8 bouchons (roues), 4 pics à brochette (axes), ficelle, colle, ciseaux ; modèle"],
      [/blocs|puzzle|domino|montage/, "Par groupe : 1 boîte de blocs logiques, 2 puzzles de 12 pièces, 1 jeu de dominos, 20 cubes de construction"],
      [/modelage|modeler|argile|pâte/, "Par enfant : 1 boule d'argile (ou de pâte à modeler), 1 planchette, 1 bâtonnet (ébauchoir) ; 1 bol d'eau et 1 chiffon par groupe ; modèle (bol, serpent, fruit)"],
      [/pliage/, "Par enfant : 3 feuilles de papier carrées de couleur (15 × 15 cm) ; modèle plié étape par étape (bateau, chapeau)"],
      [/collage/, "Par enfant : 1 feuille cartonnée, morceaux de papier de couleur et de magazine, chutes de tissu ; colle, pinceau à colle, ciseaux à bouts ronds"],
      [/peinture|peindre|empreinte|sablage|tableau/, "Gouache (rouge, jaune, bleu, blanc), 1 pinceau et 1 éponge par enfant, feuilles cartonnées, tabliers, gobelets d'eau ; sable et colle pour le sablage ; feuilles d'arbres pour les empreintes"],
      [/coloriage|colorier/, "Par enfant : 1 dessin à colorier (fruit, animal, maison), crayons de couleur, crayons gras, feutres"],
      [/dessin|dessiner/, "Par enfant : 1 feuille blanche, 1 crayon à papier, crayons de couleur ; modèle (objet réel ou image : fruit, animal, maison)"]
    ]
  };

  // Si aucune règle ne correspond : un matériel de base, nommé objet par objet
  var DEFAUT = {
    mesure: "Par groupe : 2 baguettes de longueurs différentes, 2 bouteilles d'1,5 l (une pleine, une vide), 1 pierre et 1 plume ; fiche d'exercice",
    numeriques: function (x) { return x.n + ' capsules et 1 barquette par enfant, cartes-nombres de ' + de1a(x.n) + ', 1 ardoise et 1 craie par enfant'; },
    geometrie: "Par groupe : 4 cercles, 4 carrés et 4 triangles en carton de couleur, 1 boîte de blocs logiques, 1 dé, 1 boîte de lait, 1 ballon",
    ist: "1 loupe, 1 miroir, 1 foulard, 4 images en lien avec la leçon, 1 fiche d'observation par enfant",
    hygiene: "1 savon, 1 bouilloire (« satala »), 1 bassine, 1 serviette propre, 4 images des bonnes habitudes d'hygiène",
    environnement: "1 balai, 1 pelle, 1 seau, 2 paires de gants, 1 sac poubelle, 4 images du quartier",
    valeurs: "2 marottes, 4 images de bons et de mauvais comportements, affiche des règles de vie de la classe",
    langage: "2 marottes (un enfant, un adulte), 4 images de la situation (rencontre, accueil), photos de la famille, 1 ballon pour le « Ball game »",
    conte: "Album du conte, 4 à 6 grandes images séquentielles, marottes des personnages, 1 tam-tam pour ouvrir le conte",
    vocabulaire: "Imagier, 12 cartes-images, loto de 24 cartes, Memory de 12 paires",
    lecture: "2 albums, étiquettes-mots, 1 ardoise et 1 craie par enfant",
    graphisme: "1 ardoise, 1 craie, 1 feuille A4 et 1 crayon gras par enfant",
    psychomotricite: "8 plots, 6 cerceaux, 2 cordes, 2 ballons, 1 sifflet, 2 nattes",
    arts_musicaux: "1 tam-tam, 4 maracas (bouteilles et graines), enregistrement sur téléphone",
    arts_plastiques: "1 feuille cartonnée, crayons de couleur, 1 pot de colle et 1 paire de ciseaux à bouts ronds par enfant"
  };

  function ucf(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function val(v, x) { return typeof v === 'function' ? v(x) : v; }

  // L'OS décide d'abord ; les contenus ne servent que si l'OS ne suffit pas.
  // niveau (PS, MS, GS) sert aux quantités quand la leçon n'en donne pas.
  function suggest(activite, os, contenus, niveau) {
    os = String(os || ''); contenus = String(contenus || '');
    var x = infos(os, contenus, niveau);
    var rules = R[activite] || [];
    var texts = [os.toLowerCase(), (os + ' ' + contenus).toLowerCase()];
    for (var t = 0; t < texts.length; t++) {
      for (var i = 0; i < rules.length; i++) {
        if (rules[i][0].test(texts[t])) return { materiel: val(rules[i][1], x), jeu: rules[i][2] || '' };
      }
    }
    return { materiel: val(DEFAUT[activite], x) || "1 ardoise, 1 craie et 1 fiche d'activité par enfant", jeu: '' };
  }

  window.SUNU_MATERIEL = { suggest: suggest };
})();
