/* =====================================================================
   BOXING CENTER — MINIMES · "LE BERCEAU"
   Content source of truth (maquette).
   Kept as a plain ES module so the team can map it 1:1 onto Astro/Next
   content collections or props. NOTHING here is hard-coded in markup that
   repeats — the JS renders these into the page.  Swap values freely.
   ===================================================================== */

export const SALLE = {
  id: "minimes",
  name: "Boxing Center Minimes",
  short: "Minimes",
  baseline: "Le berceau des champions.",
  district: "Barrière de Paris · Les Minimes",
  since: 2016,                       // Boxing Center créé le 01/09/2016 ; Minimes = 1re salle du groupe

  address: {
    street: "12 rue de Fenouillet",
    zip: "31200",
    city: "Toulouse",
    full: "12 rue de Fenouillet, 31200 Toulouse",
  },
  access: [
    "Métro ligne B — station Barrière de Paris (3 min à pied)",
    "Rocade — sortie 31, direction Les Minimes",
    "Bus 70 / 27 — arrêt Minimes-Roquelaine",
  ],
  phone: "05 62 24 46 82",
  phoneHref: "+33562244682",
  email: "boxingcenter31@gmail.com",
  hours: "Lun – Sam · 10h00 – 21h30",
  hoursData: [
    { d: "Lundi – Vendredi", h: "10h00 – 21h30" },
    { d: "Samedi", h: "10h00 – 21h30" },
    { d: "Dimanche", h: "Fermé" },
  ],
  federations: ["FFBoxe", "FFKMDA", "FMMAF"],
  mapsUrl:
    "https://www.google.com/maps?q=12%20rue%20de%20Fenouillet%2031200%20Toulouse&output=embed",
  mapsLink:
    "https://maps.google.com/?q=12+rue+de+Fenouillet+31200+Toulouse",
};

/* Anti-péremption : toute mention de saison passe par ces constantes,
   jamais de date en dur dans une page — <title>/description/og compris.
   (STANDARDS §0.3 + §4) */
export const SEASON = "2026-2027";
export const SEASON_LABEL = "Saison 2026 — 2027";

/* Libellés CTA — DEUX, pour tout le site, pour toujours (STANDARDS §1).
   `chrome` = nav / footer / menu · `primary` = tout CTA principal en page.
   ⚠ Ne PAS inventer une 3e formulation. */
export const CTA = {
  chrome: "Ma place · 29€",
  primary: "Je profite de l’offre à 29€",
  /* Le CTA de repli, celui qu'on propose à qui hésite encore. Il porte
     SON prix, pour qu'aucun bouton du site n'annonce un tarif différent
     de la page où il mène. */
  second: "Tester une séance · 10€",
};

/* ⚠ LA DESTINATION DES CTA — corrigé à la refonte, après mesure.
   Le bouton de la barre de navigation — présent sur les 10 pages, donc le
   plus cliqué du site — affichait « Ma place · 29€ » et pointait vers
   LINKS.essai, c'est-à-dire la page de la séance d'essai à 10 €. Le
   commentaire de LINKS.essai disait pourtant déjà « jamais en tête ».
   Le visiteur lisait un prix, cliquait, en trouvait un autre : c'est la
   fuite de conversion la plus chère qu'un site puisse s'offrir.
   Trois libellés identiques menaient par ailleurs à trois URL distinctes
   (/inscription?product=offre-duo, /offre/29, /offre/259, /seance-essai).
   RÈGLE : un libellé = une destination. Elles vivent ici, et nulle part
   ailleurs. Toute page qui écrit une URL box-plus en dur la viole. */
export const CTA_HREF = {
  /* l'offre de rentrée à 29 € — la destination de TOUT bouton « ma place » */
  primary: "https://boutique.boxingcenter.fr/inscription?product=offre-duo&step=1&utm_source=site&utm_medium=cta&utm_campaign=bc-minimes",
  /* la séance d'essai à 10 € — la destination de TOUT bouton « essai » */
  second: "https://boutique.boxingcenter.fr/seance-essai?utm_source=site&utm_medium=cta&utm_campaign=bc-minimes",
};

