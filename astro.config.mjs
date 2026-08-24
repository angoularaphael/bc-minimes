import { defineConfig } from 'astro/config';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILT } from './src/routes.mjs';

/* =====================================================================
   LE GRAPHE PASSE AU CONTRÔLE — intégration de build.

   Trois choses que personne ne doit plus faire à la main :

   1. LA DATE. `dateModified` était recopiée en dur dans les 8 pages
      (« 2026-07-19 »). Une date écrite dans du markup inerte est une
      copie périssable : au premier contenu modifié elle ment, et elle
      ment à un moteur qui s'en sert pour juger la fraîcheur. Les pages
      écrivent maintenant le jeton @BUILT@, remplacé ici par la MÊME
      date que le <lastmod> du sitemap. Les deux ne peuvent plus diverger.

   2. LE POIDS. Le graphe est écrit indenté dans src/ — c'est ce qui le
      rend relisible par un humain. Il n'a aucune raison de voyager
      comme ça : `JSON.parse` puis `JSON.stringify` sort le même graphe,
      strictement, sans un blanc. Mesuré : 79 503 → 51 645 octets sur
      les 8 pages, soit 27 858 octets de retassés pour zéro perte.

   3. LA VALIDITÉ. Comme on parse pour minifier, un graphe cassé fait
      TOMBER LE BUILD au lieu de partir en ligne. Et on vérifie en même
      temps qu'aucun @id ne pend : un nœud référencé qui n'est défini
      nulle part, c'est un graphe qui se lit à moitié.
   ===================================================================== */
const LD = /<script([^>]*application\/ld\+json[^>]*)>([\s\S]*?)<\/script>/g;

async function pagesHtml(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await pagesHtml(p, out);
    else if (extname(e.name) === '.html') out.push(p);
  }
  return out;
}

function graphe() {
  return {
    name: 'bc-graphe-json-ld',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const racine = fileURLToPath(dir);
        let brut = 0, net = 0, blocs = 0, total = 0;
        const pendants = [];

        for (const fichier of await pagesHtml(racine)) {
          const html = await readFile(fichier, 'utf8');
          /* ⚠ PAR PAGE, PAS EN CUMUL. Le graphe d'une page doit se tenir
             SEUL : un moteur ne lit pas les 8 pages avant de résoudre un
             @id. Un relevé global masquait le défaut — l'accueil pouvait
             pointer sur un nœud défini seulement chez le voisin, et le
             contrôle passait au vert. Chaque page a donc son propre jeu. */
          const definis = new Set(), references = [];
          let casse = null;
          const sortie = html.replace(LD, (tout, attrs, corps) => {
            const source = corps.replace(/@BUILT@/g, BUILT);
            let graphe;
            try { graphe = JSON.parse(source); }
            catch (e) { casse = `${fichier} — ${e.message}`; return tout; }
            /* Un nœud qui porte un @type DÉFINIT ; un nœud réduit à son
               @id RÉFÉRENCE. */
            (function marcher(n) {
              if (Array.isArray(n)) return n.forEach(marcher);
              if (!n || typeof n !== 'object') return;
              if (n['@id']) { if (n['@type']) definis.add(n['@id']); else references.push(n['@id']); }
              for (const k of Object.keys(n)) if (k !== '@id') marcher(n[k]);
            })(graphe);
            const compact = JSON.stringify(graphe);
            brut += corps.length; net += compact.length; blocs++;
            return `<script${attrs}>${compact}</script>`;
          });
          if (casse) throw new Error(`JSON-LD invalide : ${casse}`);
          references.forEach((id) => { if (!definis.has(id)) pendants.push([fichier, id]); });
          total += definis.size;
          if (sortie !== html) await writeFile(fichier, sortie);
        }

        if (pendants.length) {
          throw new Error(
            '@id référencé mais jamais défini DANS SA PAGE :\n' +
            pendants.map(([f, id]) => `  ${f} → ${id}`).join('\n')
          );
        }
        logger.info(
          `JSON-LD : ${blocs} graphes valides, ${total} @id définis, 0 pendant · ` +
          `${brut} → ${net} octets (−${brut - net}) · dateModified = ${BUILT}`
        );
      },
    },
  };
}

export default defineConfig({
  site: 'https://boxe-toulouse.com',
  trailingSlash: 'always',
  /* Le HTML sort compressé : ~2 ko brut de blancs par page, sur 9 pages,
     pour zéro perte à l'écran. Les blocs <script>/<pre> ne sont pas
     touchés par Astro, la lisibilité du source reste dans src/. */
  compressHTML: true,
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [graphe()],
});
