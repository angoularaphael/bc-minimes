import { SITE } from "../routes.mjs";

/* Les moteurs classiques et les moteurs génératifs sont traités pareil :
   les faits publics de la salle sont faits pour être lus et cités. Ce
   qui est refusé l'est parce que ce n'est pas du contenu — le backoffice
   et les fonctions serveur, jamais une page de la salle. */
const CRAWLERS = [
  ["Googlebot", "Moteurs de recherche"],
  ["Googlebot-Image", null],
  ["Google-InspectionTool", null],
  ["Bingbot", null],
  ["DuckDuckBot", null],
  ["Qwantify", null],
  ["Applebot", null],
  ["GPTBot", "Bots IA / moteurs génératifs — bienvenus sur les faits publics de la salle"],
  ["OAI-SearchBot", null],
  ["ChatGPT-User", null],
  ["ClaudeBot", null],
  ["Claude-User", null],
  ["Claude-Web", null],
  ["Claude-SearchBot", null],
  ["anthropic-ai", null],
  ["PerplexityBot", null],
  ["Perplexity-User", null],
  ["Google-Extended", null],
  ["Applebot-Extended", null],
  ["CCBot", null],
  ["Bytespider", null],
  ["Amazonbot", null],
  ["meta-externalagent", null],
  ["FacebookBot", null],
  ["cohere-ai", null],
  ["YouBot", null],
  ["Diffbot", null],
  ["Timpibot", null],
];

export function GET() {
  const blocs = CRAWLERS.map(([ua, titre]) =>
    `${titre ? `\n# ${titre}\n` : ""}User-agent: ${ua}\nAllow: /api/mcp\nDisallow: /admin/\nDisallow: /api/\nDisallow: /seance-offerte\nAllow: /\n`
  ).join("");

  const body = `# Boxing Center Minimes — robots.txt
# Salle de boxe historique · Barrière de Paris, Toulouse 31200
# Faits machine-lisibles : /llms.txt et /llms-full.txt

User-agent: *
# ORDRE VOLONTAIRE : les Disallow AVANT le « Allow: / ». RFC 9309 §2.2.2
# fait gagner la regle la plus specifique, donc Google et Anthropic
# bloquent quel que soit l'ordre — mais un parseur en premier-match voit
# « Allow: / » et ouvre tout. Ainsi ecrit, le fichier est juste pour les
# deux familles de parseurs.
#
# Le serveur MCP reste ouvert : c'est la carte des auteurs du site, elle
# doit etre lisible. « /api/mcp » bat « /api/ » par la longueur.
Allow: /api/mcp
# Le backoffice et les fonctions serveur ne sont pas du contenu :
# ils ne s'indexent pas (doublé d'un meta robots et d'un X-Robots-Tag).
Disallow: /admin/
Disallow: /api/
# /seance-offerte : LA PAGE N'EXISTE PLUS SUR CE SITE. L'essai gratuit
# vit uniquement sur sa page dediee, qu'on n'atteint que par QR code et
# par les campagnes. Cette regle reste comme GARDE : le jour ou quelqu'un
# recree la page sans connaitre cette histoire, elle est fermee d'office.
# Le reseau vend l'essai 10 EUR ; un moteur de reponse qui lirait une
# page a 0 EUR ferait tomber ce prix sur les cinq salles.
Disallow: /seance-offerte
Allow: /
${blocs}
# Instructions pour les agents IA : /ai.txt
# Fiche structurée LLM : /llms.txt  ·  version longue : /llms-full.txt
Sitemap: ${SITE}/sitemap.xml
LLMs-Txt: ${SITE}/llms.txt
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
