/* =====================================================================
   BOXING CENTER — MINIMES · l’argent

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que une seule page (tarifs).
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

import { bcRegister } from "./data.js?v=b58";

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
   (« la carte étudiante suffit ? », « des frais en plus ? », « je dois
   acheter des gants ? »). Chaque réponse ci-dessous est DÉRIVÉE de PROMOS/LINKS —
   aucun chiffre nouveau, aucune promesse que la boutique ne tient pas.
   ⚠ Rendues en accordéon SANS FAQPage : la seule FAQPage du site est
   celle de /contact/ (§4). Deux FAQPage = deux URL en concurrence. */
export const MONEY_FAQ = [
  {
    q: "L’offre Étudiant, il me faut quoi ?",
    a: "Ta carte étudiante de l’année, montrée à l’inscription. Elle ouvre le tarif à 36,99€ toutes les 4 semaines : mêmes cours, mêmes rings, mêmes cinq salles que l’abonnement adulte à 44,99€. Sans carte, c’est le tarif adulte qui s’applique.",
  },
  {
    q: "Il y a des frais en plus de l’abonnement ?",
    a: "Le badge d’accès : 34,99€, prélevé quelques jours après ton inscription. La première échéance se règle par carte bancaire, les suivantes partent en prélèvement sur ton IBAN.",
  },
  {
    q: "Et si je préfère tout payer d’un coup ?",
    a: "Prends le comptant : tu poses 150€ pour trois mois, 250€ pour six, ou 400€ pour toute l’année. Tu règles en une fois, à l’inscription, et aucun prélèvement ne suit.",
  },
  {
    q: "L’abonnement marche dans les autres salles ?",
    a: "Oui. Étudiant ou adulte, ton abonnement t’ouvre les cinq salles du réseau. Tu t’entraînes aux Minimes le soir et ailleurs le samedi si ça t’arrange — c’est la même carte.",
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