/* Colonne vertébrale conversion — tout pointe vers la boutique box-plus.
   Liens VÉRIFIÉS le 2026-07-12 (STANDARDS §1). Ne PAS inventer de tunnel :
   /offre-duo-rentree, /offre-saison-259, /seance-essai-gratuite = 404. */
export const LINKS = {
  essai: "https://boutique.boxingcenter.fr/seance-essai",   // essai 10€ — dernier recours (gong, FAQ), jamais en tête
  abonnements: "https://boutique.boxingcenter.fr/abonnements",
  enfants: "https://boutique.boxingcenter.fr/abonnements",
  promos: "https://boutique.boxingcenter.fr/offres-speciales",
  coachings: "https://boutique.boxingcenter.fr/coachings",
  materiel: "https://boutique.boxingcenter.fr/materiel",
  // maillage de marque : « Boutique » mène à la BOUTIQUE, pas à un rayon.
  // Elle pointait sur /materiel sous le libellé « Boutique » — le lien
  // mentait au clic, et Saint-Cyprien pointait déjà sur la racine. Parité.
  boutique: "https://boutique.boxingcenter.fr/",
  offreRentree: "/tarifs/",   // la carte "Offre Rentrée" de l’accueil reste interne → /tarifs/
  groupe: "https://boxingcenter.fr/",
  facebook: "https://www.facebook.com/BoxingCenterToulouse/",
  instagram: "https://www.instagram.com/boxingcentertoulouse/",
};

/* Les offres — source de vérité : posters officiels rentrée + 01_OFFRES/
   OFFRES_RENTREE_2026.md. Datées par SEASON, jamais codées en dur dans le markup.
   ⚠ « DUO 29€ » ne s’écrit JAMAIS sans « par personne ». */
export const PROMOS = {
  saison: SEASON,
  label: SEASON_LABEL,
  bonus: "Inscription enfant : le t-shirt Boxing Center est inclus — pour tous, pas pour les 100 premiers.",
  cards: [
    {
      key: "rentree",
      name: "L’offre Rentrée",
      price: "29€",
      unit: "par personne",
      was: "44€",
      period: "· 4 semaines",
      feature: "Cours illimités, toutes disciplines, sans engagement",
      items: ["29€ par personne (au lieu de 44€)", "4 semaines de cours illimités", "Toutes les disciplines", "Encore mieux à deux — 29€ chacun"],
      cta: "Je profite de l’offre à 29€",
      href: "https://boutique.boxingcenter.fr/offre/29",
      tag: "La priorité",
      highlight: true,
    },
    {
      key: "saison",
      name: "La saison complète",
      price: "259€",
      was: "400€",
      period: "les 12 mois",
      feature: "4× sans frais · accès libre aux 5 clubs — moins de 5€ par semaine",
      items: ["259€ les 12 mois (au lieu de 400€)", "Payable en 4× 64,75€ sans frais", "Anglaise, MMA, pieds-poings, Lady, Fitness", "Accès libre aux 5 clubs du réseau"],
      cta: "Je réserve ma saison — 4× 64,75€",
      href: "https://boutique.boxingcenter.fr/offre/259",
      tag: "L’abonnement",
    },
    /* L'abonnement de tous les jours. Il manquait : la page sautait de
       l'offre de rentree a l'ecole des enfants, et quelqu'un qui voulait
       simplement s'abonner au mois ne trouvait aucun prix. Ecrit SANS prix
       barre — ce n'est pas une promotion, c'est le tarif. */
    {
      key: "classiques",
      name: "L’abonnement au mois",
      price: "44€",
      period: "/ 4 semaines · adulte",
      feature: "Étudiant 36€ sur justificatif — le tarif de tous les jours",
      items: ["Adulte 44€ / 4 semaines", "Étudiant 36€ / 4 semaines", "Accès aux 5 salles, toutes les disciplines", "Sans engagement"],
      cta: "Voir les formules au mois",
      href: "https://boutique.boxingcenter.fr/abonnements",
      tag: "Le classique",
    },
    {
      key: "ecole",
      name: "L’école, dès 3 ans",
      price: "295€",
      period: "l’année · t-shirt inclus",
      feature: "Baby Boxe 3/6 à 250€ · éducative 7/11 · ados 12/16",
      items: ["Boxe éducative et ados : 295€/an, t-shirt du club inclus", "Baby Boxe 3/6 ans : 250€/an", "Un créneau par âge, mercredi et samedi", "Compétiteurs encadrés par Mehdi"],
      cta: "J’inscris mon enfant",
      href: "https://boutique.boxingcenter.fr/abonnements",
    },
    {
      key: "essai",
      name: "La séance d’essai",
      price: "10€",
      period: "la séance",
      feature: "Toujours là ? Alors viens essayer — gants prêtés",
      items: ["Toutes les disciplines de la salle", "Gants et protections prêtés", "Sans engagement, sans dossier — tu viens, tu testes, tu décides"],
      cta: "Je viens essayer · 10€",
      href: "https://boutique.boxingcenter.fr/seance-essai",
    },
  ],
};

