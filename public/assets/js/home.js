/* =====================================================================
   MINIMES · home.js (v2) — kinetic accueil
   ===================================================================== */
import { STATS, VALUES, AUDIENCES, TARIFS } from "./data-accueil.js?v=b58";
import { prixGrand } from "./data.js?v=b58";
import { DISCIPLINES } from "./data-disciplines.js?v=b58";
import { initHero } from "./hero.js?v=b58";
import { initRounds } from "./rounds.js?v=b58";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);

/* --------------------------- RENDER ------------------------------- */
function renderStats() {
  /* Garde de montage : la refonte reconfigure les sections de l'accueil.
     Un rendu qui suppose que sa cible existe fait tomber TOUT le module
     (donc les animations suivantes) a la premiere section retiree. */
  if (!$("#stats")) return;
  $("#stats").innerHTML = STATS.map(
    (s) => `<div class="stat${isNaN(parseFloat(s.v)) ? " stat--mot" : ""}" data-reveal>
      <div class="stat__v"><span data-count="${s.v}" ${s.raw ? "data-raw" : ""}>${s.raw ? s.v : 0}</span>${s.suffix ? `<sup>${s.suffix}</sup>` : ""}</div>
      <div class="stat__l">${s.l}</div>
    </div>`
  ).join("");
}
function renderMarquee() {
  /* ⚠ des faits, pas une liste de mots-clés : « Boxe Anglaise · Boxe
     Éducative · Boxing Lady… » aurait pu être collé sur n’importe quelle
     salle de France, dans l’élément le plus cinétique de la page.
     « Le ring ne ment jamais » vit UNE fois sur le site, à index.html —
     ne pas le remonter ici (§5.9). */
  const items = ["Le noble art", "Depuis 2016", "Plusieurs rings", "Dès 3 ans", "Barrière de Paris", "Douze sacs", "École de boxe", "Le berceau"];
  const row = items.map((i) => `<span>${i}</span>`).join("");
  const t = $("#marquee"); if (!t) return; t.innerHTML = row + row; t.dataset.speed = "1.3";
}
/* Le Mur des Champions est retire — decision du boss du 19/08 :
   « les boxeurs, toute la section ». Le conteneur #berceau-stage avait
   deja disparu de la refonte ; on retire code et donnees pour qu'il ne
   revienne pas par accident. */
function renderDisciplines() {
  /* ⚠ `d.teaser`, PAS `d.desc` : le texte long est celui de /activites/.
     Les deux pages lisaient le même champ — dix-sept lignes de copie
     travaillée servies mot pour mot sur deux URL indexées. L’accueil
     aiguille en une ligne, le catalogue développe. Pas de repli sur
     `desc` : une discipline sans teaser sort SANS ligne plutôt que de
     rouvrir le doublon en silence.

     ⚠ `data-img="${d.img}"` avec d.img = null écrivait la chaîne "null"
     dans l’attribut : hydrateMedia ne la reconnaît pas comme chemin local
     et la préfixe du domaine Portet → une requête vers /null qui répond
     403, en console, sur la page d’accueil. Une discipline sans photo
     (loi §0.10 : on n’illustre pas un geste avec un autre) doit sortir
     SANS bloc media, pas avec un bloc media cassé. */
  if (!$("#disciplines")) return;
  $("#disciplines").innerHTML = DISCIPLINES.map(
    (d, i) => `<div class="disc${d.img ? "" : " disc--nobg"}" data-key="${d.key}" tabindex="0">
      ${d.img ? `<div class="disc__bg media"${d.focus ? ` style="--disc-focus:${d.focus}"` : ""} data-img="${d.img}" aria-hidden="true"></div>` : ""}
      <div class="disc__row">
        <span class="disc__idx">${String(i + 1).padStart(2, "0")}</span>
        <span class="disc__name">${d.name}</span>
        <span class="disc__tag">${d.tag}</span>
      </div>
      ${d.teaser ? `<p class="disc__desc">${d.teaser}</p>` : ""}
    </div>`
  ).join("");
}
function renderValues() {
  if (!$("#values")) return;
  $("#values").innerHTML = VALUES.map(
    (v) => `<div class="value"><span class="value__n">${v.n}</span><div><h3 class="value__t">${v.t}</h3><p class="value__d">${v.d}</p></div></div>`
  ).join("");
}
function renderWhoFor() {
  const stage = $("#whofor-stage"), rail = $("#whofor-rail");
  if (!stage) return;
  stage.innerHTML = AUDIENCES.map((a, i) => `
    <article class="who ${i === 0 ? "is-active" : ""}" data-i="${i}">
      <div class="who__media media" data-img="${a.img}" aria-hidden="true"></div>
      <div class="who__body">
        <span class="who__idx">${String(i + 1).padStart(2, "0")} <i>/ 0${AUDIENCES.length}</i> · ${a.tag}</span>
        <h3 class="who__t">${a.t}</h3>
        <p class="who__d">${a.d}</p>
      </div>
    </article>`).join("");
  if (rail) rail.innerHTML = AUDIENCES.map((a, i) => `<li class="who__tick ${i === 0 ? "is-active" : ""}" data-i="${i}"><span>${String(i + 1).padStart(2, "0")}</span> ${a.t}</li>`).join("");
}

/* Scroll-jacked "Pour qui": as you scroll the pinned section, the active
   audience swaps (débutants → femmes → enfants → compétiteurs). */
