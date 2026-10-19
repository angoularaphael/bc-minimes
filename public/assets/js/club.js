/* =====================================================================
   MINIMES · club.js — "Le club" subpage rendering + choreography
   ⚠ Cette page NE rend PAS la FAQ. La FAQ canonique (+ son FAQPage) vit
   sur /contact/ et nulle part ailleurs (STANDARDS §4) : les deux pages
   rendaient les MÊMES six réponses sur deux URL indexées = duplicate
   content, et le FAQPage de /le-club/ déclarait 3 questions pendant que
   la page en affichait 6. Ici, /le-club/ est la VISITE : elle répond aux
   questions du LIEU (CLUB_QUESTIONS), en prose, sans schema.
   ===================================================================== */
import { SALLE, NETWORK } from "./data.js?v=b58";
import { TIMELINE, SPECS, CLUB_QUESTIONS } from "./data-club.js?v=b58";

const gsap = window.gsap;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);

function renderTimeline() {
  $("#timeline").innerHTML = TIMELINE.map(
    (t) => `<li class="tl" data-reveal>
      <span class="tl__y">${t.y}</span>
      <div><h3 class="tl__t">${t.t}</h3><p class="tl__d">${t.d}</p></div>
    </li>`
  ).join("");
}

function renderSpecs() {
  $("#specs").innerHTML = SPECS.map(
    (s) => `<div class="spec"><span class="spec__l">${s.l}</span><span class="spec__v">${s.v}</span></div>`
  ).join("");
}

/* /le-club/ ne redit pas /contact/ : une ligne d’adresse, et le reste est
   là-bas. Avant, les deux pages posaient la MÊME grille contact avec les
   MÊMES ids (#addr/#access/#hours/#phone). */
function renderContact() {
  const a = $("#addr");
  if (a) { a.textContent = SALLE.address.full; a.href = SALLE.mapsLink; }
  const map = $("#map");
  if (map) map.src = SALLE.mapsUrl;
}

/* Les questions du LIEU — différentes de la FAQ de /contact/, et rendues
   en prose : une page « visite » répond en marchant, elle ne fait pas
   déplier un accordéon. Aucun FAQPage ici (une seule FAQPage par site). */
function renderAsks() {
  const box = $("#asks");
  if (!box) return;
  box.innerHTML = CLUB_QUESTIONS.map(
    (f) => `<article class="ask">
      <h3 class="ask__q">${f.q}</h3>
      <p class="ask__a">${f.a}</p>
    </article>`
  ).join("");
}

function renderNetwork() {
  $("#network").innerHTML = NETWORK.map(
    (n) => `<a class="net" href="${n.url}" target="_blank" rel="noopener">
      <span class="net__tag">${n.tag}</span>
      <div>
        <h3 class="net__name">${n.name}${n.flagship ? '<span class="flag">★ vaisseau amiral</span>' : ""}</h3>
        <p class="net__feat">${n.feat}</p>
      </div>
      <span class="net__go">${n.go} <span aria-hidden="true">↗</span></span>
    </a>`
  ).join("");
}

function headIntro() {
  document.querySelectorAll(".club-head [data-reveal], .club-head .reveal-mask").forEach((el) => (el.dataset.revBound = "1"));
  if (reduce || !gsap) return;
  const masks = document.querySelectorAll(".club-head .reveal-mask > span");
  const fades = document.querySelectorAll(".club-head [data-reveal]");
  gsap.set(masks, { yPercent: 110, opacity: 0 });
  gsap.set(fades, { opacity: 0, y: 28 });
  gsap.set(".club-head__media", { scale: 1.18, filter: "brightness(.3)" });
  gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } })
    .to(".club-head__media", { scale: 1, filter: "brightness(1)", duration: 2, ease: "power2.out" }, 0)
    .to(masks, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "power4.out" }, 0.3)
    .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.7);
  gsap.to(".club-head__media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".club-head", start: "top top", end: "bottom top", scrub: true } });
}

function ambianceParallax() {
  if (reduce || !gsap) return;
  gsap.to(".ambiance__media", { yPercent: 16, ease: "none", scrollTrigger: { trigger: ".ambiance", start: "top bottom", end: "bottom top", scrub: true } });
}

function boot() {
  renderTimeline(); renderSpecs(); renderContact(); renderAsks(); renderNetwork();
  window.BC.media(document);
  headIntro();
  window.BC.reveal(document);
  window.BC.magnetic(document);
  ambianceParallax();
  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
