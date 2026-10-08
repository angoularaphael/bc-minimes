/* =====================================================================
   BOXING CENTER — MINIMES · le club

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que une seule page.
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

/* Le Club — histoire (timeline scroll)
   ⚠ jalons à affiner avec le club. Les entrées non confirmées sont
   volontairement DÉ-DATÉES (`y` textuel) plutôt que datées au jugé :
   un millésime faux est pire qu’un millésime absent, et une timeline qui
   s’arrête il y a deux ans raconte une salle qui s’est arrêtée. */
export const TIMELINE = [
  { y: "2016", t: "Le point de départ", d: "Boxing Center ouvre sa toute première salle aux Minimes. Le concept des salles américaines, accès six jours sur sept, plusieurs rings : un quartier qui n’avait rien, et d’un coup une salle." },
  { y: "2018", t: "Les premiers gants", d: "La boxe éducative et le Boxing Lady décollent. Une génération de gamins et de femmes du quartier découvre le noble art." },
  { y: "Le cap", t: "Le passage pro", d: "Johnson et Salomon passent professionnels. La preuve que l’école des Minimes mène loin." },
  { y: "Depuis", t: "Le vivier", d: "Des boxeurs amateurs formés à la maison saison après saison, et une nouvelle génération qui monte sur le ring chaque année." },
  { y: "Aujourd’hui", t: "Le berceau", d: "Toujours la même salle, toujours les rings. L’école tourne encore, du samedi 14h15 des 3/6 ans au sparring du samedi soir." },
];
export const SPECS = [
  { l: "Rings de boxe", v: "3" },
  { l: "Sacs lourds", v: "12" },
  { l: "Zone pattes d’ours", v: "Oui" },
  { l: "Prépa physique (étage)", v: "Oui" },
  { l: "Vestiaires", v: "H / F" },
  { l: "Affiliations", v: "FFBoxe · FFKMDA · FMMAF" },
];
/* Les questions du LIEU — /le-club/ seulement. Volontairement DIFFÉRENTES
   de la FAQ canonique (/contact/) : ici on répond sur la salle, pas sur
   l’offre. Rendues en prose, sans FAQPage (une seule FAQPage par site). */
export const CLUB_QUESTIONS = [
  { q: "C’est quoi, l’étage ?", a: "La zone prépa physique. Gainage, cardio, explosivité — la caisse qui te fait tenir le dernier round. Elle surplombe les rings : tu bosses en entendant le cuir en dessous." },
  { q: "Je peux venir voir avant ?", a: "Pousse la porte aux heures d’ouverture, du lundi au samedi. Personne ne te demandera rien. Regarde un cours depuis le bord du ring, et tu sauras." },
  { q: "Il y a un vestiaire femme ?", a: "Oui, vestiaires hommes et femmes séparés. Et deux soirs par semaine, le Boxing Lady : la salle est à elles." },
];
