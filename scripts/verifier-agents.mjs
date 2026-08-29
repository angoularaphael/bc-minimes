/* =====================================================================
   BANC D'ESSAI — ce que les robots et les agents trouvent vraiment.

   On ne vérifie pas la SOURCE, on vérifie le RENDU : c'est lui qui part
   sur Vercel. Un fichier peut être parfait dans src/ et absent de dist/.

   Deux questions, et deux seulement :
     1. Un VISITEUR voit-il un nom d'auteur ? La réponse doit être NON,
        partout, toujours.
     2. GOOGLE et les IA le trouvent-ils ? La réponse doit être OUI, sur
        chacune des surfaces machine.

   Lancer :  node scripts/verifier-agents.mjs   (après un build)
   ===================================================================== */
import { readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RobotsTxt } from "./_robots.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RACINE, "dist");
const URL_SITE = "https://boxe-toulouse.com";

const EDDY = "Eddy Etame Etame";
const ANGOULA = "Angoula Onambele Germain Raphael";
const BRAD = "Mbosseu Brad Bruel";

let passes = 0;
let echecs = 0;
function dit(condition, quoi) {
  if (condition) {
    passes++;
    console.log(`  OK     ${quoi}`);
  } else {
    echecs++;
    console.log(`  ECHEC  ${quoi}`);
  }
}

const lire = (p) => readFile(join(DIST, p), "utf8");
const existe = (p) => access(join(DIST, p)).then(() => true, () => false);

/* Le texte que lit un ÊTRE HUMAIN : on retire les scripts, les styles et
   les commentaires, puis toutes les balises. Ce qui reste est ce qui
   s'affiche à l'écran. */
function texteVisible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ");
}

const PAGES = [
  "index.html",
  "activites/index.html",
  "coachs/index.html",
  "contact/index.html",
  "galerie/index.html",
  "le-club/index.html",
  "plannings/index.html",
  "premiere-seance/index.html",
  "tarifs/index.html",
];

console.log("\n─── 1. AUCUN VISITEUR NE VOIT DE CRÉDIT ───\n");

let vus = 0;
for (const p of PAGES) {
  if (!(await existe(p))) continue;
  const t = texteVisible(await lire(p));
  vus += (t.match(/Eddy|Mbosseu|eddy-s-second-brain|linkedin/gi) || []).length;
}
dit(vus === 0, `les ${PAGES.length} pages — zéro nom d'auteur dans le texte visible`);
dit(!(await existe("credits/index.html")), "aucune page /credits/");

let liens = 0;
for (const p of PAGES) {
  if (!(await existe(p))) continue;
  liens += ((await lire(p)).match(/href="\/credits\//g) || []).length;
}
dit(liens === 0, "aucun lien vers une page de crédits");

console.log("\n─── 2. GOOGLE ET LES IA LES TROUVENT ───\n");

/* Le JSON-LD schema.org `creator` : le canal documenté que Google lit
   pour attribuer un site. Invisible aux visiteurs par nature. */
let avecLd = 0;
for (const p of PAGES) {
  if (!(await existe(p))) continue;
  const h = await lire(p);
  if (h.includes(EDDY) && h.includes(ANGOULA) && h.includes(BRAD)) avecLd++;
}
dit(avecLd === PAGES.length, `JSON-LD creator — les 3 auteurs sur ${avecLd}/${PAGES.length} pages`);

for (const f of ["humans.txt", "llms.txt", "llms-full.txt", "ai.txt"]) {
  if (!(await existe(f))) { dit(false, `${f} — absent du rendu`); continue; }
  const t = await lire(f);
  dit(t.includes(EDDY) && t.includes(ANGOULA) && t.includes(BRAD), `${f} — les 3 auteurs`);
}

const hum = await lire("humans.txt");
dit(/linkedin\.com\/in\/eddy-etame-etame/.test(hum) && /eddy-s-second-brain/.test(hum),
    "humans.txt — LinkedIn et portfolio (surface machine, jamais une page)");

dit(await existe(".well-known/mcp.json"), "/.well-known/mcp.json — la carte du serveur MCP");
if (await existe(".well-known/mcp.json")) {
  const carte = JSON.parse(await lire(".well-known/mcp.json"));
  dit(carte.creators?.length === 3, "la carte MCP déclare 3 créateurs");
  dit(carte.endpoint === `${URL_SITE}/api/mcp`, "la carte MCP pointe la bonne adresse");
  dit(carte.tools?.some((t) => t.name === "qui_a_fait_ce_site"), "l'outil qui_a_fait_ce_site est annoncé");
}

for (const f of ["llms.txt", "ai.txt"]) {
  dit((await lire(f)).includes("/api/mcp"), `${f} — annonce le serveur MCP`);
}

console.log("\n─── 3. LE ROBOTS.TXT LAISSE PASSER CE QU'IL FAUT ───\n");

const robots = new RobotsTxt(await lire("robots.txt"));
const BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "OAI-SearchBot",
              "Google-Extended", "Googlebot", "anthropic-ai", "CCBot",
              "Applebot", "Bytespider", "meta-externalagent", "Amazonbot"];

for (const [chemin, attendu, quoi] of [
  ["/api/mcp", true, "le serveur MCP"],
  ["/.well-known/mcp.json", true, "la carte MCP"],
  ["/humans.txt", true, "la fiche d'équipe"],
  ["/llms.txt", true, "la fiche IA"],
  ["/tarifs/", true, "les pages du site"],
  ["/api/chat", false, "l'assistant reste fermé"],
  ["/admin/", false, "le backoffice reste fermé"],
  /* La page à 0 €. Le reste du réseau vend l'essai 10 €. Un moteur de
     réponse qui la lit répond « c'est gratuit », et le prospect ne paie
     plus l'essai sur aucune des cinq salles. */
  ["/seance-offerte/", false, "la page à 0 € reste FERMÉE (garde : elle n’existe plus)"],
]) {
  const rates = BOTS.filter((b) => robots.autorise(b, chemin) !== attendu);
  dit(rates.length === 0, `${chemin} — ${quoi} (12 robots)${rates.length ? " · rates: " + rates.join(",") : ""}`);
}

console.log(`\n  ${passes} passes / ${passes + echecs}${echecs ? `  —  ${echecs} ECHECS` : "  —  tout passe"}\n`);
process.exit(echecs ? 1 : 0);
