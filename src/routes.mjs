/* =====================================================================
   Les routes indexables, en un seul endroit.

   Le sitemap ET le robots.txt sont fabriqués au build à partir de cette
   table : plus de date recopiée à la main dans un fichier inerte, plus
   de risque qu’une page nouvelle existe sans être déclarée, et le
   <lastmod> se remet à jour tout seul à chaque publication.

   Une page qui ne doit pas être indexée n’est PAS dans cette liste —
   /admin/ (le backoffice) et /api/ sont refusés en clair dans robots.txt,
   en plus du meta robots de la page et de l’en-tête X-Robots-Tag.
   ===================================================================== */

export const SITE = "https://boxe-toulouse.com";

/* ---------------------------------------------------------------------
   L'INVENTAIRE DES PHOTOS.

   Les visuels du site sont posés en fonds CSS et en grilles peintes par le
   JavaScript. Google Images n'indexe QUE ce qu'il voit dans le HTML : une
   photo en `background-image` ne rapporte rien. Le sitemap d'images est la
   seule déclaration officielle qui les rattrape — et il n'en portait qu'UNE
   par page, la même répétée à deux endroits.

   ⚠ CE QUE CES LÉGENDES N'ONT PAS LE DROIT DE DIRE. Les photos de cours
   sont, à ce jour, le pool Boxing Center servi en placeholder depuis
   Portet — data-galerie.js le déclare noir sur blanc et attend le shooting
   des Minimes. Une légende qui écrirait « la salle des Minimes » ou
   « Barrière de Paris » sur ces fichiers serait FAUSSE, et une légende
   fausse dans un sitemap est pire qu'une absence : c'est un club qui ment
   à Google sur ses propres murs. Les légendes décrivent donc l'ACTIVITÉ et
   le club (Boxing Center, Toulouse), jamais la pièce. Le jour du shooting,
   elles pourront nommer la salle — pas avant.

   Seuls les découpages de Mehdi et des boxeurs sont bien d'ici : eux
   peuvent porter le nom de la salle.

   Une seule taille par visuel : déclarer `planning-2026` ET
   `planning-2026-full`, c'est mettre la même affiche en concurrence
   avec elle-même.
   --------------------------------------------------------------------- */
const CLUB = "Boxing Center Minimes";
const RESEAU = "Boxing Center, Toulouse";
const I = {
  anglaise1: ["/assets/img/bc/anglaise-1.webp", "Boxe anglaise sur le ring — Boxing Center", `Cours de boxe anglaise sur le ring — ${RESEAU}. La boxe anglaise est au programme du ${CLUB}.`],
  anglaise2: ["/assets/img/bc/anglaise-2.webp", "Garde et déplacements en boxe anglaise — Boxing Center", `Travail de garde et de déplacements en boxe anglaise — ${RESEAU}.`],
  anglaise3: ["/assets/img/bc/anglaise-3.webp", "Un round d'assaut entre les cordes — Boxing Center", `Assaut encadré sur le ring — ${RESEAU}. Le sparring est facultatif et ne s'impose jamais.`],
  anglaise4: ["/assets/img/bc/anglaise-4.webp", "Frappe au sac lourd — Boxing Center", `Séance de frappe au sac lourd — ${RESEAU}.`],
  salle:     ["/assets/img/bc/salle-1.webp", "Entre les cordes — Boxing Center", `Le ring, les sacs et le plateau d'une salle du réseau ${RESEAU}.`],
  training1: ["/assets/img/bc/training-1.webp", "Cardio boxing — Boxing Center", `Cours de cardio boxing, sans opposition, tous niveaux — ${RESEAU}. Au programme du ${CLUB}.`],
  training2: ["/assets/img/bc/training-2.webp", "Travail aux pattes d'ours — Boxing Center", `Le coach corrige la technique aux pattes d'ours — ${RESEAU}.`],
  cross:     ["/assets/img/bc/cross-1.webp", "Cross training — Boxing Center", `Cours de cross training — ${RESEAU}. Compris dans l'abonnement du ${CLUB}.`],
  lady1:     ["/assets/img/bc/lady-1.webp", "Lady Boxing, le cours 100 % femmes — Boxing Center", `Le cours Lady Boxing, réservé aux femmes — ${RESEAU}. Au programme du ${CLUB}.`],
  lady2:     ["/assets/img/bc/lady-2.webp", "Frappe au sac en Lady Boxing — Boxing Center", `Séance Lady Boxing au sac — ${RESEAU}.`],
  educative: ["/assets/img/bc/educative-1.webp", "Boxe éducative pour les enfants — Boxing Center", `L'école de boxe : apprendre à boxer sans prendre de coups — ${RESEAU}. Au programme du ${CLUB}.`],
  niveaux:   ["/assets/img/bc/levels-1.webp", "Tous les niveaux sur le même plateau — Boxing Center", `Débutants et compétiteurs s'entraînent côte à côte — ${RESEAU}.`],
  mehdi:     ["/assets/img/bc/cutouts/coach-mehdi.webp", `Mehdi, coach principal du ${CLUB}`, "Mehdi dirige la salle des Minimes, Barrière de Paris à Toulouse."],
  planning:  ["/assets/img/bc/planning-2026-full.webp", `Planning officiel des cours — ${CLUB}`, "Le planning 2026 des cours de la salle des Minimes, Barrière de Paris."],
};

export const ROUTES = [
  {
    path: "/",
    priority: "1.0",
    changefreq: "weekly",
    images: [I.anglaise1, I.salle, I.training2, I.niveaux],
  },
  {
    path: "/activites/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.anglaise1, I.training1, I.cross, I.lady1, I.educative, I.training2],
  },
  {
    path: "/le-club/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.salle, I.anglaise3, I.niveaux],
  },
  {
    path: "/coachs/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.mehdi],   // les boxeurs sont retires du site (decision du 19/08)
  },
  {
    path: "/galerie/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.niveaux, I.anglaise2, I.anglaise3, I.anglaise4, I.lady2, I.educative, I.cross, I.training1, I.salle],
  },
  {
    path: "/plannings/",
    priority: "0.8",
    changefreq: "weekly",
    images: [I.planning],
  },
  {
    /* La page qu’on lit AVANT d’oser appeler : priorité haute, elle est le
       premier pas du tunnel, pas une page de plus. */
    path: "/premiere-seance/",
    priority: "0.9",
    changefreq: "monthly",
    images: [I.training2, I.salle, I.mehdi],
  },
  {
    path: "/tarifs/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.cross, I.salle],
  },
  {
    path: "/contact/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.training1],
  },
];

/** Date du build, au format ISO court — jamais un millésime écrit à la main. */
export const BUILT = new Date().toISOString().slice(0, 10);