/* Médias : vraies photos Boxing Center (site Portet) servies en placeholder,
   passées en N&B par CSS. ⚠ à remplacer par les vraies photos des Minimes.
   ⚠ Les légendes décrivent l’ACTIVITÉ (le geste), jamais un claim sur le lieu
   exact — tant que le shooting Minimes n’a pas eu lieu. */
export const MEDIA = "https://www.boxing-center-portet.fr";

/* `top: false` = la page reste dans le MENU et le pied de page, mais quitte
   la barre du haut : neuf entrées se chevauchaient sur écran moyen. */
export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/activites/", label: "Activités" },
  { href: "/le-club/", label: "Le club", top: false },
  { href: "/coachs/", label: "Coachs" },
  { href: "/galerie/", label: "Galerie", top: false },
  { href: "/plannings/", label: "Planning" },
  /* Le levier de conversion : la page se glisse AVANT les tarifs — on
     rassure d’abord, on chiffre ensuite. Le libellé reprend le mot du
     visiteur (« c’est ma première fois »), pas le nom de l’URL. */
  { href: "/premiere-seance/", label: "Première fois" },
  { href: "/tarifs/", label: "Tarifs" },
  { href: "/contact/", label: "Contact" },
];

/* Le réseau Boxing Center (liens sortants depuis Minimes).
   §0.9 : domaines cibles = <salle>.boxingcenter.fr. Tant qu’une salle n’a
   pas SON domaine en ligne, le libellé dit la vérité sur la destination
   (`go`) — un bouton « Découvrir » qui atterrit sur la home du groupe ment.
   §0.6 : Balma-Gramont est VENDUE — ne jamais la citer. */
export const NETWORK = [
  { id: "portet", name: "Portet-sur-Garonne", flagship: true, tag: "Le vaisseau amiral", feat: "600 m² · ring de boxe anglaise · cage MMA · 24 sacs", url: "https://boxingcenter.fr/salle-de-sport-toulouse/salle-de-boxe-portet-sur-garonne-2/", go: "Découvrir" },
  { id: "etats-unis", name: "États-Unis", tag: "Le colosse", feat: "Toutes les disciplines du réseau", url: "https://boxingcenter.fr/salle-de-sport-toulouse/boxing-center-salle-de-toulouse-etats-unis/", go: "Découvrir" },
  { id: "saint-cyprien", name: "Saint-Cyprien", tag: "Rive gauche", feat: "1 200 m² · toutes disciplines", url: "https://boxingcenter.fr/salle-de-sport-toulouse/boxing-center-salle-de-toulouse-saint-cyprien/", go: "Découvrir" },
  { id: "ramonville", name: "Ramonville", tag: "L’octogone", feat: "Ring + octogone 7 m · extérieur", url: "https://mmatoulouse.com/", go: "Découvrir" },
];

/* La FAQ CANONIQUE du site — rendue sur /contact/ UNIQUEMENT, et miroir
   exact du FAQPage LD-JSON de cette page (STANDARDS §4 : FAQPage sur
   /contact/). ⚠ Ne pas la re-rendre ailleurs : deux URL indexées avec les
   mêmes six réponses = duplicate content.
   Voix : tutoiement, bouche du coach — jamais de vouvoiement corporate. */
