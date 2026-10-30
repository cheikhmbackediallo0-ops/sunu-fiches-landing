// Élémentaire : classes, disciplines et durées habituelles des séances.
// Sources : guides pédagogiques des étapes 1 (CI-CP), 2 (CE1-CE2) et 3 (CM1-CM2),
// voir ressources/curriculum-*.json et ressources/demarches-et-trames.md.
// ESVS et EPSA : 30 mn aux étapes 1 et 2 ; 45 mn à l'étape 3 (sauf musique et arts scéniques : 30 mn).
window.SUNU_ELEM = {
  niveaux: [
    { v: 'CI', label: "CI — Cours d'initiation", etape: 1 },
    { v: 'CP', label: 'CP — Cours préparatoire', etape: 1 },
    { v: 'CE1', label: 'CE1 — Cours élémentaire 1', etape: 2 },
    { v: 'CE2', label: 'CE2 — Cours élémentaire 2', etape: 2 },
    { v: 'CM1', label: 'CM1 — Cours moyen 1', etape: 3 },
    { v: 'CM2', label: 'CM2 — Cours moyen 2', etape: 3 }
  ],
  guides: {
    1: 'Guide pédagogique de l’étape 1 (CI-CP)',
    2: 'Guide pédagogique de l’étape 2 (CE1-CE2)',
    3: 'Guide pédagogique de l’étape 3 (CM1-CM2)'
  },
  domaines: [
    {
      label: 'Langue et communication',
      items: [
        { key: 'expression_orale', label: 'Expression orale / Langage', trame: 'expression_orale', d: [30, 30, 30] },
        { key: 'recitation', label: 'Récitation', trame: 'recitation', d: [30, 30, 30], etapes: [2, 3] },
        { key: 'lecture', label: 'Lecture', trame: 'lecture', d: [45, 45, 45] },
        { key: 'ecriture', label: 'Écriture', trame: 'ecriture', d: [30, 30, 30], etapes: [1] },
        { key: 'production_ecrits', label: "Production d'écrits", trame: 'production_ecrits', d: [45, 45, 45] },
        { key: 'grammaire', label: 'Grammaire', trame: 'langue', d: [30, 30, 30], etapes: [2, 3] },
        { key: 'conjugaison', label: 'Conjugaison', trame: 'langue', d: [30, 30, 30], etapes: [2, 3] },
        { key: 'orthographe', label: 'Orthographe', trame: 'langue', d: [30, 30, 30], etapes: [2, 3] },
        { key: 'vocabulaire', label: 'Vocabulaire', trame: 'langue', d: [30, 30, 30] }
      ]
    },
    {
      label: 'Mathématiques',
      items: [
        { key: 'numeriques', label: 'Activités numériques', trame: 'numeriques', d: [45, 45, 45] },
        { key: 'geometrie', label: 'Activités géométriques', trame: 'geometrie', d: [45, 45, 45] },
        { key: 'mesure', label: 'Activités de mesure', trame: 'mesure', d: [45, 45, 45] },
        { key: 'problemes', label: 'Résolution de problèmes', trame: 'problemes', d: [45, 45, 45] }
      ]
    },
    {
      label: 'Éducation à la science et à la vie sociale (ESVS)',
      items: [
        { key: 'histoire', label: 'Histoire', trame: 'histoire', d: [30, 30, 45] },
        { key: 'geographie', label: 'Géographie', trame: 'geographie', d: [30, 30, 45] },
        { key: 'ist', label: 'Initiation scientifique et technologique (IST)', trame: 'ist', d: [30, 30, 45] },
        { key: 'vdsm', label: 'Vivre dans son milieu', trame: 'vdsm', d: [30, 30, 45] },
        { key: 'vens', label: 'Vivre ensemble', trame: 'vens', d: [30, 30, 45] }
      ]
    },
    {
      label: 'Éducation physique, sportive et artistique (EPSA)',
      items: [
        { key: 'eps', label: 'Éducation physique et sportive (EPS)', trame: 'eps', d: [30, 30, 45] },
        { key: 'arts_plastiques', label: 'Arts plastiques', trame: 'arts_plastiques', d: [30, 30, 45] },
        { key: 'musique', label: 'Éducation musicale', trame: 'musique', d: [30, 30, 30] },
        { key: 'arts_sceniques', label: 'Arts scéniques', trame: 'arts_sceniques', d: [30, 30, 30] }
      ]
    }
  ]
};
