/* ==========================================================================
   SUÑU FICHES — rédaction de la fiche
   Chaque activité suit la démarche officielle de son guide :
   - préscolaire : guides PS / MS / GS 2024 (démarches p. 106-142) et trames
     des fiches modèles GS (IST, mathématiques, vocabulaire) ;
   - élémentaire : démarches des guides pédagogiques (ressources/demarches-et-trames.md).
   ========================================================================== */
(function () {
  'use strict';

  var esc = function (s) { return window.SUNU ? window.SUNU.escapeHtml(s) : String(s); };

  // ---------- Outils de langue ----------
  function lcFirst(s) {
    s = String(s || '').trim();
    if (!s) return s;
    if (s.length > 1 && s.charAt(1) === s.charAt(1).toUpperCase() && /[A-Z]/.test(s.charAt(1))) return s; // sigle
    return s.charAt(0).toLowerCase() + s.slice(1);
  }
  // « Activités de mesure » -> « activités de mesure » ; « … (IST) » -> « IST »
  function shortAct(label) {
    var l = String(label || '').trim();
    var acr = l.match(/\(([A-Z]{2,})\)/);
    if (acr) return acr[1];
    return lcFirst(l.replace(/\s*\([^)]*\)/g, '')) || 'la leçon';
  }
  function ucFirst(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function de(s) { return (/^[aeiouyhàâäéèêëîïôöùûü]/i.test(s) ? "d'" : 'de ') + s; }
  function stripEnd(s) { return String(s || '').trim().replace(/[.;:]+$/, ''); }

  // Verbe à l'infinitif -> 3e personne du pluriel (« comparer » -> « comparent »)
  var IRREG = {
    'faire': 'font', 'dire': 'disent', 'lire': 'lisent', 'relire': 'relisent', 'écrire': 'écrivent', 'décrire': 'décrivent',
    'inscrire': 'inscrivent', 'recopier': 'recopient', 'prendre': 'prennent', 'apprendre': 'apprennent', 'comprendre': 'comprennent',
    'reprendre': 'reprennent', 'mettre': 'mettent', 'remettre': 'remettent', 'produire': 'produisent', 'reproduire': 'reproduisent',
    'construire': 'construisent', 'reconstruire': 'reconstruisent', 'conduire': 'conduisent', 'traduire': 'traduisent', 'détruire': 'détruisent',
    'cuire': 'cuisent', 'peindre': 'peignent', 'éteindre': 'éteignent', 'atteindre': 'atteignent', 'joindre': 'joignent', 'rejoindre': 'rejoignent',
    'craindre': 'craignent', 'connaître': 'connaissent', 'reconnaître': 'reconnaissent', 'paraître': 'paraissent', 'boire': 'boivent',
    'résoudre': 'résolvent', 'coudre': 'cousent', 'voir': 'voient', 'revoir': 'revoient', 'prévoir': 'prévoient', 'savoir': 'savent',
    'pouvoir': 'peuvent', 'vouloir': 'veulent', 'devoir': 'doivent', 'recevoir': 'reçoivent', 'apercevoir': 'aperçoivent',
    'asseoir': 'assoient', 'être': 'sont', 'avoir': 'ont', 'aller': 'vont', 'courir': 'courent', 'parcourir': 'parcourent',
    'ouvrir': 'ouvrent', 'couvrir': 'couvrent', 'découvrir': 'découvrent', 'offrir': 'offrent', 'sortir': 'sortent', 'partir': 'partent',
    'dormir': 'dorment', 'sentir': 'sentent', 'ressentir': 'ressentent', 'servir': 'servent', 'tenir': 'tiennent', 'retenir': 'retiennent',
    'maintenir': 'maintiennent', 'obtenir': 'obtiennent', 'venir': 'viennent', 'revenir': 'reviennent', 'accueillir': 'accueillent',
    'cueillir': 'cueillent', 'acquérir': 'acquièrent', 'conquérir': 'conquièrent', 'mourir': 'meurent','appeler': 'appellent', 'rappeler': 'rappellent', 'épeler': 'épellent', 'jeter': 'jettent', 'feuilleter': 'feuillettent'
  };
  function conjugate3pl(verb) {
    var v = verb.toLowerCase();
    if (IRREG[v]) return IRREG[v];
    var stem;
    if (/er$/.test(v)) {
      stem = v.slice(0, -2);
      if (/y$/.test(stem)) return stem.slice(0, -1) + 'ient';
      stem = stem.replace(/é([bcdfghjklmnpqrstvwxz]+)$/, 'è$1');
      stem = stem.replace(/([^aeiouyéèêë])e([bcdfgjklmnpqrstvz])$/, '$1è$2');
      return stem + 'ent';
    }
    if (/ir$/.test(v)) return v.slice(0, -2) + 'issent';
    if (/re$/.test(v)) return v.slice(0, -2) + 'ent';
    return null;
  }
  // « Identifier les parties de son corps » -> « Identifient les parties de leur corps »
  function learnersDo(os) {
    var text = stripEnd(os);
    var m = text.match(/^(se |s'|s’)?([A-Za-zÀ-ÿ]+)(.*)$/i);
    if (!m) return null;
    var verb = m[2];
    if (!/(er|ir|re|oir)$/i.test(verb)) return null;
    var conj = conjugate3pl(verb);
    if (!conj) return null;
    var rest = m[3]
      .replace(/\bson\b/g, 'leur').replace(/\bsa\b/g, 'leur').replace(/\bses\b/g, 'leurs')
      .replace(/\bsoi\b/g, 'eux');
    return ucFirst((m[1] || '').toLowerCase() + conj + rest);
  }

  // ---------- Répartition de la durée entre les étapes ----------
  function splitMinutes(weights, total) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0);
    var mins = weights.map(function (w) { return Math.max(1, Math.floor(w / sum * total)); });
    var used = mins.reduce(function (a, b) { return a + b; }, 0);
    var order = weights.map(function (w, i) { return i; }).sort(function (a, b) { return weights[b] - weights[a]; });
    var k = 0;
    while (used < total) { mins[order[k % order.length]]++; used++; k++; }
    while (used > total) {
      var i = order[k % order.length];
      if (mins[i] > 1) { mins[i]--; used--; }
      k++;
      if (k > 500) break;
    }
    return mins;
  }

  function step(name, w, m, e) {
    return { name: name, w: w, m: m.filter(Boolean), e: e.filter(Boolean) };
  }

  // ---------- Étapes communes au préscolaire ----------
  function prealables(c) {
    return step('Préalables', 2, [
      'Salue les enfants et installe une petite causerie',
      'Vérifie la bouche, les poches et les mains des enfants',
      'Installe les enfants en demi-cercle'
    ], [
      'Répondent aux salutations et participent à la causerie',
      'Se débarrassent de tout objet pouvant distraire',
      "S'installent en demi-cercle"
    ]);
  }
  // Révision : l'enseignant cite la notion de la leçon précédente, écrite entre parenthèses
  function prevNotion(c) { return c.prev ? esc(c.prev) : 'notion de la leçon précédente : ……………………………'; }
  function askPrev(c) {
    return 'Demande : <q>Rappelez-moi la notion que nous avons apprise lors de la dernière séance ' + esc(de(c.act)) + '.</q> (' + prevNotion(c) + ')';
  }
  function revision(c, w) {
    var prevDo = c.prevOS ? learnersDo(c.prevOS) : null;
    return step('Révision', w || 3, [
      askPrev(c),
      'Pose une ou deux questions sur cette notion et fait exécuter une petite consigne de rappel',
      'Aide – Corrige'
    ], [
      'Rappellent la notion apprise à la leçon précédente',
      prevDo ? esc(prevDo) + ' (consigne de rappel)' : 'Exécutent la consigne de rappel'
    ]);
  }
  function annonce(c, why) {
    return [
      "Annonce l'OS : <q>Aujourd'hui, nous allons apprendre à " + esc(c.os) + '.</q>',
      "Justifie l'OS : <q>Il est important de savoir " + esc(c.os) + ', ' + why + '.</q>'
    ];
  }
  function evaluationPre(c) {
    return step('Évaluation', 2, [
      'Propose une activité individuelle (orale, avec du matériel ou sur fiche) : chaque enfant doit ' + esc(c.os),
      "Observe chaque enfant et note les réussites sur la grille d'observation"
    ], [
      'Exécutent la consigne individuellement'
    ]);
  }
  function doIt(c) { return c.doE || ('Exécutent la consigne : ' + esc(c.os)); }
  function withCont(c) { return c.cont ? ' : ' + esc(c.cont) : ''; }

  var WHY = {
    maths: "car cela nous sert tous les jours : à la maison, au marché, pour partager ou pour ranger",
    lecture: "car cela nous aide à lire et à comprendre les écrits qui nous entourent",
    ecriture: "car cela nous permet d'écrire proprement et d'être bien lus",
    vocabulaire: "car connaître ces mots nous aide à mieux parler et à bien nous faire comprendre",
    hygiene: "car c'est ainsi que l'on garde son corps propre et que l'on reste en bonne santé",
    valeurs: "car cela nous aide à bien vivre ensemble, à l'école comme à la maison",
    environnement: "car cela nous protège et protège notre milieu de vie",
    ist: "car cela nous aide à mieux connaître le monde qui nous entoure"
  };

  // ---------- Trames du préscolaire ----------
  var PRE = {
    explicite: function (c) {
      var why = WHY[c.family] || WHY.maths;
      var isVoc = c.family === 'vocabulaire';
      return [
        prealables(c),
        revision(c, 3),
        step('Mise en situation', 2, annonce(c, why), ["Écoutent l'OS et les justifications"]),
        step("Présentation de l'éducateur(trice) (modélisation)", 4, [
          c.mat ? 'Présente le matériel : ' + esc(c.matShort) : 'Présente le matériel de la séance',
          c.jeu ? 'Propose le jeu : <q>' + esc(c.jeu) + '</q>' : null,
          isVoc ? 'Présente les mots du corpus un à un, avec les images ou les objets' + withCont(c)
                : 'Démontre devant les enfants en disant à voix haute chaque geste' + withCont(c),
          isVoc ? 'Dit chaque mot dans une phrase et le fait répéter' : 'Dit les mots-clés et les fait répéter',
          'Conclut en formulant le procédé à retenir'
        ], [
          'Écoutent et observent',
          isVoc ? 'Répètent les mots, puis les phrases' : 'Répètent les mots-clés'
        ]),
        step('Pratique guidée', 6, [
          'Organise les enfants en petits groupes et remet le matériel',
          (isVoc ? 'Fait jouer au jeu de planches ou au loto : ' : 'Fait ') + esc(c.os) + withCont(c),
          'Fait constater, puis fait conclure',
          'Aide – Corrige – Rectifie'
        ], [
          'Se mettent en groupes et prennent possession du matériel',
          doIt(c),
          'Constatent et concluent',
          "S'entraident, se rectifient"
        ]),
        step('Pratique autonome', 4, [
          c.jeu ? 'Fait jouer chaque enfant au jeu <q>' + esc(c.jeu) + '</q>'
                : (isVoc ? 'Propose un jeu individuel (Memory, cartes-images) pour réemployer les mots'
                         : 'Propose à chaque enfant une tâche individuelle sous forme de jeu'),
          'Aide – Corrige'
        ], [
          'Exécutent individuellement la tâche proposée'
        ]),
        step('Objectivation', 2, [
          "Fait rappeler l'OS et le procédé pour " + esc(c.os)
        ], [
          "Rappellent l'OS et le procédé avec leurs mots"
        ]),
        evaluationPre(c)
      ];
    },

    ist: function (c) {
      return [
        step('Préalables', 3, prealables(c).m, prealables(c).e),
        revision(c, 3),
        step('Mise en situation', 3, [
          "Présente la situation à partir d'un objet réel, d'une image ou d'un vécu des enfants",
          'Donne la consigne : <q>Observez bien : nous allons ' + esc(c.os) + '.</q>'
        ], ['Écoutent la situation et la consigne']),
        step('Exploitation de la situation', 7, [
          c.mat ? 'Distribue le matériel : ' + esc(c.matShort) : 'Distribue le matériel',
          "Fait observer librement, puis de façon dirigée",
          'Fait émettre des hypothèses et les fait vérifier par la manipulation',
          'Fait ' + esc(c.os) + withCont(c),
          'Aide – Corrige – Rectifie'
        ], [
          'Observent et manipulent',
          'Émettent des hypothèses et les vérifient',
          doIt(c),
          "S'entraident, se rectifient"
        ]),
        step('Consolidation', 3, [
          "Demande aux enfants l'objet de la leçon du jour",
          c.cont ? "Fait rappeler l'essentiel : " + esc(c.cont) : "Fait rappeler l'essentiel de la leçon"
        ], [
          "Rappellent l'objet de la leçon du jour",
          'Répondent aux questions'
        ]),
        step('Évaluation', 2, evaluationPre(c).m, evaluationPre(c).e)
      ];
    },

    langage: function (c) {
      return [
        prealables(c),
        step('Présentation de la situation', 3, [
          'Présente la situation (situation réelle, image ou petite histoire)',
          'Fait observer et laisse les enfants s\'exprimer librement'
        ], ["Observent et s'expriment librement"]),
        step('Vérification des prérequis', 2, [
          askPrev(c)
        ], ['Rappellent et réemploient les structures connues']),
        step('Exploitation de la situation', 9, [
          'Exploite les productions des enfants (échanges enfants / enfants et éducateur / enfants)',
          'Présente le dialogue modèle' + (c.cont ? ' avec la structure : ' + esc(c.cont) : ''),
          'Explique les mots nouveaux',
          'Fait jouer le dialogue deux à deux',
          c.jeu ? 'Propose le jeu : <q>' + esc(c.jeu) + '</q>' : null
        ], [
          'Échangent entre eux et avec l\'éducateur(trice)',
          'Écoutent le dialogue modèle et répètent la structure',
          'Jouent le dialogue deux à deux'
        ]),
        step('Consolidation / synthèse', 5, [
          'Fait varier la structure dans une situation voisine',
          'Aide – Corrige la prononciation et l\'articulation'
        ], ['Réemploient la structure dans une situation voisine']),
        step('Évaluation', 4, [
          'Propose une situation voisine et fait produire chaque enfant : ' + esc(c.os),
          'Observe et note les réussites'
        ], [doIt(c)])
      ];
    },

    conte: function (c) {
      return [
        prealables(c),
        step('Présentation du conte', 3, [
          "Installe les enfants pour l'écoute",
          'Annonce le titre, montre la couverture ou une image et fait émettre des hypothèses'
        ], ['Observent la couverture et font des hypothèses']),
        step('Présentation du récit', 7, [
          'Raconte le conte avec expression (intonation, mimes, gestes)',
          'Raconte une deuxième fois, épisode par épisode, en montrant les images'
        ], ['Écoutent attentivement', 'Suivent le récit sur les images']),
        step('Exploitation', 8, [
          'Pose des questions sur les faits, les personnages, les lieux et l\'évolution des événements',
          'Fait comparer la situation de départ et la situation finale',
          'Fait ' + esc(c.os) + withCont(c)
        ], [
          'Répondent aux questions',
          'Comparent le début et la fin du conte',
          doIt(c)
        ]),
        step('Évaluation', 5, [
          'Fait restituer le conte ou un épisode',
          "Fait décrire un personnage à partir d'une image",
          'Fait dégager la leçon du conte (règle morale ou civique)'
        ], [
          'Restituent le conte ou un épisode',
          'Décrivent un personnage',
          'Disent la leçon du conte avec leurs mots'
        ])
      ];
    },

    graphisme: function (c) {
      return [
        prealables(c),
        step('Vécu corporel', 5, [
          'Fait vivre le tracé avec le corps : en marchant sur le tracé au sol, puis avec le bras dans l\'espace',
          'Fait respecter le sens : de gauche à droite et de haut en bas'
        ], ['Vivent le tracé avec le corps, puis avec le bras']),
        step('Présentation et exploitation de la situation', 5, [
          'Présente le modèle' + withCont(c),
          'Fait observer, décrire et nommer le tracé'
        ], ['Observent, décrivent et nomment le tracé']),
        step('Représentation graphique et verbalisation', 9, [
          'Trace le modèle au tableau en verbalisant',
          "Fait tracer sur l'ardoise, puis sur la feuille",
          'Suit chaque enfant : posture, tenue de l\'outil, sens du tracé',
          'Aide – Corrige – Rectifie'
        ], [
          "Tracent sur l'ardoise puis sur la feuille en disant ce qu'ils font",
          "S'appliquent et se corrigent"
        ]),
        step('Évaluation', 4, [
          "Fait réaliser le tracé dans le cahier d'activités",
          'Observe et note les réussites'
        ], ['Réalisent le tracé individuellement'])
      ];
    },

    hygiene: function (c) {
      return [
        prealables(c),
        revision(c, 3),
        step('Mise en situation', 3, [
          "Présente une situation d'hygiène tirée du vécu des enfants (image, saynète, observation)",
          "Annonce l'objectif : <q>Nous allons " + esc(c.os) + '.</q>'
        ], ['Observent et écoutent']),
        step('Exploitation', 9, [
          "Fait identifier le problème d'hygiène",
          'Fait proposer des solutions',
          'Fait mettre en œuvre la solution retenue' + withCont(c),
          'Aide – Corrige'
        ], [
          'Identifient le problème',
          'Proposent des solutions',
          doIt(c)
        ]),
        step('Validation', 4, ["Fait comparer l'état de départ et l'état final"], ['Comparent et constatent']),
        step('Évaluation', 4, [
          "Fait formuler la règle d'hygiène",
          'Suit les comportements des enfants en classe et dans la cour'
        ], ['Formulent la règle avec leurs mots'])
      ];
    },

    valeurs: function (c) {
      return [
        prealables(c),
        revision(c, 2),
        step('Mise en situation', 3, [
          'Présente une situation vécue, une image ou un court récit en lien avec : ' + esc(c.cont || c.os)
        ], ['Observent et écoutent']),
        step('Exploitation', 4, ['Fait décrire la situation et les comportements des personnages'], ['Décrivent la situation']),
        step('Identification du problème', 3, ['Fait identifier le problème moral ou civique'], ['Identifient le problème']),
        step('Propositions de solutions', 4, ['Fait proposer des solutions et clarifie les valeurs en jeu'], ['Proposent des solutions']),
        step('Mise en œuvre', 3, ['Fait jouer la bonne conduite (saynète, jeu de rôle) : ' + esc(c.os)], [doIt(c)]),
        step('Validation', 2, ['Propose une situation similaire et fait appliquer la bonne conduite'], ['Appliquent la bonne conduite']),
        step('Évaluation', 2, ['Fait formuler le comportement attendu', 'Observe les conduites au quotidien'], ['Disent le comportement attendu'])
      ];
    },

    environnement: function (c) {
      return [
        prealables(c),
        step('Mise en situation', 3, [
          'Présente une situation du milieu (sortie, image, observation de la cour) en lien avec : ' + esc(c.cont || c.os)
        ], ['Observent et s\'expriment']),
        step('Identification du problème', 4, ['Fait identifier le problème environnemental ou de sécurité'], ['Identifient le problème']),
        step('Propositions de solutions', 5, ['Fait proposer des solutions', 'Fait choisir la solution à appliquer'], ['Proposent des solutions et choisissent']),
        step('Mise en œuvre', 5, ['Fait appliquer la solution retenue : ' + esc(c.os)], [doIt(c)]),
        step('Comparaison état initial / état final', 3, ['Fait comparer la situation avant et après'], ['Comparent et constatent']),
        step('Évaluation', 3, ['Fait formuler la règle à retenir'], ['Formulent la règle avec leurs mots'])
      ];
    },

    psycho: function (c) {
      return [
        step('Préalables', 3, [
          "Vérifie la tenue des enfants et la sécurité de l'aire de jeu",
          'Installe les enfants',
          "Annonce l'objectif : <q>Aujourd'hui, nous allons " + esc(c.os) + '.</q>'
        ], ["S'installent et écoutent"]),
        step('Mise en train', 5, [
          'Fait marcher, trottiner puis courir en variant les allures',
          "Fait des mouvements d'échauffement (bras, jambes, chevilles)",
          'Fait un petit jeu d\'éveil au signal'
        ], ['Marchent, trottinent, courent', "S'échauffent et réagissent au signal"]),
        step('Corps de séance', 16, [
          c.mat ? 'Dispose le matériel : ' + esc(c.matShort) : 'Dispose le matériel',
          'Donne les consignes et les règles de sécurité',
          'Fait une démonstration, puis fait faire des essais',
          'Fait ' + esc(c.os) + withCont(c),
          c.jeu ? 'Organise le jeu : <q>' + esc(c.jeu) + '</q>' : null,
          'Encourage, aide et corrige les postures'
        ], [
          'Écoutent les consignes',
          'Observent la démonstration et font des essais',
          doIt(c),
          'Respectent les règles et s\'encouragent'
        ]),
        step('Retour au calme', 3, ['Fait marcher lentement en respirant profondément', 'Fait ranger le matériel'], ['Marchent lentement et respirent', 'Rangent le matériel']),
        step('Relaxation', 3, ['Fait allonger les enfants sur la natte, yeux fermés, respiration lente', 'Fait le bilan de la séance'], ['Se détendent', 'Disent ce qu\'ils ont fait et appris'])
      ];
    },

    chant: function (c) {
      return [
        step('Préalables', 3, [
          'Dispose les enfants debout',
          'Vérifie les mains, la bouche et le nez',
          "Fait des vocalises et fait imiter des cris d'animaux"
        ], ['Se mettent debout', 'Font les vocalises et imitent les cris']),
        step('Révision', 4, ['Fait chanter 2 ou 3 chants ou comptines connus'], ['Chantent les chants connus']),
        step('Apprentissage', 12, [
          'Fait asseoir les enfants',
          'Chante (ou récite) le texte en entier deux à trois fois',
          'Explique le sens et les mots difficiles',
          'Fait apprendre phrase musicale par phrase musicale : les paroles, puis la mélodie',
          'Fait lier progressivement les phrases',
          'Fait ' + esc(c.os) + withCont(c)
        ], [
          'Écoutent attentivement',
          'Répètent phrase par phrase',
          doIt(c)
        ]),
        step('Évaluation', 4, ['Fait chanter individuellement, puis en groupe', 'Aide – Corrige'], ['Chantent seuls, puis en groupe']),
        step('Animation', 2, ['Termine par 1 ou 2 chansons connues et rythmées'], ['Chantent et dansent'])
      ];
    },

    scenique: function (c) {
      return [
        step('Mise en train', 4, ['Fait des exercices d\'échauffement du corps et de la voix'], ["S'échauffent"]),
        step('Découverte du jeu de rôles', 7, [
          'Présente la scène ou le texte' + withCont(c),
          'Répartit les rôles',
          'Fait apprendre le dialogue et les gestes'
        ], ['Écoutent et choisissent un rôle', 'Apprennent le dialogue et les gestes']),
        step('Répétitions', 9, [
          'Fait répéter par petits groupes, séquence par séquence, puis en entier',
          'Fait ' + esc(c.os),
          'Aide – Corrige la voix, les gestes et les déplacements'
        ], ['Répètent par groupes puis en entier', doIt(c)]),
        step('Représentation', 5, [
          'Installe le décor, les accessoires et les costumes',
          'Fait jouer la scène devant les camarades (acteurs et spectateurs)'
        ], ['Jouent la scène', 'Regardent et applaudissent les camarades'])
      ];
    },

    plastique: function (c) {
      return [
        prealables(c),
        step('Motivation', 3, [
          "Présente l'objet à réaliser et son utilité",
          "Annonce l'objectif : <q>Nous allons " + esc(c.os) + '.</q>'
        ], ['Observent et écoutent']),
        step('Identification du matériel', 4, [
          c.mat ? 'Présente et fait nommer le matériel : ' + esc(c.matShort) : 'Présente et fait nommer le matériel',
          "Rappelle les règles de sécurité et d'hygiène"
        ], ['Nomment le matériel']),
        step('Réalisation', 12, [
          'Laisse faire des essais',
          'Montre la technique étape par étape',
          'Fait ' + esc(c.os) + withCont(c),
          'Aide – Corrige'
        ], ['Font des essais', doIt(c), "S'entraident"]),
        step('Évaluation', 4, [
          'Fait présenter les réalisations',
          "Apprécie la démarche suivie et l'utilité de l'objet, sans comparer les enfants entre eux"
        ], ['Présentent leur réalisation'])
      ];
    }
  };

  function preTrame(key, os, oa) {
    switch (key) {
      case 'langage': return { trame: 'langage', family: 'langage' };
      case 'conte': return { trame: 'conte', family: 'conte' };
      case 'vocabulaire': return { trame: 'explicite', family: 'vocabulaire' };
      case 'lecture': return { trame: 'explicite', family: 'lecture' };
      case 'graphisme':
        return /écri|lettre|prénom|\bmots?\b|cursive|script|majuscule/i.test(os)
          ? { trame: 'explicite', family: 'ecriture' } : { trame: 'graphisme', family: 'graphisme' };
      case 'numeriques': case 'geometrie': case 'mesure': return { trame: 'explicite', family: 'maths' };
      case 'ist': return { trame: 'ist', family: 'ist' };
      case 'hygiene': return { trame: 'hygiene', family: 'hygiene' };
      case 'valeurs': return { trame: 'valeurs', family: 'valeurs' };
      case 'environnement': return { trame: 'environnement', family: 'environnement' };
      case 'psychomotricite': return { trame: 'psycho', family: 'psycho' };
      case 'arts_musicaux':
        return /dans|dramatis|rôle|scène|spectacle|prestation/i.test(os + ' ' + oa)
          ? { trame: 'scenique', family: 'arts' } : { trame: 'chant', family: 'arts' };
      case 'arts_plastiques': return { trame: 'plastique', family: 'arts' };
      default: return { trame: 'explicite', family: 'maths' };
    }
  }

  var TRAME_LABELS = {
    explicite: 'Démarche explicite : Préalables → Révision → Mise en situation → Modélisation → Pratique guidée → Pratique autonome → Objectivation → Évaluation',
    ist: 'Démarche IST : Préalables → Révision → Mise en situation → Exploitation → Consolidation → Évaluation',
    langage: 'Démarche du langage : Situation → Prérequis → Exploitation → Consolidation → Évaluation',
    conte: 'Démarche du conte : Préalables → Présentation du conte → Récit → Exploitation → Évaluation',
    graphisme: 'Démarche du graphisme : Vécu corporel → Situation → Représentation graphique → Évaluation',
    hygiene: "Démarche de l'hygiène : Mise en situation → Exploitation → Validation → Évaluation",
    valeurs: 'Démarche des valeurs : Situation → Problème → Solutions → Mise en œuvre → Validation → Évaluation',
    environnement: "Démarche de l'éducation environnementale : Situation → Problème → Solutions → Mise en œuvre → Comparaison → Évaluation",
    psycho: 'Démarche de la psychomotricité : Préalables → Mise en train → Corps de séance → Retour au calme → Relaxation',
    chant: 'Démarche chant / comptine / poésie : Préalables → Révision → Apprentissage → Évaluation → Animation',
    scenique: 'Démarche art scénique : Mise en train → Jeu de rôles → Répétitions → Représentation',
    plastique: 'Démarche des arts plastiques : Motivation → Matériel → Réalisation → Évaluation'
  };

  // ---------- Trames de l'élémentaire ----------
  function rappel(c, w) {
    return step('Rappel / Révision', w || 3, [
      c.prev ? 'Fait rappeler la leçon précédente : <q>' + esc(c.prev) + '</q>' : 'Fait rappeler la leçon précédente et vérifie les prérequis'
    ], ['Rappellent la leçon précédente et répondent aux questions']);
  }
  function annonceElem(c) {
    return "Annonce l'objectif de la séance : <q>Aujourd'hui, nous allons " + esc(c.os) + '.</q>';
  }
  function evalElem(c, w) {
    return step('Évaluation', w || 6, [
      'Propose un exercice individuel sur le cahier : ' + esc(c.os),
      'Corrige et repère les élèves en difficulté'
    ], ['Font l\'exercice individuellement', 'Corrigent leurs erreurs']);
  }

  var ELEM = {
    expression_orale: function (c) {
      return [
        rappel(c, 3),
        step('Appropriation / préparation', 7, [annonceElem(c), 'Met les élèves en contact avec le prétexte (image, objet, situation vécue, extrait sonore)'], ['Observent, écoutent et découvrent le prétexte']),
        step('Production libre', 8, ['Laisse les élèves s\'exprimer librement, sans corriger'], ['S\'expriment librement']),
        step('Exploitation', 15, ['Dirige la production' + withCont(c), 'Corrige au fur et à mesure (évaluation formative) et fait reprendre'], [doIt(c), 'Reprennent les énoncés corrigés']),
        evalElem(c, 7)
      ];
    },
    recitation: function (c) {
      return [
        rappel(c, 3),
        step('Compréhension globale', 6, [annonceElem(c), 'Présente le texte et en fait dégager l\'idée générale', 'Explique les mots difficiles'], ['Écoutent et disent de quoi parle le texte']),
        step('Audition modèle', 4, ['Dit le texte de façon expressive'], ['Écoutent attentivement']),
        step('Apprentissage', 12, ['Fait apprendre vers par vers (procédé cumulatif)'], ['Répètent vers par vers puis par strophe']),
        step('Diction expressive', 5, ['Fait dire le texte avec le ton, les pauses et les gestes'], ['Disent le texte de façon expressive']),
        step('Évaluation', 5, ['Fait restituer le texte de mémoire'], ['Récitent individuellement'])
      ];
    },
    lecture: function (c) {
      return [
        step('Mise en projet de lecture', 5, [annonceElem(c), 'Fait anticiper le contenu à partir du titre et des illustrations'], ['Émettent des hypothèses sur le texte']),
        step('Lecture silencieuse', 5, ['Fait lire le texte silencieusement'], ['Lisent silencieusement']),
        step('Exploitation de la lecture silencieuse', 5, ['Fait reformuler librement ce qui a été compris'], ['Reformulent et confrontent leurs points de vue']),
        step('Investigation collective', 10, ['Lit à haute voix, explique les mots difficiles', 'Fait dégager les idées principales' + withCont(c)], ['Suivent, expliquent et relèvent les idées principales']),
        step('Compréhension fine', 8, ['Pose des questions littérales et inférentielles, fait justifier par le texte'], ['Répondent en justifiant par le texte']),
        step('Lecture expressive', 7, ['Lit le texte de façon modèle, puis fait lire les élèves'], ['Lisent à haute voix de façon expressive']),
        evalElem(c, 5)
      ];
    },
    production_ecrits: function (c) {
      return [
        rappel(c, 3),
        step('Détermination du projet', 5, [annonceElem(c), "Présente le projet d'écriture et son destinataire"], ['Comprennent le projet et le destinataire']),
        step('Lire pour écrire', 8, ['Fait lire un texte du même type et en fait dégager les caractéristiques' + withCont(c)], ['Lisent et relèvent les caractéristiques du texte']),
        step('Paramètres et critères de réussite', 6, ['Fait préciser : à qui j\'écris ? dans quel but ?', 'Élabore avec la classe la fiche de critères et la banque de mots'], ['Précisent les paramètres et les critères']),
        step('Premier jet', 12, ['Fait rédiger le premier jet', 'Circule et aide'], [doIt(c)]),
        step('Évaluation formative et deuxième jet', 8, ['Fait vérifier les critères, corrige, fait améliorer le texte'], ['Cochent les critères et améliorent leur texte'])
      ];
    },
    langue: function (c) {
      return [
        rappel(c, 5),
        step('Présentation du corpus', 5, [annonceElem(c), 'Écrit au tableau un corpus de phrases' + withCont(c)], ['Lisent le corpus']),
        step('Observation et analyse', 10, ['Fait observer, comparer et manipuler les phrases', 'Pose des questions pour faire découvrir la notion'], ['Observent, comparent, manipulent et répondent']),
        step('Synthèse / règle', 7, ['Fait formuler la règle et l\'écrit au tableau'], ['Formulent la règle et la recopient']),
        step('Application', 10, ['Propose des exercices d\'application, au tableau puis sur l\'ardoise'], [doIt(c)]),
        evalElem(c, 8)
      ];
    },
    ecriture: function (c) {
      return [
        step('Préparation', 3, ['Fait adopter la bonne posture', 'Fait assouplir les doigts et le poignet'], ['Se tiennent bien et assouplissent les doigts']),
        step('Présentation du modèle', 5, [annonceElem(c), 'Présente le modèle' + withCont(c)], ['Observent et décrivent le modèle']),
        step('Tracé au tableau', 5, ['Trace le modèle au tableau en décrivant chaque geste'], ['Observent et tracent dans l\'espace']),
        step('Entraînement guidé', 8, ["Fait tracer sur l'ardoise", 'Aide – Corrige'], ["Tracent sur l'ardoise"]),
        step('Écriture sur le cahier', 9, ['Fait écrire sur le cahier en respectant les lignes'], [doIt(c)]),
        step('Évaluation', 5, ['Apprécie la lisibilité, la forme et la taille des lettres'], ['Comparent leur écriture au modèle'])
      ];
    },
    numeriques: function (c) {
      return [
        step('Calcul mental', 5, ['Fait faire quelques calculs rapides (procédé La Martinière)'], ['Calculent et montrent l\'ardoise']),
        rappel(c, 3),
        step('Présentation du problème', 5, [annonceElem(c), 'Présente la situation-problème et vérifie la compréhension de la consigne'], ['Lisent, reformulent la consigne']),
        step('Exploration individuelle puis en groupes', 10, ['Laisse chercher individuellement, puis organise les échanges en groupes'], ['Cherchent seuls, puis échangent en groupes']),
        step('Mise en commun et validation', 8, ['Fait présenter les procédures, organise le débat et la validation'], ['Présentent et défendent leurs procédures']),
        step('Institutionnalisation', 6, ['Fait formuler la synthèse et l\'écrit au tableau' + withCont(c)], ['Formulent et recopient la synthèse']),
        step('Réinvestissement / évaluation', 8, ['Propose des exercices individuels : ' + esc(c.os)], [doIt(c)])
      ];
    },
    geometrie: function (c) {
      return [
        rappel(c, 3),
        step('Observation', 5, [annonceElem(c), 'Fait manipuler librement les objets ou les figures'], ['Manipulent et observent']),
        step('Construction libre', 6, ['Fait plier, découper ou tracer librement'], ['Construisent librement']),
        step('Communication', 4, ['Fait présenter et décrire les productions'], ['Présentent et décrivent']),
        step('Construction dirigée', 10, ['Guide la construction avec les instruments' + withCont(c)], [doIt(c)]),
        step('Analyse / synthèse', 7, ['Fait dégager les propriétés et la définition'], ['Disent les propriétés et la définition']),
        step('Contrôle et réinvestissement', 10, ['Fait reconstruire à partir de la définition', 'Propose un exercice individuel'], ['Reconstruisent et font l\'exercice'])
      ];
    },
    mesure: function (c) {
      return [
        rappel(c, 4),
        step('Mise en situation', 5, [annonceElem(c), 'Présente une situation qui fait apparaître la nécessité de mesurer'], ['Comprennent le besoin de mesurer']),
        step('Recherche', 10, ["Fait mesurer d'abord avec des étalons arbitraires (pas, empan, ficelle, bouteille)"], ['Mesurent avec les étalons proposés']),
        step('Communication', 6, ['Fait rendre compte des mesures : un nombre et une unité'], ['Présentent leurs mesures']),
        step("Découverte de l'unité conventionnelle", 8, ["Fait découvrir la nécessité d'une unité commune" + withCont(c)], ["Découvrent et utilisent l'unité conventionnelle"]),
        step('Contrôle et transfert', 12, ['Fait mesurer individuellement : ' + esc(c.os)], [doIt(c)])
      ];
    },
    problemes: function (c) {
      return [
        step('Calcul mental', 5, ['Fait faire quelques calculs rapides'], ['Calculent sur l\'ardoise']),
        step('Présentation du problème', 6, [annonceElem(c), 'Présente l\'énoncé, fait dégager les données et la question'], ['Lisent l\'énoncé, relèvent les données et la question']),
        step('Recherche', 12, ['Laisse chercher individuellement puis en groupes'], ['Cherchent, schématisent, calculent']),
        step('Mise en commun', 8, ['Fait comparer les démarches et valider la solution'], ['Présentent et justifient leurs démarches']),
        step('Synthèse', 6, ['Fait formuler la démarche de résolution' + withCont(c)], ['Formulent la démarche']),
        evalElem(c, 8)
      ];
    },
    histoire: function (c) {
      return [
        rappel(c, 2),
        step('Préparation', 4, [annonceElem(c), 'Présente les sources (documents, images, témoignages) et organise les groupes'], ['Se mettent en groupes et découvrent les sources']),
        step('Recueil des informations', 8, ['Fait rechercher les informations dans les documents' + withCont(c)], ['Lisent, observent et notent les informations']),
        step('Exploitation', 8, ['Fait présenter et confronter les productions de groupes'], ['Présentent et comparent']),
        step('Récapitulation', 4, ['Fait récapituler les points essentiels'], ['Récapitulent']),
        step('Synthèse', 4, ['Fait élaborer le résumé à retenir'], ['Élaborent et recopient le résumé'])
      ];
    },
    geographie: function (c) {
      return [
        rappel(c, 2),
        step('Préparation', 3, [annonceElem(c), 'Présente le terrain ou ses substituts (maquette, photos, carte)'], ['Découvrent le support']),
        step('Observation libre', 4, ['Laisse observer librement'], ['Observent et s\'expriment']),
        step('Observation dirigée', 9, ['Fait localiser, décrire, comparer et expliquer' + withCont(c)], [doIt(c)]),
        step('Correction et apport complémentaire', 6, ['Corrige les productions et apporte des informations'], ['Corrigent et complètent']),
        step('À retenir', 6, ['Fait réaliser le croquis, le schéma ou le résumé'], ['Réalisent et recopient la trace écrite'])
      ];
    },
    ist: function (c) {
      return [
        rappel(c, 3),
        step('Observation, étonnement, questionnement', 7, [annonceElem(c), 'Présente la situation et laisse observer', 'Fait formuler des questions et des hypothèses'], ['Observent, s\'interrogent, formulent des hypothèses']),
        step('Organisation et systématisation', 11, ['Fait concevoir et réaliser des expériences simples' + withCont(c), 'Veille au langage scientifique exact'], ['Réalisent les expériences', 'Notent les résultats dans le cahier d\'expériences']),
        step('Synthèse', 5, ['Fait dégager les notions clés'], ['Formulent les notions clés']),
        step('À retenir', 4, ['Fait réaliser le schéma ou le résumé au cahier'], ['Recopient le schéma ou le résumé'])
      ];
    },
    vdsm: function (c) {
      return [
        rappel(c, 3),
        step('Observation et questionnement', 6, [annonceElem(c), 'Présente la situation du milieu (sortie, images, faits)'], ['Observent et posent des questions']),
        step('Analyse', 12, ['Fait dégager : problème → causes → conséquences → solutions' + withCont(c)], ['Analysent la situation en groupes']),
        step('Synthèse', 5, ['Fait récapituler et élaborer la synthèse'], ['Formulent la synthèse']),
        step('Réinvestissement', 4, ['Fait proposer des actions concrètes à l\'école ou à la maison'], [doIt(c)])
      ];
    },
    vens: function (c) {
      return [
        rappel(c, 3),
        step('Compréhension', 6, [annonceElem(c), 'Présente le prétexte (situation vécue, simulée ou histoire)'], ['Écoutent et décrivent la situation']),
        step('Analyse et discussion', 8, ['Fait apparaître tous les points de vue, y compris opposés' + withCont(c)], ['Expriment et discutent leurs points de vue']),
        step('Appréciation', 5, ['Fait peser les avantages et les inconvénients de chaque option'], ['Comparent les options']),
        step('Choix argumenté', 5, ['Laisse chaque élève choisir en argumentant, sans imposer la réponse'], ['Choisissent et argumentent']),
        step('Réinvestissement', 3, ['Fait dire comment appliquer ce choix dans la vie de tous les jours'], [doIt(c)])
      ];
    },
    eps: function (c) {
      return [
        step('Prise en main', 3, ['Met les élèves en rangs, vérifie les tenues', annonceElem(c)], ['Se mettent en rangs']),
        step('Mise en train / échauffement', 6, ["Fait courir et s'échauffer progressivement"], ["S'échauffent"]),
        step('Exercices préparatoires', 6, ['Fait réaliser les exercices liés aux ateliers'], ['Réalisent les exercices']),
        step('Déroulement des activités', 16, [c.mat ? 'Dispose le matériel : ' + esc(c.matShort) : 'Dispose le matériel', 'Organise les ateliers' + withCont(c), 'Fait ' + esc(c.os)], [doIt(c), 'Respectent les règles et la sécurité']),
        step('Retour au calme', 3, ['Fait marcher et respirer lentement'], ['Récupèrent']),
        step('Bilan et évaluation', 3, ['Fait le bilan et apprécie les progrès'], ['Disent ce qu\'ils ont réussi']),
        step('Toilette et retour en classe', 3, ['Fait faire la toilette et ramène la classe'], ['Font leur toilette'])
      ];
    },
    arts_plastiques: function (c) {
      return [
        rappel(c, 2),
        step('Observation et expression orale', 6, [annonceElem(c), "Présente l'objet ou le modèle et le fait décrire"], ['Observent et décrivent']),
        step('Essais préparatoires', 6, ['Fait faire des essais' + withCont(c)], ['Font des essais']),
        step('Exécution', 12, ['Fait réaliser le travail', 'Aide – Corrige'], [doIt(c)]),
        step('Correction', 4, ['Fait comparer chaque production avec le modèle, sans comparer les élèves entre eux'], ['Comparent leur travail au modèle'])
      ];
    },
    musique: function (c) {
      return [
        step('Exercices préparatoires', 4, ['Fait respirer, s\'étirer et vocaliser'], ['Respirent et vocalisent']),
        step('Compréhension', 5, [annonceElem(c), "Fait dégager l'idée générale et explique 2 ou 3 mots clés"], ['Disent de quoi parle le chant']),
        step('Exécution globale modèle', 4, ['Chante le chant en entier (ou le fait écouter)'], ['Écoutent']),
        step('Apprentissage', 12, ['Fait apprendre phrase musicale par phrase musicale' + withCont(c)], ['Répètent phrase par phrase', doIt(c)]),
        step('Concours de chants', 5, ['Fait chanter par groupes et individuellement'], ['Chantent par groupes'])
      ];
    },
    arts_sceniques: function (c) {
      return [
        step('Imprégnation', 6, [annonceElem(c), 'Présente la situation à dramatiser'], ['Écoutent et comprennent la situation']),
        step('Production et dramatisation', 16, ['Fait élaborer le scénario, travailler la gestuelle, la diction et le déguisement' + withCont(c)], [doIt(c)]),
        step('Répétition générale', 8, ['Fait jouer la scène en entier et apprécie'], ['Jouent la scène'])
      ];
    }
  };

  var ELEM_TRAME_LABELS = {
    expression_orale: 'Expression orale : Appropriation → Production libre → Exploitation → Évaluation',
    recitation: 'Récitation : Compréhension → Audition modèle → Apprentissage → Diction → Restitution',
    lecture: 'Lecture : Mise en projet → Lecture silencieuse → Investigation → Compréhension → Lecture expressive → Évaluation',
    production_ecrits: "Production d'écrits : Projet → Lire pour écrire → Critères → 1er jet → 2e jet",
    langue: 'Outils de la langue : Corpus → Observation → Règle → Application → Évaluation',
    ecriture: 'Écriture : Préparation → Modèle → Tracé → Entraînement → Cahier → Évaluation',
    numeriques: 'Activités numériques : Problème → Recherche → Mise en commun → Institutionnalisation → Réinvestissement',
    geometrie: 'Géométrie : Observation → Construction libre → Construction dirigée → Synthèse → Contrôle',
    mesure: 'Mesure : Situation → Étalons arbitraires → Communication → Unité conventionnelle → Transfert',
    problemes: 'Résolution de problèmes : Énoncé → Recherche → Mise en commun → Synthèse → Évaluation',
    histoire: 'Histoire : Préparation → Recueil → Exploitation → Récapitulation → Synthèse',
    geographie: 'Géographie : Préparation → Observation libre → Observation dirigée → À retenir',
    ist: 'IST : Observation → Expériences → Synthèse → À retenir',
    vdsm: 'Vivre dans son milieu : Observation → Problème / causes / conséquences / solutions → Synthèse',
    vens: 'Vivre ensemble : Compréhension → Discussion → Appréciation → Choix argumenté',
    eps: 'EPS : Prise en main → Échauffement → Ateliers → Retour au calme → Bilan',
    arts_plastiques: 'Arts plastiques : Observation → Essais → Exécution → Correction',
    musique: 'Éducation musicale : Préparation → Compréhension → Modèle → Apprentissage → Concours',
    arts_sceniques: 'Arts scéniques : Imprégnation → Dramatisation → Répétition générale'
  };

  var MONTHS = { 1: 'octobre – décembre', 2: 'janvier – mars', 3: 'avril – juin' };
  var TRIM = { 1: '1er trimestre', 2: '2e trimestre', 3: '3e trimestre' };

  function trameInfo(p) {
    if (p.cycle === 'pre') {
      var t = preTrame(p.activiteKey, p.os || '', p.oa || '');
      return { key: t.trame, family: t.family, label: TRAME_LABELS[t.trame] };
    }
    return { key: p.trameKey, family: p.trameKey, label: ELEM_TRAME_LABELS[p.trameKey] || '' };
  }

  // ---------- Rendu HTML ----------
  // Présentation du modèle manuscrit du porteur du projet
  // (ressources/fiches-modeles/GS/photos/modele-presentation/) :
  // en-tête encadré en 3 cases, libellés rouges soulignés, contenu bleu,
  // tableau Étapes | Tâches de l'enseignant | Tâches de l'enfant | Matériel | Tps.

  function frDate(iso) {
    if (!iso) return '';
    var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? m[3] + '-' + m[2] + '-' + m[1] : String(iso);
  }

  // Matériel de chaque étape : « / » quand l'étape n'en demande pas,
  // le matériel de la séance à la première manipulation, puis « Idem ».
  var NO_MAT = /^(Préalables|Révision|Rappel|Mise en situation|Vérification|Objectivation|Consolidation \/ synthèse|Retour au calme|Relaxation|Prise en main|Synthèse|Récapitulation|Validation|Identification du problème|Propositions|Appréciation|Choix|Réinvestissement|Compréhension|Imprégnation|Mise en projet|Détermination|Paramètres|Animation|Bilan|Toilette|Exercices préparatoires|Mise en train|Motivation|Comparaison)/;
  // Colonne étroite : le premier groupe d'objets (avant « ; »), coupé sur une virgule.
  // La liste complète figure à la ligne « Matériel » de la fiche.
  function shortMat(mat) {
    var first = String(mat).split(';')[0].replace(/^Par (enfant|groupe|binôme)\s*:\s*/i, '').trim();
    if (first.length <= 50) return ucFirst(first);
    var cut = first.slice(0, 50);
    var i = cut.lastIndexOf(', ');
    return ucFirst(i > 15 ? cut.slice(0, i) : cut.replace(/[\s,(]+\S*$/, ''));
  }
  function stepMaterials(steps, c, isPre) {
    var mat = c.mat ? shortMat(c.mat) : 'Matériel de la séance';
    var first = true;
    return steps.map(function (s) {
      if (/^Évaluation|^Réinvestissement \/ évaluation|^Contrôle/.test(s.name)) return isPre ? "Fiche d'activité, crayon" : 'Cahier, ardoise';
      if (/^Calcul mental/.test(s.name)) return 'Ardoises, craies';
      if (/^Consolidation$/.test(s.name)) return isPre ? "Fiche d'activité, crayon" : '/';
      if (/^À retenir|^Synthèse|^Institutionnalisation|^Synthèse \/ règle/.test(s.name)) return isPre ? '/' : 'Tableau, cahiers';
      if (/^Représentation graphique|^Entraînement guidé|^Écriture sur le cahier|^Premier jet/.test(s.name)) return 'Ardoises, craies, feuilles, crayons';
      if (/^Vécu corporel/.test(s.name)) return 'Craie (tracé au sol)';
      if (NO_MAT.test(s.name)) return '/';
      if (first) { first = false; return mat; }
      return 'Idem';
    });
  }

  function render(p) {
    var isPre = p.cycle === 'pre';
    var info = trameInfo(p);
    var osRaw = stripEnd(p.os);
    var c = {
      os: lcFirst(osRaw),
      cont: stripEnd(p.contenus),
      oa: p.oa,
      // Notion de la leçon précédente : saisie de l'enseignant, sinon OS + contenus précédents du guide
      prev: stripEnd(p.revision) || (p.prevOS ? stripEnd(p.prevOS) + (p.prevContenus ? ' : ' + lcFirst(stripEnd(p.prevContenus).replace(/\s*\([^)]*\)/g, '')) : '') : ''),
      prevOS: p.prevOS ? stripEnd(p.prevOS) : stripEnd(String(p.revision || '').split(/ : | \(/)[0]),
      act: shortAct(p.activiteLabel),
      mat: stripEnd(p.materiel),
      matShort: p.materiel ? shortMat(stripEnd(p.materiel)) : '',
      jeu: stripEnd(p.jeu),
      family: info.family,
      doE: learnersDo(osRaw) ? esc(learnersDo(osRaw)) : null
    };
    var steps = (isPre ? (PRE[info.key] || PRE.explicite) : (ELEM[info.key] || ELEM.langue))(c);
    var duree = Math.max(10, Math.min(180, parseInt(p.duree, 10) || 25));
    var mins = splitMinutes(steps.map(function (s) { return s.w; }), duree);
    var mats = stepMaterials(steps, c, isPre);

    var list = function (items) {
      return '<ul>' + items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
    };
    var rows = steps.map(function (s, i) {
      return '<tr>' +
        '<td class="fs-etape"><span>' + (i + 1) + '. ' + esc(s.name) + '</span></td>' +
        '<td>' + list(s.m) + '</td>' +
        '<td>' + list(s.e) + '</td>' +
        '<td class="fs-mat">' + esc(mats[i]) + '</td>' +
        '<td class="fs-tps">' + mins[i] + ' mn</td>' +
      '</tr>';
    }).join('');

    var lab = function (t) { return '<span class="f-lab">' + t + '</span>'; };

    var header =
      '<table class="f-head"><tbody><tr>' +
        '<td class="fh-left">' +
          '<div class="f-lab f-big">' + esc(p.niveauLabel) + '</div>' +
          '<div>' + lab('Durée :') + ' ' + duree + ' mn</div>' +
          '<div>' + lab('Période :') + ' ' + esc(TRIM[p.trimestre]) + '</div>' +
        '</td>' +
        '<td class="fh-center">' +
          '<div class="fh-title">Fiche pédagogique</div>' +
          '<div class="fh-act">' + esc(p.activiteLabel) + '</div>' +
        '</td>' +
        '<td class="fh-right">' +
          '<div>' + lab('Date :') + ' ' + esc(frDate(p.date) || '……………') + '</div>' +
          '<div>' + lab('Séance :') + ' N° ' + esc(p.numero || '……') + '</div>' +
        '</td>' +
      '</tr></tbody></table>';

    var idRows = [];
    var add = function (label, value, cls) {
      if (value) idRows.push('<tr><th><span class="f-lab">' + label + ' :</span></th><td' + (cls ? ' class="' + cls + '"' : '') + '>' + value + '</td></tr>');
    };
    var who = [];
    if (p.enseignant) who.push(esc(p.enseignant));
    if (p.ecole) who.push(esc(p.ecole));
    if (p.ief) who.push(esc(p.ief));
    if (!isPre && p.effectif) who.push('Effectif : ' + esc(p.effectif));
    add(isPre ? 'Enseignant(e)' : 'Enseignant(e)', who.join(' · '));
    add('Domaine', esc(p.domaineLabel) + (p.sousDomaine ? ' — ' + esc(p.sousDomaine) : ''));
    if (p.cbase) add('Compétence de base', esc(p.cbase));
    add('OA', esc(p.oa));
    add('OS', (isPre ? "Au terme de la séance, l'enfant devra être capable " : "À la fin de la séance, l'élève doit être capable ") + esc(de(c.os)) + '.', 'f-os');
    add('Contenus', esc(c.cont));
    if (isPre && (info.family === 'maths' || c.jeu)) add('Jeu(x) associé(s)', c.jeu ? esc(c.jeu) : '/');
    add('Matériel', c.mat ? esc(c.mat) : '……………………………………');

    var foot = [];
    if (!isPre) foot.push('<tr><th><span class="f-lab">Évaluation :</span></th><td>Consigne : ' + esc(ucFirst(c.os)) + '. Critères : pertinence, correction' + (/langue|lecture|production|expression|recitation/.test(info.key) ? ', cohérence' : '') + '.</td></tr>');
    foot.push('<tr><th><span class="f-lab">Remédiation :</span></th><td>' + (isPre
      ? "Reprendre l'activité en petit groupe, avec le même matériel, pour les enfants qui n'ont pas encore réussi."
      : "Repérer les erreurs, en chercher la cause avec l'élève, puis proposer un exercice ciblé en petit groupe.") + '</td></tr>');

    return '' +
      '<article class="fiche" id="ficheDoc">' +
        header +
        '<table class="f-id"><tbody>' + idRows.join('') + '</tbody></table>' +
        '<div class="fiche-scroll"><table class="f-steps"><thead><tr>' +
          '<th>Étapes</th><th>Tâches de l\'enseignant(e)</th>' +
          '<th>' + (isPre ? "Tâches de l'enfant" : "Tâches de l'élève") + '</th><th>Matériel</th><th>Tps</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<table class="f-id f-foot"><tbody>' + foot.join('') + '</tbody></table>' +
        '<p class="fiche-source">' + esc(info.label) + ' · ' + esc(p.source || '') + '</p>' +
      '</article>';
  }

  window.SUNU_FICHE = { render: render, trameInfo: trameInfo, learnersDo: learnersDo, splitMinutes: splitMinutes };
})();
