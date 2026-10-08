/* =====================================================================
   BOXING CENTER — MINIMES · l’argent

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que une seule page (tarifs).
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

import { bcRegister } from "./data.js?v=b56";

/* Avis Google réels (verbatim, curés le 2026-07-12) — jamais inventés.
   Source : fiche Google Boxing Center Minimes.

   La note et le NOMBRE d’avis étaient figés ici, dans un fichier que
   seul un développeur peut ouvrir. Un compte d’avis bouge toutes les
   semaines : au bout de deux mois, le site affirmait publiquement un
   chiffre faux et personne à la salle ne pouvait le corriger. Ils sont
   maintenant éditables depuis le vestiaire (section « Les avis »), et
   `count` est une CHAÎNE : vidée, la page affiche la note sans compte
   plutôt qu’un compte périmé. Les verbatims, eux, restent des citations
   datées et attribuées. */
export const REVIEWS = {
  rating: "",
  scale: "5",
  count: "",
  source: "Avis Google",
  quotes: [
    { text: "Très belle salle de boxe. Matos au top, coach et staff accueillant.", author: "Hamed S.", stars: 5 },
    { text: "J’ai adoré mes trois ans passés à faire du sport à Boxing Center. Équipe au top.", author: "Salomé C.", stars: 5 },
    { text: "Superbe salle, très bonne ambiance. Je pratique les cours de boxe anglaise loisir.", author: "Pascal L.", stars: 5 },
  ],
};
bcRegister("avis", REVIEWS);   /* ce que le staff écrit dans le vestiaire gagne */
/* Les questions d’ARGENT — /tarifs/ seulement. La page listait quatre prix
   et s’arrêtait là : le visiteur repartait avec les objections intactes
   (« 29€ à deux ou chacun ? », « 259€ d’un coup ? », « je dois acheter des
   gants ? »). Chaque réponse ci-dessous est DÉRIVÉE de PROMOS/LINKS —
   aucun chiffre nouveau, aucune promesse que la boutique ne tient pas.
   ⚠ Rendues en accordéon SANS FAQPage : la seule FAQPage du site est
   celle de /contact/ (§4). Deux FAQPage = deux URL en concurrence. */
export const MONEY_FAQ = [
  {
    q: "L’offre Rentrée à 29€, c’est pour deux ou chacun ?",
    a: "Chacun. 29€ par personne toutes les 4 semaines au lieu de 44,99€, cours illimités, sans engagement. Viens avec ton binôme : c’est ce qui te fait pousser la porte la troisième semaine, quand la motivation du début est retombée.",
  },
  {
    q: "259€ d’un coup, c’est raide.",
    a: "C’est pour ça que c’est payable en 4× sans frais. 259€ les douze mois au lieu de 400€, ça fait moins de 65€ par échéance et à peu près 22€ par mois de salle. Un abonnement de sport classique te coûte ça sans ring dedans.",
  },
  {
    q: "L’abonnement marche dans les autres salles ?",
    a: "Oui. La saison ouvre l’accès libre aux cinq clubs du réseau. Tu t’entraînes aux Minimes le soir et ailleurs le samedi si ça t’arrange — c’est la même carte.",
  },
  {
    q: "Et pour inscrire un enfant ?",
    a: "295€ l’année, t-shirt du club inclus — 250€ pour la Baby Boxe des 3/6 ans. Éducative pour les 7/11, ados 12/16, puis les jeunes compétiteurs. Un créneau par âge, le mercredi et le samedi.",
  },
  {
    q: "Je paye combien pour la première fois ?",
    a: "Dix euros. Une séance d’essai, la discipline que tu veux, gants et protections prêtés. Pas de dossier, pas de certificat à courir chercher avant d’avoir essayé, rien derrière. Tu viens, tu boxes, tu décides après.",
  },
  {
    q: "Il faut acheter du matériel avant de venir ?",
    a: "Pas pour l’essai : les gants et les protections sont prêtés. Le jour où tu t’installes, tu prends tes gants à toi — c’est une question d’hygiène avant d’être une question de style. La boutique du réseau est là pour ça, et le coach te dira quoi prendre plutôt que de te vendre le plus cher.",
  },
  {
    q: "Le t-shirt du club, il faut le payer ?",
    a: "Non. Il est inclus dans l’inscription enfant, pour tous — pas pour les cent premiers, pas sous condition. Ton gamin repart avec le t-shirt Boxing Center le jour où il s’inscrit.",
  },
];
