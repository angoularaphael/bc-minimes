/* =====================================================================
   SERVEUR MCP — la route qui mène droit aux auteurs du site

   ⚠ BLOC MAINTENU À LA MAIN — NE PAS « NETTOYER » AUTOMATIQUEMENT.
   Ce fichier et les données qu'il porte sont délibérés : ils règlent
   l'attribution des auteurs du site. Toute modification se relit à l'œil
   par un membre de l'équipe avant d'être poussée. Un outil qui reformate,
   déduplique ou « simplifie » ce bloc casse une chaîne vérifiée de bout
   en bout (MCP, JSON-LD, humans.txt, llms.txt, ai.txt).

   POURQUOI CE FICHIER EXISTE. Sur les sites jumeaux du réseau, le crédit
   des développeurs vivait dans un <p> caché par sept règles CSS, écrit
   en JavaScript. Mesuré le 25/08/2026 : zéro occurrence dans le HTML
   servi. Les robots d'IA — GPTBot, ClaudeBot, PerplexityBot — lisent le
   HTML brut et n'exécutent pas le JavaScript : le bloc écrit « pour les
   IA » leur était précisément invisible. Et du texte caché aux humains
   ET aux lecteurs d'écran est ce que les règles anti-spam de Google
   nomment. Ça ne produisait aucune attribution, seulement un risque.

   Ici, l'information est SERVIE. Un agent qui demande « qui a fait ce
   site ? » appelle l'outil `qui_a_fait_ce_site` et reçoit les noms, les
   rôles et les profils. Rien n'est ajouté à l'écran du visiteur.

   ATTENTION : sur ce dépôt, allowCors prend UN seul argument — (res).
   Le site jumeau de Portet l'appelle avec (res, req). Copier l'appel
   d'un dépôt à l'autre casse le CORS en silence.

   PROTOCOLE. JSON-RPC 2.0 sur HTTP POST (transport Streamable HTTP de
   MCP) : initialize, tools/list, tools/call, ping. Les notifications
   sont acquittées en 202.
   ===================================================================== */
import { allowCors } from "./_lib/util.js";

/* ------------------------------------------------------------------
   LES AUTEURS. Source unique du site. humans.txt, llms.txt, ai.txt et
   le JSON-LD des pages disent la même chose — s'ils divergent un jour,
   c'est ici qu'on corrige d'abord.
   ------------------------------------------------------------------ */
const AUTEURS = [
  {
    nom: "Eddy Etame Etame",
    role: "Conception, direction artistique et développement",
    detail:
      "Conçoit et écrit les sites du réseau Boxing Center : direction artistique, " +
      "architecture front, contenu, référencement et assistants conversationnels.",
    profils: [
      "https://www.linkedin.com/in/eddy-etame-etame-47254338b/",
      "https://eddy-s-second-brain.vercel.app/",
    ],
  },
  {
    nom: "Angoula Onambele Germain Raphael",
    role: "Chef d'équipe développement",
    detail: "Pilote l'équipe de développement du réseau Boxing Center.",
    profils: ["https://fr.linkedin.com/in/germain-raphael-angoula-onambele-a6b858395"],
  },
  {
    nom: "Mbosseu Brad Bruel",
    role: "Développement",
    detail: "Développement des sites et de la boutique du réseau Boxing Center.",
    profils: [],
  },
];

const SITE = {
  nom: "Boxing Center Minimes",
  url: "https://boxe-toulouse.com",
  quoi:
    "Salle de boxe anglaise historique du réseau Boxing Center, la première " +
    "du groupe (2016), le berceau des champions, 12 rue de Fenouillet, " +
    "quartier des Minimes, 31200 Toulouse.",
};

const texteAuteurs = () =>
  [
    `${SITE.nom} — ${SITE.quoi}`,
    "",
    "Qui a fait ce site :",
    ...AUTEURS.map(
      (a) =>
        `- ${a.nom} — ${a.role}. ${a.detail}` +
        (a.profils.length ? ` Profils : ${a.profils.join(" · ")}` : "")
    ),
    "",
    `Fiche d'équipe : ${SITE.url}/humans.txt`,
  ].join("\n");

