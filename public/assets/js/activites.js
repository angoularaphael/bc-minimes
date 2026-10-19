/* =====================================================================
   MINIMES · activites.js — "Les activités" subpage
   Catalogue complet : un écran par discipline (rangées, pas de grille),
   avec sommaire ancré (#<key>). Rendu depuis data.js (DISCIPLINES enrichi
   des champs `for` + `points`). Rien en dur dans le markup répété.

   Deux dettes réglées ici :
   1. Le catalogue s’arrêtait à six disciplines alors que le poster
      officiel en prouve DEUX de plus (Boxing camp — cinq créneaux par
      semaine — et Boxe pieds-poings). Elles y sont.
   2. Le bouton « Voir les créneaux » envoyait sur la semaine entière,
      non filtrée : il promettait un créneau et livrait un planning. Il
      pointe maintenant sur /plannings/?disc=… — et pour les trois
      disciplines qui n’ONT pas de créneau (paos, cross, cardio), il ne
      ment plus : il le dit et renvoie vers l’accès libre.
   ===================================================================== */
import { LINKS, CTA, CTA_HREF } from "./data.js?v=b58";
import { DISCIPLINES } from "./data-disciplines.js?v=b58";
import { PLANNING } from "./data-planning.js?v=b58";

const $ = (s, r = document) => r.querySelector(s);

/* Le badge est DÉRIVÉ du planning, jamais compté à la main : le jour où
   un créneau bouge dans data.js, le badge bouge avec lui. */
const slotCount = (d) => (d.plan ? PLANNING.filter((s) => s.disc === d.plan).length : 0);

function badgeOf(d) {
  const n = slotCount(d);
  /* Le compte de créneaux ne s’affiche plus : le détail vit dans les points
     de la fiche et dans le planning, où il est daté et heure par heure.
     slotCount reste calculé — il sert encore à distinguer une discipline qui
     a des créneaux d’une qui vit en accès libre. */
  if (n > 0) return "";
  /* état honnête : pas un placeholder, une information */
  return `<span class="act__slots act__slots--free">${d.freeNote}</span>`;
}

function mediaOf(d, i) {
  /* Loi §0.10 étendue au geste : aucune photo du pool ne montre des
     pieds-poings. Plutôt qu’illustrer avec une photo de poings, on
     assume — même tuile dessinée que le roster des coachs sans portrait. */
  if (d.noPhoto) {
    return `<div class="act__media act__media--none" aria-hidden="true">
      <span class="act__glyph">${d.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
      <span class="act__nophoto">Photo à venir</span>
    </div>`;
  }
  return `<div class="act__media media" data-img="${d.img}" data-label="${d.name}" aria-hidden="true"></div>`;
}

function ctaOf(d) {
  const href = d.plan ? `/plannings/?disc=${encodeURIComponent(d.plan)}` : "/plannings/?disc=libre";
  const label = d.plan ? "Voir ses créneaux" : "Voir l’accès libre";
  return `<a class="btn btn--ghost" data-magnetic href="${href}"><span>${label}</span></a>`;
}

function renderIndex() {
  const box = $("#act-index");
  if (!box) return;
  box.innerHTML = DISCIPLINES.map(
    (d, i) => `<a class="act-chip" href="#${d.key}" data-magnetic>
      <span class="act-chip__n">${String(i + 1).padStart(2, "0")}</span>${d.actName || d.name}
    </a>`
  ).join("");
}

function renderRows() {
  const box = $("#act-rows");
  if (!box) return;
  box.innerHTML = DISCIPLINES.map(
    (d, i) => `<article class="act ${i % 2 ? "act--rev" : ""}" id="${d.key}">
      ${mediaOf(d, i)}
      <div class="act__body">
        <span class="act__bigidx" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <span class="act__tag">${d.tag}</span>
        <h2 class="act__name">${d.actName || d.name}${d.actPlace ? ` — ${d.actPlace}` : ""}</h2>
        ${badgeOf(d)}
        <p class="act__desc">${d.desc}</p>
        <p class="act__for"><span>Pour qui</span>${d.for}</p>
        <ul class="act__points">${d.points.map((p) => `<li>${p}</li>`).join("")}</ul>
        <div class="act__cta">
          <a class="btn btn--primary" data-magnetic href="${CTA_HREF.primary}"><span>${CTA.primary}</span></a>
          ${ctaOf(d)}
        </div>
      </div>
    </article>`
  ).join("");
}

function boot() {
  renderIndex();
  renderRows();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
