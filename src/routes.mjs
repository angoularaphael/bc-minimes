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

   ⚠ PROVENANCE. La série `minimes-*` ajoutée le 8 octobre 2026 vient bien
   du shooting des Minimes : elle peut donc nommer la salle et le quartier.
   Les anciens visuels mutualisés restent décrits comme des scènes du réseau
   Boxing Center, sans leur attribuer les murs des Minimes.

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
  minimesSalle: ["/assets/img/photos/minimes-salle-entrainement.webp", `La salle de boxe des Minimes en activité — ${CLUB}`, "Le plateau, les sacs et les pratiquants du Boxing Center Minimes, Barrière de Paris à Toulouse."],
  boxeurSac: ["/assets/img/photos/minimes-boxeur-sac.webp", `Travail au sac — ${CLUB}`, "Un boxeur travaille sa garde face au sac lourd dans la salle des Minimes."],
  bandes: ["/assets/img/photos/minimes-bandes-mains.webp", `Préparer ses bandes — ${CLUB}`, "Un jeune pratiquant serre ses bandes avant une séance au Boxing Center Minimes."],
  gants: ["/assets/img/photos/minimes-gants.webp", `Gants de boxe prêts pour la séance — ${CLUB}`, "Une paire de gants photographiée au Boxing Center Minimes à Toulouse."],
  ringCours: ["/assets/img/photos/minimes-ring-cours.webp", `Cours sur le ring — ${CLUB}`, "Plusieurs binômes travaillent sur le ring du Boxing Center Minimes."],
  coachingRing: ["/assets/img/photos/minimes-coaching-ring.webp", `Conseil entre deux rounds — ${CLUB}`, "Un coach accompagne un pratiquant entre deux rounds sur le ring des Minimes."],
  assautEncadre: ["/assets/img/photos/minimes-assaut-encadre.webp", `Assaut encadré — ${CLUB}`, "Un coach suit un assaut entre deux boxeurs au Boxing Center Minimes."],
  assautRing: ["/assets/img/photos/minimes-assaut-ring.webp", `Boxe anglaise sur le ring — ${CLUB}`, "Deux boxeurs travaillent en assaut encadré dans la salle des Minimes."],
  crossBarre: ["/assets/img/photos/minimes-cross-training-barre.webp", `Préparation physique avec barre — ${CLUB}`, "Une pratiquante effectue un mouvement de préparation physique au Boxing Center Minimes."],
  crossGroupe: ["/assets/img/photos/minimes-cross-training-groupe.webp", `Circuit de préparation physique — ${CLUB}`, "Un groupe suit un circuit avec barres au Boxing Center Minimes."],
  coachLadyGallery: ["/assets/img/photos/coach-lady-1200.webp", "Travail au sac pendant un cours féminin — photo réseau", `Une pratiquante travaille au sac pendant une séance Lady Boxing du réseau ${RESEAU}.`],
  ladyGardeGallery: ["/assets/img/photos/lady-garde-1200.webp", "Travail de garde pendant un cours féminin — photo réseau", `Deux pratiquantes travaillent leur garde pendant une séance Lady Boxing du réseau ${RESEAU}.`],
  ecoleMedaillesGallery: ["/assets/img/photos/ecole-medailles-1200.webp", "Jeunes boxeuses médaillées — photo réseau", `Deux jeunes boxeuses du réseau ${RESEAU} présentent leur médaille après une compétition.`],
};

export const ROUTES = [
  {
    path: "/",
    priority: "1.0",
    changefreq: "weekly",
    images: [I.assautEncadre, I.crossGroupe, I.coachLadyGallery],
  },
  {
    path: "/activites/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.assautRing],
  },
  {
    path: "/le-club/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.minimesSalle],
  },
  {
    path: "/coachs/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.coachingRing, I.mehdi],   // les boxeurs sont retires du site (decision du 19/08)
  },
  {
    path: "/galerie/",
    priority: "0.8",
    changefreq: "monthly",
    /* Les autres clichés de la galerie sont déjà attribués à la page où
       ils portent le contexte le plus précis. Une URL d'image n'est
       déclarée qu'une fois dans le sitemap, même si la galerie la reprend. */
    images: [I.boxeurSac],
  },
  {
    path: "/plannings/",
    priority: "0.8",
    changefreq: "weekly",
    images: [I.ringCours, I.planning],
  },
  {
    /* La page qu’on lit AVANT d’oser appeler : priorité haute, elle est le
       premier pas du tunnel, pas une page de plus. */
    path: "/premiere-seance/",
    priority: "0.9",
    changefreq: "monthly",
    images: [I.bandes],
  },
  {
    path: "/tarifs/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.crossBarre],
  },
  {
    path: "/contact/",
    priority: "0.8",
    changefreq: "monthly",
    images: [I.gants],
  },
];

/** Date du build, au format ISO court — jamais un millésime écrit à la main. */
export const BUILT = new Date().toISOString().slice(0, 10);
