/* =====================================================================
   MINIMES · coachs.js — "Les coachs" subpage
   Roster Minimes vérifié (data.js COACHES ← roster.json). Un pilier mis
   en avant (Mehdi, photo prouvée), les autres en tuiles nom N&B.
   Loi §0.10 : nom ≡ photo, jamais de stock, jamais de croisement.
   ===================================================================== */
import { COACHES, LINKS, CTA, CTA_HREF } from "./data.js?v=b58";

const $ = (s, r = document) => r.querySelector(s);

/* Le site ne publie plus quel coach tient quel créneau : les aides qui
   comptaient et liaient ses heures (weekOf, linkOf, daysOf) sont retirées
   avec la grille qu’elles servaient. */

function renderPillar() {
  const el = $("#pillar");
  if (!el) return;
  const c = COACHES.pillar;
  el.innerHTML = `
    <div class="pillar__stage">
      <span class="pillar__bigname" aria-hidden="true">${c.bigname}</span>
      <img class="pillar__cut" src="${c.img}" width="236" height="452" alt="${c.name}, ${c.role} de Boxing Center Minimes" decoding="async" fetchpriority="high" />
    </div>
    <div class="pillar__body">
      <span class="pillar__role">${c.role} · <i>${c.tag}</i></span>
      <h2 class="pillar__name">${c.name}</h2>
      <ul class="pillar__disc">${c.disciplines.map((d) => `<li>${d}</li>`).join("")}</ul>
      <p class="pillar__bio">${c.bio}</p>
      <div class="pillar__cta">
        <a class="btn btn--primary" data-magnetic href="${CTA_HREF.primary}"><span>${CTA.primary}</span></a>
        <a class="btn btn--ghost" data-magnetic href="/plannings/"><span>Voir le planning</span></a>
      </div>
    </div>`;
}

function renderRoster() {
  const box = $("#roster");
  if (!box) return;
  box.innerHTML = COACHES.roster
    .map(
      (c) => `<article class="coach">
        <span class="coach__mono" aria-hidden="true">${c.initials}</span>
        <div class="coach__body">
          <span class="coach__role">${c.role}</span>
          <h3 class="coach__name">${c.name}</h3>
        </div>
      </article>`
    )
    .join("");
}

function boot() {
  renderPillar();
  renderRoster();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