export const FAQ = [
  { q: "Où se trouve Boxing Center Minimes ?", a: "Au 12 rue de Fenouillet, 31200 Toulouse, dans le quartier des Minimes — Barrière de Paris, à 3 minutes du métro ligne B." },
  { q: "Je n’ai jamais boxé. Je peux venir ?", a: "Oui. Tu ne seras ni le premier ni le seul — on a des créneaux débutants et du cardio boxing où tu ne prends aucun coup. Tu apprends le geste avant de le recevoir." },
  { q: "Quelle est la spécialité de la salle des Minimes ?", a: "La boxe anglaise. C’est la salle historique du groupe, le berceau de plus de 8 boxeurs professionnels et amateurs — avec plusieurs rings dédiés." },
  { q: "Y a-t-il des cours pour les enfants ?", a: "Oui, dès 3 ans. Baby Boxe pour les 3/6 ans (250€ l’année), boxe éducative 7/11, ados 12/16 puis compétiteurs (295€ l’année, t-shirt du club inclus) — du jeu au ring, un créneau par âge." },
  { q: "Il y a des cours pour les femmes ?", a: "Le Boxing Lady est 100 % féminin : lundi et mercredi, 18h30. Et tous les autres cours te sont ouverts." },
  { q: "Quels sont les horaires ?", a: "Du lundi au samedi, de 10h00 à 21h30. Fermé le dimanche." },
];

/* =====================================================================
   LES COACHS — roster Minimes VÉRIFIÉ (source : roster.json, 2026-07-12).
   Loi §0.10 : nom ≡ photo, jamais croisés, jamais de stock.
   - Mehdi = Mehdioutlelis → photo PROUVÉE (le cutout coach-mehdi.png
     est la même prise que mehdi-boutlelis.webp du scrape officiel). Pilier.
   - Chloé / David / Clément : AUCUNE photo prouvée → tuiles nom N&B
     (monogramme + discipline), pas de silhouette empruntée, pas de stock.
   Les textes ne décrivent QUE ce que le poster prouve (disciplines/créneaux) ;
   aucun palmarès inventé.
   ===================================================================== */
export const COACHES = {
  pillar: {
    name: "Mehdi",
    /* clé de jointure avec PLANNING.coach — le poster écrit « MEHDI B »
       sans point, la page écrit « Mehdi » avec. Sans ce champ, le
       compte de créneaux et le lien filtré tombent silencieusement à
       zéro : exactement le genre de bug qui ne casse rien et ment. */
    planName: "Mehdi",
    role: "Coach principal",
    tag: "Le patron de la maison",
    img: "/assets/img/bc/cutouts/coach-mehdi.webp",
    bigname: "Mehdi",
    disciplines: ["Boxe anglaise", "Boxe éducative", "Compétiteurs", "Baby Boxe", "Boxing camp", "Open sparring"],
    bio: "Il tient l’école du premier gant de Baby Boxe jusqu’au sparring des compétiteurs. Anglaise loisirs, éducative, compétition, boxing camp : c’est lui qui trace la ligne. Le genre de coach qui te reprend le jab dix fois s’il le faut — et qui te lâche jamais avant que tu l’aies rentré.",
    note: "Présent dans la salle du lundi au samedi.",
  },
  roster: [
    { initials: "C", name: "Chloé", planName: "Chloé", role: "Boxing Lady", note: "Elle mène la bande du Boxing Lady, et elle ne lâche rien." },
    { initials: "D", name: "David", planName: "David", role: "Boxing Lady · Pieds-poings", note: "Le Boxing Lady, puis les pieds-poings dans la foulée. Le geste propre, la garde haute." },
    { initials: "C", name: "Clément", planName: "Clément", role: "Boxing camp", note: "Le boxing camp. Le cardio qui te construit une caisse." },
  ],
  /* honnêteté §0.10 : on assume publiquement l’absence de portrait */
  pending: "Chloé, David et Clément rejoindront le mur dès qu’on aura leur vrai portrait. Pas de photo d’illustration : ici, un visage = la bonne personne.",
};

