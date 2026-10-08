/* =====================================================================
   BOXING CENTER — MINIMES · la galerie

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que une seule page.
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

/* =====================================================================
   LA GALERIE — neuf images du shooting Minimes du 8 octobre 2026, plus
   trois scènes historiques du réseau pour les catégories qui n'ont pas
   encore leur nouveau cliché. Ces trois exceptions portent « photo réseau »
   dans leur label et leur alt ; aucune n'est présentée comme la salle des
   Minimes. `big:true` = cellule mise en avant (mur de champion).
   ===================================================================== */
export const GALLERY = {
  filters: [
    { key: "all", label: "Tout" },
    { key: "salle", label: "La salle" },
    { key: "anglaise", label: "Boxe anglaise" },
    { key: "lady", label: "Lady" },
    { key: "educative", label: "L’école" },
    { key: "technique", label: "Technique" },
  ],
  /* Ce que le cadre coupe : trois choses qu'aucune photo, même prise aux
     Minimes, ne peut rendre. */
  offFrame: [
    {
      n: "01",
      t: "Le bruit",
      d: "Douze sacs, plusieurs rings, et le minuteur qui claque toutes les trois minutes. Une photo est muette — ici, tu entends la salle avant de la voir.",
    },
    {
      n: "02",
      t: "L’odeur",
      d: "Le cuir, la résine, l’humidité des gants qui sèchent. Ça ne se photographie pas et ça ne se nettoie pas non plus. C’est l’odeur d’une salle qui sert.",
    },
    {
      n: "03",
      t: "La voix du coach",
      d: "« Remonte ta droite. » Dix fois. Cent fois. C’est le seul son qui compte et c’est celui qu’aucune image ne t’apportera. Viens le prendre.",
    },
  ],
  /* `label` = la pastille mono posée sur la vignette. `alt` = ce que voit
     quelqu'un qui ne voit pas l'image — et ce que lit Google Images, qui
     n'indexe rien sans lui. Les deux ne disent pas la même chose et ne
     doivent jamais être confondus : la pastille est une accroche, l'alt
     est une description.

     ⚠ RÈGLE TENUE ICI : les fichiers `minimes-*` peuvent nommer le club.
     Les trois anciens clichés mutualisés disent « photo réseau » et ne
     prétendent jamais avoir été pris Barrière de Paris.

     `w`/`h` : les dimensions réelles du fichier. Le navigateur réserve la
     place avant que la photo arrive (plus de saut de mise en page), et
     Google classe mal une image dont il ignore la taille. */
  shots: [
    { img: "/assets/img/photos/minimes-salle-entrainement.webp", w: 1600, h: 960, label: "Le plateau", alt: "Le plateau du Boxing Center Minimes en activité : sacs suspendus, espace de préparation physique et pratiquants.", zone: "salle", big: true },
    { img: "/assets/img/photos/minimes-assaut-ring.webp", w: 1600, h: 960, label: "Le round d’assaut", alt: "Deux boxeurs travaillent en assaut encadré sur le ring du Boxing Center Minimes.", zone: "anglaise" },
    { img: "/assets/img/photos/minimes-assaut-encadre.webp", w: 1600, h: 960, label: "Le coach au bord du ring", alt: "Un coach suit un assaut entre deux boxeurs sur le ring du Boxing Center Minimes.", zone: "anglaise" },
    { img: "/assets/img/photos/minimes-bandes-mains.webp", w: 1600, h: 2160, label: "Avant les gants", alt: "Un jeune pratiquant serre ses bandes avant une séance au Boxing Center Minimes.", zone: "educative", big: true },
    { img: "/assets/img/photos/minimes-ring-cours.webp", w: 1600, h: 960, label: "Le ring en activité", alt: "Plusieurs binômes travaillent simultanément sur le ring du Boxing Center Minimes.", zone: "anglaise" },
    { img: "/assets/img/photos/lady-garde-1200.webp", w: 1200, h: 800, label: "Boxing Lady · photo réseau", alt: "Deux pratiquantes gantées travaillent en garde pendant un cours Boxing Lady du réseau Boxing Center.", zone: "lady" },
    { img: "/assets/img/photos/minimes-coaching-ring.webp", w: 1600, h: 960, label: "Entre deux rounds", alt: "Un coach donne de l’eau et ses consignes à un pratiquant sur le ring des Minimes.", zone: "technique" },
    { img: "/assets/img/photos/minimes-gants.webp", w: 1600, h: 1036, label: "Les gants", alt: "Une paire de gants blancs et dorés photographiée au Boxing Center Minimes.", zone: "salle" },
    { img: "/assets/img/photos/coach-lady-1200.webp", w: 768, h: 512, label: "Au sac · photo réseau", alt: "Une pratiquante travaille au sac pendant une séance Lady Boxing du réseau Boxing Center.", zone: "lady" },
    { img: "/assets/img/photos/minimes-cross-training-barre.webp", w: 1600, h: 2158, label: "Barre au-dessus de la tête", alt: "Une pratiquante effectue un mouvement de préparation physique avec une barre au Boxing Center Minimes.", zone: "technique" },
    { img: "/assets/img/photos/minimes-cross-training-groupe.webp", w: 1600, h: 960, label: "Circuit en groupe", alt: "Un groupe suit un circuit de préparation physique avec barres au Boxing Center Minimes.", zone: "technique" },
    { img: "/assets/img/photos/ecole-medailles-1200.webp", w: 1200, h: 800, label: "Les médailles · photo réseau", alt: "Deux jeunes boxeuses du réseau Boxing Center montrent leur médaille après une compétition.", zone: "educative" },
  ],
};
