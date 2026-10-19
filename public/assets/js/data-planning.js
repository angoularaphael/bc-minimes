/* =====================================================================
   BOXING CENTER — MINIMES · le planning

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que trois pages (planning, activités, coachs).
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */
import { bcRegister } from "./data.js?v=b58";

/* =====================================================================
   LE PLANNING — transcription du poster officiel SAISON 2026-2027
   (« PLANNING DES COURS », Barrière de Paris / Minimes ; roster.json fait
   foi). C’est la SOURCE de la grille HTML filtrable de /plannings/
   (STANDARDS §3) ET des repères de la page. ⚠ Aucun créneau n’est inventé :
   si le poster ne le prouve pas, il n’est pas ici.
   `d` = jour · `h` = début · `end` = fin (quand le poster la donne)
   `disc` = clé de discipline (filtre) · `coach` = prénom du poster (filtre)
   ===================================================================== */
export const PLANNING_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const PLANNING_DISCIPLINES = [
  { key: "anglaise", label: "Anglaise loisirs" },
  { key: "competiteurs", label: "Compétiteurs" },
  { key: "educative", label: "L’école" },
  { key: "lady", label: "Boxing Lady" },
  { key: "camp", label: "Boxing camp" },
  { key: "sparring", label: "Open sparring" },
  { key: "pieds-poings", label: "Pieds-poings" },
];
/* `h`/`end` = début/fin EXACTES du poster (chaque cours en a une : la
   colonne HORAIRE les donne toutes). `space` = la sous-colonne « 1 » ou
   « 2 » du poster — lundi, mardi et jeudi font tourner DEUX espaces en
   parallèle le soir. C’est une info du poster qu’on perdait entièrement. */
