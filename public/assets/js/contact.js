/* =====================================================================
   MINIMES · contact.js — "Contact & accès" subpage
   Rendu depuis data.js : coordonnées (SALLE) + carte + FAQ locale (FAQ).
   La FAQ visible est le miroir exact du FAQPage LD-JSON de la page.
   ===================================================================== */
import { SALLE, FAQ } from "./data.js?v=b58";

const $ = (s, r = document) => r.querySelector(s);

function renderContact() {
  const a = $("#addr");
  if (a) { a.textContent = SALLE.address.full; a.href = SALLE.mapsLink; }
  const access = $("#access");
  if (access) access.innerHTML = SALLE.access.map((x) => `<li>${x}</li>`).join("");
  const hours = $("#hours");
  if (hours) hours.innerHTML = SALLE.hoursData.map((h) => `${h.d} · ${h.h}`).join("<br>");
  const p = $("#phone");
  if (p) { p.textContent = SALLE.phone; p.href = "tel:" + SALLE.phoneHref; }
  const em = $("#email");
  if (em) { em.textContent = SALLE.email; em.href = "mailto:" + SALLE.email; }
  const map = $("#map");
  if (map) map.src = SALLE.mapsUrl;
}

function boot() {
  renderContact();
  /* La FAQ CANONIQUE — /contact/ uniquement, miroir exact du FAQPage
     LD-JSON de cette page. Le rendu et le comportement de l’accordéon
     vivent dans site.js (window.BC.faq) depuis que /tarifs/ pose lui
     aussi des questions : un seul composant, une seule correction
     d’accessibilité à faire le jour où il en faut une. */
  window.BC.faq($("#faq"), FAQ);

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
