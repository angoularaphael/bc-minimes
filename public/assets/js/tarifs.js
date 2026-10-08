/* =====================================================================
   MINIMES · tarifs.js — "Tarifs & offres" subpage
   Rendu depuis data.js : PROMOS (cartes essai/duo/saison/école), le
   bandeau bonus, et les AVIS Google réels (REVIEWS). Rien en dur.

   La page affichait quatre prix et s’arrêtait là — le visiteur repartait
   avec ses objections entières (« 29€ à deux ou chacun ? », « 259€ d’un
   coup ? », « je dois acheter des gants ? »). MONEY_FAQ y répond, dans
   l’accordéon partagé (window.BC.faq). ⚠ SANS FAQPage : la seule du site
   est celle de /contact/ — deux FAQPage, c’est deux URL en concurrence.
   ===================================================================== */
import { PROMOS, SEASON_LABEL } from "./data.js?v=b56";
import { REVIEWS, MONEY_FAQ } from "./data-argent.js?v=b56";

const $ = (s, r = document) => r.querySelector(s);

function renderSeason() {
  const el = $("#season");
  if (el) el.textContent = SEASON_LABEL;
}

function renderOffers() {
  const box = $("#offers");
  if (!box) return;
  box.innerHTML = PROMOS.cards
    .map(
      (c) => `<article class="offer ${c.highlight ? "offer--hot" : ""}">
        ${c.tag ? `<span class="offer__tag">${c.tag}</span>` : ""}
        <h3 class="offer__name">${c.name}</h3>
        <div class="offer__price">
          ${c.was ? `<span class="offer__was">${c.was}</span>` : ""}
          <span class="offer__now">${c.price}</span>
          ${c.unit ? `<span class="offer__unit">${c.unit}</span>` : ""}
          ${c.period ? `<span class="offer__period">${c.period}</span>` : ""}
        </div>
        <p class="offer__feature">${c.feature}</p>
        <ul class="offer__items">${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        <a class="btn ${c.highlight ? "btn--primary" : "btn--ghost"}" data-magnetic href="${c.href}"><span>${c.cta}</span></a>
      </article>`
    )
    .join("");
}

function renderBonus() {
  const el = $("#bonus");
  if (!el) return;
  /* Le mot en gras suivait « 100 premiers inscrits » — une formule que le
     bonus ne contient plus depuis que le t-shirt est inclus POUR TOUS. Le
     remplacement ne trouvait donc plus rien et l’emphase tombait dans le
     vide, sans que rien ne casse. C’est « pour tous » qui porte la promesse
     maintenant : c’est lui qu’on met en gras. */
  el.innerHTML = `<span class="bonus__badge">Bonus</span><p class="bonus__txt">${PROMOS.bonus.replace("pour tous", "<b>pour tous</b>")}</p>`;
}

function renderReviews() {
  /* Ni note, ni nombre d’avis, ni étoiles : ordre d’Eddy du 08/10/2026
     (« no google rating »). La preuve, ce sont les mots des adhérents,
     attribués, et le lien vers la fiche où chacun lit la source. */
  const rating = $("#rating");
  if (rating) {
    rating.innerHTML = `<a class="rev-rating__src" href="https://www.google.com/maps/search/?api=1&amp;query=Boxing+Center+Minimes+12+rue+de+Fenouillet+31200+Toulouse" target="_blank" rel="noopener">${REVIEWS.source} · lire tous les avis ↗</a>`;
  }
  const box = $("#reviews");
  if (!box) return;
  box.innerHTML = REVIEWS.quotes
    .map(
      (q) => `<figure class="review">
        <blockquote class="review__text">«&nbsp;${q.text}&nbsp;»</blockquote>
        <figcaption class="review__author">${q.author}</figcaption>
      </figure>`
    )
    .join("");
}

function boot() {
  renderSeason();
  renderOffers();
  renderBonus();
  renderReviews();
  window.BC.faq($("#money-faq"), MONEY_FAQ);

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
