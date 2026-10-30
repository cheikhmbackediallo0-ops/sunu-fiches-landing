// Construit assets/js/data-prescolaire.js à partir des transcriptions des guides officiels
// PS, MS et GS (ressources/guides-officiels/prescolaire/*.md).
// Usage : node scripts/build-prescolaire-data.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'ressources', 'guides-officiels', 'prescolaire');
const OUT = join(root, 'assets', 'js', 'data-prescolaire.js');

const FILES = {
  PS: 'guide-petite-section-2024.md',
  MS: 'guide-moyenne-section-2024.md',
  GS: 'guide-grande-section-2024.md'
};

const DOMAINES = {
  1: 'Langue et communication',
  2: 'Mathématiques',
  3: 'Découverte du monde',
  4: 'Développement socio-affectif et bien-être global',
  5: 'Éducation psychomotrice et artistique'
};

// Nom de l'activité dans le guide -> clé + libellé + durée par défaut (mn)
const ACTIVITES = [
  { re: /^LANGAGE/, key: 'langage', label: 'Langage' },
  { re: /^CONTE/, key: 'conte', label: 'Conte' },
  { re: /^VOCABULAIRE/, key: 'vocabulaire', label: 'Vocabulaire' },
  { re: /^LECTURE/, key: 'lecture', label: 'Lecture' },
  { re: /^GRAPHISME/, key: 'graphisme', label: 'Graphisme / Écriture' },
  { re: /^ACTIVITÉS NUMÉRIQUES/, key: 'numeriques', label: 'Activités numériques' },
  { re: /^ACTIVITÉS GÉOMÉTRIQUES/, key: 'geometrie', label: 'Activités géométriques' },
  { re: /^ACTIVITÉS DE MESURE/, key: 'mesure', label: 'Activités de mesure' },
  { re: /^INITIATION SCIENTIFIQUE/, key: 'ist', label: 'Initiation scientifique et technologique (IST)' },
  { re: /^HYGIÈNE/, key: 'hygiene', label: 'Hygiène et bien-être' },
  { re: /^ÉDUCATION AUX VALEURS/, key: 'valeurs', label: 'Éducation aux valeurs morales et civiques' },
  { re: /^ÉDUCATION ENVIRONNEMENTALE/, key: 'environnement', label: 'Éducation environnementale' },
  { re: /^PSYCHOMOTRICITÉ/, key: 'psychomotricite', label: 'Psychomotricité' },
  { re: /^ARTS MUSICAUX/, key: 'arts_musicaux', label: 'Arts musicaux et scéniques' },
  { re: /^ARTS PLASTIQUES/, key: 'arts_plastiques', label: 'Arts plastiques' }
];

const clean = (s) => s
  .replace(/\*\*/g, '')
  .replace(/(^|[\s(])\*([^*]+)\*/g, '$1$2')
  .replace(/\s+/g, ' ')
  .trim();

function trimestresOf(periode) {
  const p = periode.toLowerCase();
  if (p.includes("toute l'année") || p.includes('toute l’année')) return [1, 2, 3];
  const t = [];
  if (p.includes('oct')) t.push(1);
  if (p.includes('jan')) t.push(2);
  if (p.includes('avr')) t.push(3);
  return t;
}

function parse(section, text) {
  const lines = text.split(/\r?\n/);
  const acts = {};
  let domaine = null, sousDomaine = null, act = null, cols = null;
  let periode = null, oa = null, last = null;

  for (const line of lines) {
    let m;
    if ((m = line.match(/^## (\d)\. DOMAINE/))) { domaine = Number(m[1]); sousDomaine = null; act = null; continue; }
    if (/^## /.test(line)) { domaine = null; act = null; continue; }
    if ((m = line.match(/^### Sous-domaine \d+ — ([^(]+)/))) { sousDomaine = clean(m[1]); continue; }

    if ((m = line.match(/^#### (?:Sous-domaine \d+ — ([^·]+)· )?Activité(?: \d+)? : (.+)$/))) {
      if (m[1]) sousDomaine = clean(m[1]);
      const name = m[2].replace(/\(p\.[^)]*\)/g, '').trim();
      const def = ACTIVITES.find(a => a.re.test(name));
      if (!def) throw new Error(`${section} : activité inconnue « ${name} »`);
      act = acts[def.key] = {
        label: def.label,
        domaine: domaine,
        sousDomaine: sousDomaine,
        cbase: '', materiel: '', ressources: '', rows: []
      };
      cols = null; periode = null; oa = null; last = null;
      continue;
    }
    if (!act) continue;

    if ((m = line.match(/^\*\*Compétence de base :\*\*\s*(.+)$/)) && !act.cbase) { act.cbase = clean(m[1]); continue; }
    if ((m = line.match(/\*\*Matériel :\*\*\s*([^·]+)/)) && !act.materiel) act.materiel = clean(m[1]);
    if ((m = line.match(/\*\*Ressources :\*\*\s*([^·]+)/)) && !act.ressources) act.ressources = clean(m[1]);

    // Variante (IST de la PS) : un titre de période en gras puis un tableau OA | OS | Contenus
    if ((m = line.match(/^\*\*((?:Oct|Jan|Avr)[^*]*)\*\*\s*$/))) { periode = m[1]; oa = null; continue; }

    if (/^\| (Période|OA) \|/.test(line)) {
      cols = line.split('|').slice(1, -1).map(c => clean(c));
      continue;
    }
    if (cols && /^\|---/.test(line)) continue;
    if (cols && /^\|/.test(line)) {
      const cells = line.split('|').slice(1, -1).map(c => clean(c));
      const get = (name) => cells[cols.indexOf(name)] || '';
      if (get('Période')) periode = get('Période');
      if (get('OA')) oa = get('OA');
      const os = get('OS');
      const contenus = get('Contenus');
      if (!os) { if (last && contenus) last.contenus += ' ; ' + contenus; continue; }
      const t = trimestresOf(periode || '');
      if (!t.length) throw new Error(`${section}/${act.label} : période illisible « ${periode} »`);
      last = { t, oa, os, contenus };
      act.rows.push(last);
      continue;
    }
    if (cols && !/^\|/.test(line)) cols = null;
  }
  return acts;
}

const data = { source: 'Guides officiels de la Petite, Moyenne et Grande Section (MEN Sénégal, version révisée 2024)', domaines: DOMAINES, ordre: ACTIVITES.map(a => a.key), sections: {} };
const LABELS = { PS: 'Petite Section', MS: 'Moyenne Section', GS: 'Grande Section' };

for (const [section, file] of Object.entries(FILES)) {
  const acts = parse(section, readFileSync(join(SRC, file), 'utf8'));
  data.sections[section] = { label: LABELS[section], activites: acts };
  const counts = Object.entries(acts).map(([k, a]) => `${k}:${a.rows.length}`).join(' ');
  console.log(section, Object.keys(acts).length, 'activités —', counts);
  for (const key of data.ordre) if (!acts[key]) console.warn(`  ⚠ ${section} : activité manquante ${key}`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT,
  '// Fichier généré par scripts/build-prescolaire-data.mjs — ne pas modifier à la main.\n' +
  '// Planification officielle OA / OS / contenus des 3 trimestres, par section et par activité.\n' +
  'window.SUNU_PRESCO = ' + JSON.stringify(data, null, 1) + ';\n');
console.log('Écrit :', OUT);
