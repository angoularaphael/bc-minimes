/* =====================================================================
   MINIMES · scripts/garde-offres.mjs — aucun lien vers une offre retirée

   Le 19/10/2026 au soir, les deux offres de la rentrée quittent la
   boutique, et leurs fiches avec elles. Un lien oublié dans une page,
   une donnée, le plan du site ou une réponse de l'assistant enverrait
   le visiteur sur une adresse morte, au moment exact où il voulait
   s'inscrire.

   Ce garde lit TOUT dist/ (HTML, JS, CSS, txt, json, xml) APRÈS la
   cuisson des pages, et fait tomber le build s'il y trouve l'une de ces
   adresses ou l'un de ces produits. Les motifs sont assemblés en
   morceaux : une recherche dans les sources ne tombe que sur ce qui est
   vraiment publié, jamais sur ce garde.

   Usage : dernier maillon de `npm run postbuild`.
   ===================================================================== */
import { readdir, readFile } from "node:fs/promises";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const TEXTE = new Set([".html", ".js", ".mjs", ".css", ".txt", ".json", ".xml", ".webmanifest"]);

const O = "/offre";
const INTERDITS = [
  [new RegExp(O + "/29\\b"), "la fiche de l'offre à 29"],
  [new RegExp(O + "/259\\b"), "la fiche de l'offre à 259"],
  [new RegExp(O + "s-" + "speciales\\b"), "la page des offres spéciales"],
  [new RegExp("product=offre-" + "(?:duo|saison)\\b"), "un produit d'offre retiré"],
  [new RegExp("/api" + O + "-rentree/"), "le compteur de places de la rentrée"],
];

async function fichiers(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await fichiers(p, out);
    else if (TEXTE.has(extname(e.name))) out.push(p);
  }
  return out;
}

const fautes = [];
const liste = await fichiers(DIST);
for (const f of liste) {
  const texte = await readFile(f, "utf8");
  for (const [re, nom] of INTERDITS) if (re.test(texte)) fautes.push(`${relative(DIST, f)} : ${nom}`);
}
if (fautes.length) {
  console.error("[offres] lien vers une offre retirée — rien ne part en ligne :\n  " + fautes.join("\n  "));
  process.exit(1);
}
console.log(`[offres] ${liste.length} fichiers de dist/ relus : aucun lien vers une offre retirée`);