function whoForScroll() {
  const section = document.querySelector(".whofor");
  const stage = $("#whofor-stage");
  const sticky = document.querySelector(".whofor__sticky");
  if (!section || !stage || !sticky) return;
  const whos = [...stage.querySelectorAll(".who")];
  const ticks = [...document.querySelectorAll("#whofor-rail .who__tick")];
  const n = whos.length;
  let curr = -1;
  const update = () => {
    // only scroll-jack while the CSS pin is active (desktop). On mobile the
    // panels are shown stacked by CSS, so we do nothing.
    if (getComputedStyle(sticky).position !== "sticky") return;
    const vh = sticky.offsetHeight || window.innerHeight || 800; // sticky is 100vh → reliable
    const total = section.offsetHeight - vh;
    if (total <= 0) return;
    const p = Math.min(0.9999, Math.max(0, -section.getBoundingClientRect().top / total));
    const idx = Math.min(n - 1, Math.floor(p * n));
    if (idx !== curr) {
      curr = idx;
      whos.forEach((w, i) => w.classList.toggle("is-active", i === idx));
      ticks.forEach((t, i) => t.classList.toggle("is-active", i <= idx));
    }
  };
  if (window.BC && window.BC.lenis) window.BC.lenis.on("scroll", update);
  else window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}
function renderTarifs() {
  if (!$("#tarifs")) return;
  $("#tarifs").innerHTML = TARIFS.map(
    (t) => `<article class="tarif ${t.highlight ? "tarif--hot" : ""}">
      ${t.badge ? `<span class="tarif__badge">${t.badge}</span>` : ""}
      <h3 class="tarif__name">${t.name}</h3>
      <div class="tarif__price">${prixGrand(t.price)}<small> ${t.period}</small></div>
      <p class="tarif__feature">${t.feature}</p>
      <ul class="tarif__items">${t.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      <a class="btn ${t.highlight ? "btn--primary" : "btn--ghost"}" data-magnetic href="${t.href}"><span>${t.cta}</span></a>
    </article>`
  ).join("");
}

/* ------------------------- CHOREOGRAPHY --------------------------- */
function countUp() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (el.hasAttribute("data-raw")) return;
    const end = +el.dataset.count;
    if (!window.ScrollTrigger || !window.gsap) {
      el.textContent = Math.round(end);
      return;
    }
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.5, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
        const lbl = el.closest(".stat")?.querySelector(".stat__l");
        if (lbl) window.BC.scramble(lbl, { dur: 600 });
      },
    });
  });
}

/* Mur des champions — scroll-driven silhouette reveal. As you scroll the
   pinned section, one real boxer cut-out rises in as the previous exits
   (Portet’s berceau idea, restyled). Live geometry; vh from the 100vh pin. */
function berceauReveal() {
  const section = document.querySelector(".berceau");
  const stage = $("#berceau-stage");
  const sticky = document.querySelector(".berceau__sticky");
  if (!section || !stage || !sticky) return;
  const figs = [...stage.querySelectorAll(".berceau__fig")];
  const ticks = [...document.querySelectorAll("#berceau-rail .berceau__tick")];
  const n = figs.length;
  let curr = -1;
  const update = () => {
    if (getComputedStyle(sticky).position !== "sticky") return; // mobile = stacked
    const vh = sticky.offsetHeight || window.innerHeight || 800;
    const total = section.offsetHeight - vh;
    if (total <= 0) return;
    const p = Math.min(0.9999, Math.max(0, -section.getBoundingClientRect().top / total));
    const idx = Math.min(n - 1, Math.floor(p * n));
    if (idx !== curr) {
      curr = idx;
      figs.forEach((f, i) => f.classList.toggle("is-active", i === idx));
      ticks.forEach((t, i) => t.classList.toggle("is-active", i <= idx));
    }
  };
  if (window.BC && window.BC.lenis) window.BC.lenis.on("scroll", update);
  else window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* Photos "develop" in as they enter (safe: fromTo always ends visible). */
function mediaReveal() {
  if (reduce) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const img = e.target.querySelector("img");
      if (img) gsap.fromTo(img, { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity" });
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".gallery__cell, .feature__media").forEach((t) => io.observe(t));
}

/* Multi-depth parallax on decorative backgrounds — the "moving camera"
   feel. Live geometry (Portet’s technique); bg’s are scaled so no gaps. */
function parallax() {
  if (reduce) return;
  const items = [];
  document.querySelectorAll(".palmares__bg").forEach((el) => items.push({ el, amt: 40, scale: 1.14 }));
  document.querySelectorAll(".gong__bg").forEach((el) => items.push({ el, amt: 55, scale: 1.14 }));
  if (!items.length) return;
  let ticking = false;
  const apply = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) continue;
      const prog = (r.top + r.height / 2 - vh / 2) / vh;
      const y = (-prog * it.amt).toFixed(1);
      it.el.style.transform = it.scale !== 1 ? `translate3d(0,${y}px,0) scale(${it.scale})` : `translate3d(0,${y}px,0)`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
  if (window.BC && window.BC.lenis) window.BC.lenis.on("scroll", onScroll);
  else window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  apply();
}

/* ------------------------------ BOOT ------------------------------ */
function boot() {
  renderStats(); renderMarquee();
  renderDisciplines(); renderValues(); renderWhoFor(); renderTarifs();

  window.BC.media(document);
  initHero();
  window.BC.reveal(document);
  window.BC.magnetic(document);

  countUp();
  berceauReveal();
  initRounds();
  mediaReveal();
  parallax();
  whoForScroll();

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
