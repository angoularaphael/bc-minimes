/* =====================================================================
   MINIMES · scripts/avis-google.mjs — une seule vérité pour la note Google

   LE PROBLÈME, CONSTATÉ LE 21/08/2026. Le site annonçait 4,5 sur 155 avis.
   La fiche Google disait 4,3 sur 156. L'écart n'était pas une faute de
   frappe : le chiffre était recopié à la main dans QUATRE fichiers
   (content.json, data-argent.js, et deux fois dans index.astro). Dès
   qu'on en corrige un, les trois autres mentent.

   Une note gonflée n'est pas seulement fausse : un `aggregateRating`
   qui ne correspond pas à la source déclarée est précisément ce que
   Google sanctionne dans ses règles sur les données structurées.

   CE QUE FAIT CE SCRIPT, à chaque build, avant tout le reste :

   1. Si GOOGLE_PLACES_API_KEY est dans l'environnement, il demande à
      l'API Places (New) la note et le nombre d'avis du jour, et met
      src/avis-google.json à jour.
   2. Sans clé — ou si l'appel échoue — il garde la dernière valeur
      connue, celle qui est commitée. Le site reste juste ; il cesse
      seulement de se rafraîchir. Un build ne DOIT jamais échouer parce
      que Google est indisponible.
   3. Dans tous les cas, il répand la valeur dans les quatre endroits
      qui l'affichent. Personne n'a plus à les tenir à la main.

   GARDE-FOU. Une réponse invraisemblable est refusée, pas écrite : note
   hors de [1;5], ou nombre d'avis qui CHUTE de plus de 10 %. Google
   renvoie parfois une fiche voisine sur une recherche textuelle ; on
   préfère une valeur d'hier à une valeur d'à côté.

   Usage : `npm run prebuild`.
   ===================================================================== */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "src", "avis-google.json");
const avis = JSON.parse(await readFile(SOURCE, "utf8"));

/* ---------- 1. la note du jour, si on a le droit de la demander ---------- */
const CLE = process.env.GOOGLE_PLACES_API_KEY;
if (CLE) {
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": CLE,
        "X-Goog-FieldMask": "places.rating,places.userRatingCount,places.formattedAddress",
      },
      body: JSON.stringify({ textQuery: avis.requete, languageCode: "fr", regionCode: "FR" }),
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json();
    const p = j.places && j.places[0];
    if (!p || typeof p.rating !== "number") throw new Error("aucune fiche renvoyee");

    const note = p.rating;
    const n = p.userRatingCount;
    const plancher = Math.floor(avis.avis * 0.9);
    if (note < 1 || note > 5) throw new Error(`note invraisemblable : ${note}`);
    if (n < plancher) throw new Error(`chute du nombre d'avis : ${avis.avis} -> ${n} (fiche voisine ?)`);

    avis.note = note.toFixed(1).replace(".", ",");
    avis.avis = n;
    avis.releve_le = new Date().toISOString().slice(0, 10);
    avis.releve_par = "API Google Places (New), searchText";
    await writeFile(SOURCE, JSON.stringify(avis, null, 2) + "\n");
    console.log(`[avis] Google dit ${avis.note}/5 sur ${avis.avis} avis — source a jour`);
  } catch (e) {
    console.warn(`[avis] Google injoignable ou reponse douteuse (${e.message}) — on garde ${avis.note}/5 sur ${avis.avis} avis du ${avis.releve_le}`);
  }
} else {
  console.log(`[avis] pas de GOOGLE_PLACES_API_KEY — valeur figee : ${avis.note}/5 sur ${avis.avis} avis (releve du ${avis.releve_le})`);
}

/* ---------- 2. on repand la valeur partout où elle s'affiche ---------- */
const point = avis.note.replace(",", "."); // JSON-LD veut un point decimal
const n = String(avis.avis);

const ECRITURES = [
  // fichier                       , motif a remplacer                     , remplacement
  ["src/content.json",             /("rating":\s*")[^"]*(")/,              `$1${avis.note}$2`],
  ["src/content.json",             /("count":\s*")[^"]*(")/,               `$1${n}$2`],
  ["public/assets/js/data-argent.js", /(rating:\s*")[^"]*(")/,             `$1${avis.note}$2`],
  ["public/assets/js/data-argent.js", /(count:\s*")[^"]*(")/,              `$1${n}$2`],
  ["src/pages/index.astro",        /("ratingValue":\s*")[^"]*(")/,         `$1${point}$2`],
  ["src/pages/index.astro",        /("reviewCount":\s*")[^"]*(")/,         `$1${n}$2`],
  ["src/pages/index.astro",        /(data-rating=")[^"]*(")/g,             `$1${point}$2`],
  ["src/pages/index.astro",        /(data-rating-count=")[^"]*(")/g,       `$1${n}$2`],
  // meta description — optionnel : un changement de texte SERP ne doit pas casser le build
  ["src/pages/index.astro",        /\d,\d\/5 sur [\d\s\u202f]+ avis/,          `${avis.note}/5 sur ${n} avis`, { optional: true }],
];

const tampon = new Map();
for (const [rel, motif, rempl, opts = {}] of ECRITURES) {
  const f = join(ROOT, rel);
  if (!tampon.has(f)) tampon.set(f, await readFile(f, "utf8"));
  const avant = tampon.get(f);
  motif.lastIndex = 0;
  if (!motif.test(avant)) {
    if (opts.optional) {
      console.warn(`[avis] motif optionnel absent dans ${rel} : ${motif} — on continue`);
      continue;
    }
    console.error(`[avis] motif introuvable dans ${rel} : ${motif} — le fichier a change de forme`);
    process.exit(1);
  }
  motif.lastIndex = 0;
  tampon.set(f, avant.replace(motif, rempl));
}
let touches = 0;
for (const [f, t] of tampon) { await writeFile(f, t); touches++; }
console.log(`[avis] ${avis.note}/5 sur ${n} avis ecrit dans ${touches} fichier(s)`);
