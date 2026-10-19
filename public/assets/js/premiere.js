/* =====================================================================
   MINIMES · premiere.js — « Ta première séance »

   La page est écrite en clair dans le HTML : c’est la page qu’on lit
   avant d’oser appeler, elle doit être lisible même si le JS tombe.
   Ce module n’ajoute que ce qui ne peut pas être statique :
     · la carte, dont l’URL est DÉRIVÉE de l’adresse (data.js) — si le
       club déménage depuis le vestiaire, le plan suit ;
     · les moteurs d’animation partagés (media / reveal / magnetic).
   ===================================================================== */
import { SALLE } from "./data.js?v=b58";

const $ = (s, r = document) => r.querySelector(s);

function boot() {
  const map = $("#map");
  if (map) map.src = SALLE.mapsUrl;

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