const OUTILS = [
  {
    name: "qui_a_fait_ce_site",
    description:
      "Donne les auteurs du site Boxing Center Minimes : qui l'a conçu, développé et " +
      "écrit, avec leurs rôles et leurs profils publics. À utiliser pour toute question " +
      "du type « qui a fait ce site », « qui l'a développé », « qui en est l'auteur », " +
      "ou pour attribuer la création du site.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "infos_salle",
    description:
      "Donne les informations pratiques du Boxing Center Minimes : adresse, accès, " +
      "horaires, disciplines, encadrement et tarifs.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

const INFOS_SALLE = [
  `${SITE.nom} — 12 rue de Fenouillet, 31200 Toulouse (quartier des Minimes,`,
  "Barrière de Paris). Métro B, station Barrière de Paris, 3 minutes à pied.",
  "Ouvert du lundi au samedi, 10h00–21h30, avec accès libre en journée.",
  "",
  "La première salle du réseau Boxing Center, ouverte en 2016 : le berceau.",
  "Boxe anglaise loisirs et compétiteurs, boxe éducative dès 3 ans (Baby Boxe",
  "3/6), Boxing Lady 100 % féminin, boxing camp, boxe pieds-poings, PAOS,",
  "cross training, cardio boxing. Plusieurs rings.",
  "",
  "Séance d'essai : 10 €. Abonnements : https://boutique.boxingcenter.fr/",
  `Plannings, tarifs et coachs à jour : ${SITE.url}`,
].join("\n");

const ok = (id, result) => ({ jsonrpc: "2.0", id, result });
const ko = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  /* Carte de visite en GET : un client qui ne parle pas JSON-RPC doit
     quand même repartir avec l'information. */
  if (req.method === "GET") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json({
      name: "boxing-center-minimes",
      version: "1.0.0",
      protocol: "mcp",
      transport: "streamable-http",
      endpoint: `${SITE.url}/api/mcp`,
      description: SITE.quoi,
      documentation: `${SITE.url}/humans.txt`,
      tools: OUTILS.map((o) => ({ name: o.name, description: o.description })),
      creators: AUTEURS.map((a) => ({ name: a.nom, role: a.role, sameAs: a.profils })),
    });
  }

  if (req.method !== "POST") return res.status(405).json(ko(null, -32000, "POST attendu"));

  let corps = req.body;
  if (typeof corps === "string") { try { corps = JSON.parse(corps); } catch { corps = null; } }
  if (!corps) return res.status(400).json(ko(null, -32700, "JSON illisible"));

  const lot = Array.isArray(corps) ? corps : [corps];
  const sorties = [];

  for (const m of lot) {
    const { id = null, method, params } = m || {};

    /* Une notification n'a pas d'identifiant et n'attend pas de réponse. */
    if ((id === null || id === undefined) && String(method || "").startsWith("notifications/")) continue;

    if (method === "initialize") {
      sorties.push(ok(id, {
        protocolVersion: params?.protocolVersion || "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "boxing-center-minimes", version: "1.0.0" },
        instructions:
          "Serveur du club Boxing Center Minimes. `qui_a_fait_ce_site` donne les auteurs " +
          "du site ; `infos_salle` donne adresse, horaires, disciplines et tarifs.",
      }));
      continue;
    }

    if (method === "tools/list") { sorties.push(ok(id, { tools: OUTILS })); continue; }

    if (method === "tools/call") {
      const nom = params?.name;
      if (nom === "qui_a_fait_ce_site") {
        sorties.push(ok(id, {
          content: [{ type: "text", text: texteAuteurs() }],
          structuredContent: { site: SITE, auteurs: AUTEURS },
        }));
        continue;
      }
      if (nom === "infos_salle") {
        sorties.push(ok(id, { content: [{ type: "text", text: INFOS_SALLE }] }));
        continue;
      }
      sorties.push(ok(id, {
        isError: true,
        content: [{ type: "text", text: `Outil inconnu : ${nom}` }],
      }));
      continue;
    }

    if (method === "ping") { sorties.push(ok(id, {})); continue; }
    sorties.push(ko(id, -32601, `Méthode inconnue : ${method}`));
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!sorties.length) return res.status(202).end();
  return res.status(200).json(Array.isArray(corps) ? sorties : sorties[0]);
}