/* =====================================================================
   LE CONTENU ÉDITABLE — fusion du backoffice par-dessus les constantes.

   Trois couches, dans cet ordre :
     1. tout ce qui est écrit ci-dessus (la source, versionnée) ;
     2. window.__BC_CONTENT__ — src/content.json, injecté dans le <head>
        au build. C’est ce que « Publier » met en ligne ;
     3. le brouillon local du vestiaire, UNIQUEMENT sur /?apercu=1 —
        pour relire ses modifications avant de publier. Rien n’est en
        ligne tant qu’on n’a pas publié.

   On MUTE les objets exportés au lieu de les réassigner : les modules
   qui les ont déjà importés voient le changement (un `export const`
   réassigné, lui, ne se propage pas).
   ===================================================================== */
function bcDeepAssign(target, src) {
  if (!src || typeof src !== "object" || !target) return target;
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (Array.isArray(v)) {
      if (Array.isArray(target[k])) target[k].splice(0, target[k].length, ...v);
      else target[k] = v.slice();
    } else if (v && typeof v === "object") {
      if (target[k] && typeof target[k] === "object") bcDeepAssign(target[k], v);
      else target[k] = JSON.parse(JSON.stringify(v));
    } else if (v !== undefined) {
      target[k] = v;
    }
  }
  return target;
}

function bcOverrides() {
  if (typeof window === "undefined") return null;
  let base = null;
  try { base = window.__BC_CONTENT__ || null; } catch { /* rien */ }
  try {
    if (new URLSearchParams(location.search).has("apercu")) {
      const draft = JSON.parse(localStorage.getItem("bcm:draft") || "null");
      /* Un brouillon survit aux deploiements dans le navigateur du staff.
         Sans garde, un brouillon d'une ancienne saison MASQUE le contenu
         publie et fait croire que le site est casse. Le brouillon porte
         donc le jeton de cache sous lequel il a ete ecrit : un jeton
         different = un brouillon perime, on l'ignore et on le purge. */
      const jeton = new URL(import.meta.url).searchParams.get("v") || "dev";
      if (draft && typeof draft === "object") {
        if (draft.__jeton === jeton) base = draft;
        else { try { localStorage.removeItem("bcm:draft"); } catch { /* rien */ } }
      }
    }
  } catch { /* localStorage indisponible : on garde le contenu publié */ }
  return base;
}

/* =====================================================================
   L’INSCRIPTION — chaque jeu de données éditable vient se présenter.

   Avant, cette fonction citait nommément SALLE, PROMOS, COACHES,
   PLANNING et FAQ : la fusion ne pouvait donc vivre que dans le fichier
   qui les contenait TOUS. C’est ce qui clouait 42 ko de données sur les
   8 pages alors qu’aucune page n’en lit la moitié.

   `bcRegister` renverse la dépendance : un module se présente avec son
   nom de section et son objet, le noyau lui applique ce qui le concerne.
   Le planning a pu partir dans son propre fichier sans que la chaîne
   d’édition bouge d’une ligne.
   ===================================================================== */
export function bcRegister(nom, cible) {
  const c = bcOverrides();
  const v = c && c[nom];
  if (!v) return cible;
  if (Array.isArray(cible)) {
    if (Array.isArray(v) && v.length) cible.splice(0, cible.length, ...v);
  } else {
    bcDeepAssign(cible, v);
  }
  return cible;
}

/* Les sections que le noyau porte lui-même. */
bcRegister("salle", SALLE);
bcRegister("promos", PROMOS);
bcRegister("coaches", COACHES);
bcRegister("faq", FAQ);

/* champs DÉRIVÉS de l’adresse : recalculés APRÈS la fusion, sinon
   l’adresse affichée change et le lien Maps continue de pointer sur
   l’ancienne — un plan qui ment est pire qu’un plan absent. */
(function derives() {
  const a = SALLE.address;
  a.full = `${a.street}, ${a.zip} ${a.city}`;
  SALLE.mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(a.full)}&output=embed`;
  SALLE.mapsLink = `https://maps.google.com/?q=${encodeURIComponent(a.full)}`;
})();