export const PLANNING = [
  /* ---- Lundi ---- */
  { d: "Lundi", h: "12h40", end: "13h20", disc: "camp", name: "Boxing camp", coach: "Mehdi", age: "Adultes" },
  { d: "Lundi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi", age: "Licenciés", space: 1 },
  { d: "Lundi", h: "18h30", end: "19h30", disc: "lady", name: "Boxing Lady", coach: "Chloé", age: "100 % féminin", space: 2 },
  { d: "Lundi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },

  /* ---- Mardi ---- */
  { d: "Mardi", h: "12h40", end: "13h20", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },
  { d: "Mardi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi", age: "Licenciés", space: 1 },
  { d: "Mardi", h: "18h30", end: "19h30", disc: "camp", name: "Boxing camp", coach: "Clément", age: "Adultes", space: 2 },
  { d: "Mardi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },

  /* ---- Mercredi ---- */
  { d: "Mercredi", h: "12h40", end: "13h20", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },
  { d: "Mercredi", h: "15h00", end: "16h00", disc: "educative", name: "Boxe éducative enfants", coach: "Mehdi", age: "7/11 ans" },
  { d: "Mercredi", h: "16h00", end: "17h00", disc: "educative", name: "Boxe éducative ados", coach: "Mehdi", age: "12/16 ans" },
  { d: "Mercredi", h: "17h00", end: "18h30", disc: "educative", name: "Boxe éducative compétiteurs", coach: "Mehdi", age: "Jeunes licenciés" },
  { d: "Mercredi", h: "18h30", end: "19h30", disc: "lady", name: "Boxing Lady", coach: "David", age: "100 % féminin" },
  { d: "Mercredi", h: "19h40", end: "21h00", disc: "pieds-poings", name: "Boxe pieds-poings", coach: "David", age: "Tous niveaux" },

  /* ---- Jeudi ---- */
  { d: "Jeudi", h: "12h40", end: "13h20", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },
  { d: "Jeudi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi", age: "Licenciés", space: 1 },
  { d: "Jeudi", h: "18h30", end: "19h30", disc: "camp", name: "Boxing camp", coach: "Clément", age: "Adultes", space: 2 },
  { d: "Jeudi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },

  /* ---- Vendredi ---- */
  { d: "Vendredi", h: "12h40", end: "13h20", disc: "camp", name: "Boxing camp", coach: "Mehdi", age: "Adultes" },
  { d: "Vendredi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi", age: "Licenciés" },
  { d: "Vendredi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi", age: "Tous niveaux" },

  /* ---- Samedi ---- */
  { d: "Samedi", h: "11h00", end: "12h00", disc: "camp", name: "Boxing camp", coach: "Mehdi", age: "Adultes" },
  { d: "Samedi", h: "14h15", end: "15h00", disc: "educative", name: "Baby Boxe", coach: "Mehdi", age: "3/6 ans" },
  { d: "Samedi", h: "15h00", end: "16h00", disc: "educative", name: "Boxe éducative enfants", coach: "Mehdi", age: "7/11 ans" },
  { d: "Samedi", h: "16h00", end: "17h00", disc: "educative", name: "Boxe éducative ados", coach: "Mehdi", age: "12/16 ans" },
  { d: "Samedi", h: "17h00", end: "18h30", disc: "educative", name: "Boxe éducative compétiteurs", coach: "Mehdi", age: "Jeunes licenciés" },
  { d: "Samedi", h: "18h30", end: "19h30", disc: "sparring", name: "Open sparring", coach: "Mehdi", age: "Licenciés" },
];
/* L’ACCÈS LIBRE — les blocs gris du poster, qui en occupent la moitié et
   que la grille ignorait complètement. Chaque bande correspond à un
   libellé de la colonne HORAIRE : les treize libellés du poster sont tous
   utilisés une fois et une seule (cours ou accès libre), ce qui est le
   contrôle de cohérence de cette transcription. Pas de coach, pas de
   réservation : la salle est ouverte, tu bosses seul. */
export const PLANNING_FREE = [
  { d: "Lundi", h: "10h00", end: "12h00" },
  { d: "Lundi", h: "13h20", end: "18h00" },
  { d: "Lundi", h: "18h00", end: "19h30", space: 2 },
  { d: "Mardi", h: "10h00", end: "12h00" },
  { d: "Mardi", h: "13h20", end: "18h00" },
  { d: "Mardi", h: "18h00", end: "19h30", space: 2 },
  { d: "Mercredi", h: "10h00", end: "12h00" },
  { d: "Mercredi", h: "13h20", end: "15h00" },
  { d: "Jeudi", h: "10h00", end: "12h00" },
  { d: "Jeudi", h: "13h20", end: "18h00" },
  { d: "Jeudi", h: "18h00", end: "19h30", space: 2 },
  { d: "Vendredi", h: "10h00", end: "12h00" },
  { d: "Vendredi", h: "13h20", end: "18h00" },
  { d: "Samedi", h: "10h00", end: "12h00" },
  { d: "Samedi", h: "12h40", end: "14h00" },
  { d: "Samedi", h: "19h40", end: "21h00" },
];
/* Les repères de /plannings/ — dérivés du PLANNING ci-dessus, jamais tapés
   dans le markup (§0.10 : aucun nom de coach en dur dans un HTML). */
export const PLANNING_KEYS = [
  { n: "01", t: "L’accès libre", d: "Tous les jours de 10h à 12h, et tout l’après-midi de 13h20 à 18h : rings et sacs en autonomie, sans réservation. Le mercredi ça s’arrête à 15h, l’école prend la salle." },
  { n: "02", t: "L’école, dès 3 ans", d: "Baby Boxe 3/6 ans le samedi à 14h15. Puis les 7/11 à 15h, les 12/16 à 16h, les jeunes compétiteurs à 17h — le mercredi et le samedi, la même montée d’âge." },
  { n: "03", t: "Boxing Lady", d: "Lundi et mercredi, 18h30. Une heure, deux soirs, et le second espace de la salle rien que pour elles le lundi." },
  { n: "04", t: "La boxe sérieuse", d: "Compétiteurs de 18h à 19h30 le lundi, le mardi, le jeudi et le vendredi. Open sparring le samedi 18h30. Et l’anglaise loisirs à 19h40, les quatre mêmes soirs." },
];

/* Le planning est ÉDITABLE depuis le backoffice : il s’inscrit auprès du
   noyau, qui lui applique le contenu publié (ou le brouillon en aperçu).
   Le module a bougé, la chaîne d’édition n’a pas bougé d’un pouce. */
bcRegister("planning", PLANNING);
