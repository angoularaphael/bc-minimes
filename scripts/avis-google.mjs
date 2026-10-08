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
   2. Sans clé — ou si l'appel échoue — il RETIRE l'agrégat du site.
      Le dernier relevé reste dans avis-google.json comme historique,
      mais une valeur historique n'est pas présentée comme actuelle.
   3. Après une réponse valide seulement, il publie la note dans les deux
      sources d'affichage. Le JSON-LD n'expose aucun aggregateRating : les
      avis auto-déclarés d'un LocalBusiness ne justifient pas ce balisage.

   GARDE-FOU. Une réponse invraisemblable est refusée, pas écrite : note
   hors de [1;5], ou nombre d'avis qui CHUTE de plus de 10 %. Google
   renvoie parfois une fiche voisine sur une recherche textuelle ; le
   script exige donc aussi l'adresse de la rue de Fenouillet.

   Usage : `npm run prebuild`.
   ===================================================================== */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "src", "avis-google.json");
const avis = JSON.parse(await readFile(SOURCE, "utf8"));
let verifieMaintenant = false;
const normaliser = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
    if (!p || typeof p.rating !== "number" || typeof p.userRatingCount !== "number")
      throw new Error("aucune fiche exploitable renvoyee");

    const note = p.rating;
    const n = p.userRatingCount;
    const plancher = Math.floor(avis.avis * 0.9);
    const adresse = normaliser(p.formattedAddress);
    if (note < 1 || note > 5) throw new Error(`note invraisemblable : ${note}`);
    if (n < plancher) throw new Error(`chute du nombre d'avis : ${avis.avis} -> ${n} (fiche voisine ?)`);
    if (!adresse.includes("fenouillet") || !adresse.includes("31200"))
      throw new Error("adresse renvoyee differente de la fiche Minimes");

    avis.note = note.toFixed(1).replace(".", ",");
    avis.avis = n;
    avis.releve_le = new Date().toISOString().slice(0, 10);
    avis.releve_par = "API Google Places (New), searchText";
    await writeFile(SOURCE, JSON.stringify(avis, null, 2) + "\n");
    verifieMaintenant = true;
    console.log(`[avis] Google dit ${avis.note}/5 sur ${avis.avis} avis — source a jour`);
  } catch (e) {
    console.warn(`[avis] Google injoignable ou reponse douteuse (${e.message}) — agrégat omis du site`);
  }
} else {
  console.log("[avis] pas de GOOGLE_PLACES_API_KEY — agrégat omis du site (aucune valeur périmée publiée)");
}

/* ---------- 2. publication uniquement si la source vient d'être vérifiée ---------- */
const notePublique = verifieMaintenant ? avis.note : "";
const nPublic = verifieMaintenant ? String(avis.avis) : "";

const ECRITURES = [
  // fichier                       , motif a remplacer                     , remplacement
  ["src/content.json",                /("rating":\s*")[^"]*(")/, `$1${notePublique}$2`],
  ["src/content.json",                /("count":\s*")[^"]*(")/,  `$1${nPublic}$2`],
  ["public/assets/js/data-argent.js", /(rating:\s*")[^"]*(")/,   `$1${notePublique}$2`],
  ["public/assets/js/data-argent.js", /(count:\s*")[^"]*(")/,    `$1${nPublic}$2`],
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
console.log(`[avis] agrégat ${verifieMaintenant ? "vérifié et publié" : "neutralisé"} dans ${touches} fichier(s)`);
