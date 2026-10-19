/* =====================================================================
   BOXING CENTER — MINIMES · l’accueil

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que une seule page.
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

/* La toise — chiffres qui content le palmarès, pas la surface */
export const STATS = [
  { v: "Plusieurs", suffix: "", l: "rings — pas une salle de fitness", raw: true },
  { v: 8, suffix: "+", l: "pros sortis de ces cordes — une vraie école de boxe" },
  { v: 50, suffix: "+", l: "enfants formés chaque année dans notre école de boxe" },
  { v: 2016, suffix: "", l: "depuis", raw: true },
];
export const VALUES = [
  { n: "01", t: "L’humilité d’abord", d: "Le premier round te dit qui tu es. Tout le monde repart corrigé — les pros aussi." },
  { n: "02", t: "La transmission", d: "Ceux qui tiennent les pattes aujourd’hui ont pris des jabs sur ce ring hier." },
  { n: "03", t: "Le travail", d: "Pas de raccourci. Le talent, c’est dix ans de pattes d’ours." },
  { n: "04", t: "La maison", d: "Le môme de 3 ans et le pro se changent dans le même vestiaire. Personne n’a de couloir privé." },
];
export const AUDIENCES = [
  { t: "Les débutants", tag: "Première fois", d: "Jamais mis un gant ? C’est exactement pour toi. Le premier jour, tout le monde frappe à côté du sac — Mehdi te reprend le geste dix fois s’il le faut, et il ne lâche pas avant que tu l’aies rentré.", img: "/assets/img/photos/ballon-vitesse-1200.webp" },
  { t: "Les femmes", tag: "Boxing Lady", d: "Boxing Lady le lundi et le mercredi — 18h30, la salle est à elles. Beaucoup y débutent, certaines rejoignent ensuite les cours mixtes. Les deux sont très bien.", img: "/assets/img/photos/lady-garde-1200.webp" },
  { t: "Les enfants", tag: "Dès 3 ans", d: "Baby Boxe dès 3 ans, éducative 7/11, ados 12/16 : on touche, on ne frappe pas — règle fédérale. De la motricité, du respect, et toute cette énergie qui trouve enfin où aller.", img: "/assets/img/photos/ecole-medailles-1200.webp" },
];
/* L’offre — teaser accueil (3 cartes). Le détail vit sur /tarifs/ (PROMOS).
   L’étudiant d’abord, puis l’adulte, puis l’école : chaque carte mène à
   SA page d’inscription, et le badge dit un fait, jamais une rareté. */
export const TARIFS = [
  {
    name: "L’offre Étudiant",
    price: "36,99€",
    period: "carte étudiante requise · 4 semaines",
    badge: "Sur justificatif",
    feature: "Ta carte étudiante à l’inscription, et le ring est à toi au même titre que les autres",
    items: ["Cours illimités, toutes disciplines", "Les 5 salles du réseau", "Sans engagement"],
    cta: "Je m’inscris en étudiant",
    href: "https://boutique.boxingcenter.fr/inscription?product=etudiants-4-semaines&step=1&utm_source=site&utm_medium=cta&utm_campaign=bc-minimes",
    highlight: true,
  },
  {
    name: "L’offre Adulte",
    price: "44,99€",
    period: "· 4 semaines",
    badge: "Sans engagement",
    feature: "Les rings, les sacs, chaque cours du planning — tu restes tant que tu reviens",
    items: ["Cours illimités, toutes disciplines", "Les 5 salles du réseau", "Renouvelable, résiliable"],
    cta: "Je m’inscris · 44,99€",
    href: "https://boutique.boxingcenter.fr/inscription?product=44-99-4-semaines&step=1&utm_source=site&utm_medium=cta&utm_campaign=bc-minimes",
    highlight: true,
  },
  {
    name: "L’école, dès 3 ans",
    price: "295€",
    period: "/ an · t-shirt inclus",
    feature: "Baby Boxe 250€ · éducative · ados",
    items: ["Baby Boxe, éducative, ados", "Mercredi et samedi", "Matériel fourni"],
    cta: "Inscrire mon enfant",
    href: "https://boutique.boxingcenter.fr/abonnements",
    highlight: false,
  },
];
