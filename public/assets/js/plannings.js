/* =====================================================================
   MINIMES · plannings.js — "Le planning"
   STANDARDS §3 exige DEUX choses sur cette page : le poster officiel en
   couleur, cliquable — ET « une grille HTML utilisable (filtres jour /
   discipline / coach depuis data.js) ». La grille n’existait pas : toute
   la semaine était enfermée dans un PNG de 2 Mo — illisible pour Google,
   pour un lecteur d’écran et pour un téléphone bridé, et impossible à
   filtrer. Ce module la rend.

   Source : PLANNING + PLANNING_FREE (data.js) ← transcription du poster
   SAISON 2026-2027, recollationnée cellule par cellule sur le PNG.
   Aucun créneau, aucun nom de coach n’est tapé dans le HTML (§0.10) :
   si Chloé quitte la salle, elle disparaît de la page en une ligne de data.

   Trois choses que la grille ne faisait pas et qui manquaient :
   1. L’ACCÈS LIBRE — la moitié du poster — n’apparaissait nulle part.
   2. Les liens « voir les créneaux » des autres pages arrivaient ici sans
      filtre : on promettait « ses créneaux » et on livrait la semaine
      entière. La grille lit maintenant ?disc= / ?jour= et
      écrit l’état dans l’URL (partageable, revenable au bouton Retour).
   3. Rien ne disait où on en est MAINTENANT dans la semaine.
   ===================================================================== */
import { SEASON_LABEL } from "./data.js?v=b58";
import {
  PLANNING,
  PLANNING_FREE,
  PLANNING_DAYS,
  PLANNING_DISCIPLINES,
  PLANNING_KEYS,
} from "./data-planning.js?v=b58";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* "18h30" → 1110. Une seule conversion, partout : le tri, le marqueur
   « en ce moment » et la durée en dépendent tous. Écrire les minutes à la
   main dans data.js aurait été une deuxième source de vérité à maintenir. */
const mins = (h) => {
  const [a, b] = String(h).split("h");
  return Number(a) * 60 + Number(b || 0);
};

/* état des trois filtres — "all" = tout */
const state = { d: "all", disc: "all" };

/* Le nom du coach ne sort plus du planning : ni sur les créneaux, ni en
   filtre, ni dans l’URL. La donnée reste dans data-planning.js (elle sert
   à l’exploitation), elle n’est simplement plus publiée. */

/* « Accès libre » est un filtre à part entière côté page, mais PAS une
   discipline dans data.js : ce n’est pas un cours, il n’a pas de coach.
   On l’ajoute ici, au bout, là où l’utilisateur le cherche. */
const FILTER_DISCIPLINES = [...PLANNING_DISCIPLINES, { key: "libre", label: "Accès libre" }];

const labelOf = (key) => (FILTER_DISCIPLINES.find((d) => d.key === key) || {}).label || key;

/* --------------------------- URL ↔ ÉTAT ----------------------------
   Les valeurs sont validées contre les données : un ?disc=Dupont
   inventé (ou périmé) ne doit pas vider la grille en silence, il doit
   être ignoré comme s’il n’était pas là. */
function readURL() {
  const q = new URLSearchParams(location.search);
  const day = q.get("jour");
  const disc = q.get("disc");
  if (day && PLANNING_DAYS.some((d) => d.toLowerCase() === day.toLowerCase())) {
    state.d = PLANNING_DAYS.find((d) => d.toLowerCase() === day.toLowerCase());
  }
  if (disc && FILTER_DISCIPLINES.some((d) => d.key === disc)) state.disc = disc;
}

function writeURL() {
  const q = new URLSearchParams();
  if (state.d !== "all") q.set("jour", state.d.toLowerCase());
  if (state.disc !== "all") q.set("disc", state.disc);
  const qs = q.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

/* ------------------------------ FILTRES ---------------------------- */
function chipRow(group, items, allLabel) {
  return (
    `<button class="pl-chip${state[group] === "all" ? " is-on" : ""}" type="button" role="radio" aria-checked="${state[group] === "all"}" data-group="${group}" data-val="all">${allLabel}</button>` +
    items
      .map(
        (it) =>
          `<button class="pl-chip${state[group] === it.val ? " is-on" : ""}" type="button" role="radio" aria-checked="${state[group] === it.val}" data-group="${group}" data-val="${it.val}">${it.label}</button>`
      )
      .join("")
  );
}

function renderFilters() {
  const box = $("#pl-filters");
  if (!box) return;
  box.innerHTML = `
    <div class="pl-fgroup" role="radiogroup" aria-label="Filtrer par jour">
      <span class="pl-fgroup__l">Jour</span>
      <div class="pl-fgroup__row">${chipRow("d", PLANNING_DAYS.map((d) => ({ val: d, label: d })), "Toute la semaine")}</div>
    </div>
    <div class="pl-fgroup" role="radiogroup" aria-label="Filtrer par discipline">
      <span class="pl-fgroup__l">Discipline</span>
      <div class="pl-fgroup__row">${chipRow("disc", FILTER_DISCIPLINES.map((d) => ({ val: d.key, label: d.label })), "Toutes")}</div>
    </div>
    </div>`;
}

/* ------------------------------ GRILLE -----------------------------
   Six colonnes-jour au bureau, six sections empilées sur téléphone.
   Structure sémantique (h3 + ul) plutôt qu’un <table> : une semaine de
   boxe n’est pas un tableau de données croisées, et six colonnes à 375px
   sont illisibles. Chaque créneau porte ses data-* pour le filtre — et
   son texte reste indexable, contrairement au poster.

   Les bandes d’ACCÈS LIBRE sont mêlées aux cours et triées avec eux : sur
   le poster elles occupent la moitié de la grille, et c’est l’info qui
   fait venir la moitié des adhérents. */
function slotHTML(s) {
  const free = s.free === true;
  const dur = `${s.h}<i>–${s.end}</i>`;
  const meta = free
    ? `<span class="pl-slot__m">Sans réservation${s.space ? ` · Espace ${s.space}` : ""}</span>`
    : `<span class="pl-slot__m">${s.age}${s.space ? ` · Espace ${s.space}` : ""}</span>`;
  return `<li class="pl-slot${free ? " pl-slot--free" : ""}"
      data-day="${s.d}" data-disc="${free ? "libre" : s.disc}"
      data-start="${mins(s.h)}" data-end="${mins(s.end)}">
      <span class="pl-slot__h">${dur}</span>
      <span class="pl-slot__n">${free ? "Accès libre" : s.name}</span>
      ${meta}
    </li>`;
}

function renderGrid() {
  const box = $("#pl-grid");
  if (!box) return;
  const all = [
    ...PLANNING.map((s) => ({ ...s, free: false })),
    ...PLANNING_FREE.map((s) => ({ ...s, free: true })),
  ];
  box.innerHTML = PLANNING_DAYS.map((day) => {
    const slots = all.filter((s) => s.d === day).sort((a, b) => mins(a.h) - mins(b.h) || (a.free ? 1 : -1));
    /* ⚠ le compteur du bandeau est VIDE au rendu : il est écrit par
       apply(), depuis les créneaux réellement retenus par le filtre.
       Le figer ici, une fois, sur la semaine entière, c’était afficher
       « MERCREDI · 6 COURS » au-dessus de deux créneaux — et parfois
       au-dessus de « Rien ce jour-là ». */
    return `<section class="pl-day" data-day="${day}">
      <h3 class="pl-day__h">${day}<i data-count></i></h3>
      <ul class="pl-day__list">${slots.map(slotHTML).join("")}</ul>
      <p class="pl-day__empty">Rien ce jour-là avec ce filtre.</p>
    </section>`;
  }).join("");
}

/* --------------------- « EN CE MOMENT » / « APRÈS » -----------------
   Calculé à l’exécution depuis l’horloge du visiteur — donc jamais une
   date en dur dans le markup (§0.3 anti-péremption). Purement additif :
   si le JS ne tourne pas, la grille reste juste et complète, elle perd
   seulement ce repère. Marque le créneau en cours, sinon le suivant. */
function markNow() {
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7; // 0 = lundi
  const today = PLANNING_DAYS[dayIdx];   // undefined le dimanche → salle fermée
  const t = now.getHours() * 60 + now.getMinutes();

  $$(".pl-slot").forEach((el) => el.classList.remove("is-now", "is-next"));
  const badge = $("#pl-now");
  if (!badge) return;

  if (!today) {
    badge.innerHTML = `<b>Dimanche</b> — la salle est fermée. On rouvre lundi à 10h.`;
    return;
  }

  const todaySlots = $$(`.pl-slot[data-day="${today}"]`);
  /* ⚠ lundi, mardi et jeudi de 18h30 à 19h30, DEUX cours tournent en
     parallèle (les espaces 1 et 2 du poster). Un `find` n’en montrait
     qu’un et faisait disparaître le Boxing Lady derrière les
     compétiteurs — précisément le cours qu’une visiteuse cherche. */
  const live = todaySlots.filter((el) => t >= +el.dataset.start && t < +el.dataset.end);
  const liveCours = live.filter((el) => !el.classList.contains("pl-slot--free"));
  const next = todaySlots.find((el) => +el.dataset.start > t);

  if (live.length) {
    live.forEach((el) => el.classList.add("is-now"));
    const shownSet = liveCours.length ? liveCours : live;
    const names = [...new Set(shownSet.map((el) => el.querySelector(".pl-slot__n").textContent))];
    const end = shownSet[0].querySelector(".pl-slot__h i").textContent.replace("–", "");
    badge.innerHTML = `<b>En ce moment</b> · ${names.join(" + ")} — jusqu’à ${end}`;
  } else if (next) {
    next.classList.add("is-next");
    badge.innerHTML = `<b>Prochain créneau</b> · ${next.querySelector(".pl-slot__n").textContent} à ${next.querySelector(".pl-slot__h").firstChild.textContent}`;
  } else {
    badge.innerHTML = `<b>C’est fini pour aujourd’hui</b> — la salle rouvre demain à 10h.`;
  }
}

/* ------------------------------ FILTRAGE ----------------------------
   UN SEUL prédicat pour tout ce qui compte des créneaux : ce qu’on
   affiche, ce que dit le bandeau du jour, ce que dit le rail de la
   semaine. Chaque compteur calculé à côté du filtre finit par mentir —
   c’était le cas du bandeau, figé au rendu sur la semaine entière.
   `ignoreDay` sert au rail : il RESTE le sélecteur de jour, il doit donc
   montrer les six jours même quand un jour est sélectionné. */
function matches(el, { ignoreDay = false } = {}) {
  return (
    (ignoreDay || state.d === "all" || el.dataset.day === state.d) &&
    (state.disc === "all" || el.dataset.disc === state.disc)
  );
}

/* « 4 cours » quand ce sont des cours, « 3 accès libre » quand ce sont
   des bandes, les deux quand il y a les deux, et RIEN quand il n’y a
   rien — un « 0 » au-dessus de « Rien ce jour-là » est du bruit. */
function countLabel(cours, free) {
  const parts = [];
  if (cours) parts.push(`${cours} cours`);
  if (free) parts.push(`${free} accès libre`);
  return parts.join(" · ");
}

function apply() {
  let shown = 0;
  let shownFree = 0;
  $$(".pl-day").forEach((dayEl) => {
    const dayOk = state.d === "all" || dayEl.dataset.day === state.d;
    let visibleInDay = 0;
    let freeInDay = 0;
    $$(".pl-slot", dayEl).forEach((s) => {
      const ok = matches(s);
      s.classList.toggle("is-hidden", !ok);
      if (ok) {
        visibleInDay++;
        if (s.classList.contains("pl-slot--free")) freeInDay++;
      }
    });
    /* le compteur est écrit ICI, après le filtre, depuis ce qui vient
       d’être rendu visible — jamais depuis PLANNING complet */
    const tag = $("[data-count]", dayEl);
    if (tag) tag.textContent = countLabel(visibleInDay - freeInDay, freeInDay);
    dayEl.classList.toggle("is-empty", visibleInDay === 0);
    dayEl.classList.toggle("is-hidden", !dayOk);
    shown += visibleInDay;
    shownFree += freeInDay;
  });
  syncWeek();

  /* compteur en région live : au clavier et au lecteur d’écran, sans lui,
     rien ne dit que le filtre a changé quoi que ce soit */
  /* « 43 créneaux » mélangeait 27 cours encadrés et 16 bandes d’accès
     libre sous un seul mot — c’est exactement la confusion que la page
     est censée lever. On compte les deux séparément. */
  const out = $("#pl-count");
  if (out) {
    const bits = [];
    if (state.disc !== "all") bits.push(labelOf(state.disc));
    if (state.d !== "all") bits.push(state.d.toLowerCase());
    const cours = shown - shownFree;
    const parts = [];
    if (cours) parts.push(`${cours} cours`);
    if (shownFree) parts.push(`${shownFree} bande${shownFree > 1 ? "s" : ""} d’accès libre`);
    out.textContent =
      shown === 0
        ? "Aucun créneau avec ce filtre — enlève-en un."
        : `${parts.join(" · ")}${bits.length ? " · " + bits.join(" · ") : " sur la semaine"}`;
  }

  /* le bouton « tout voir » n’existe que quand il sert à quelque chose */
  const reset = $("#pl-reset");
  if (reset) reset.hidden = state.d === "all" && state.disc === "all";

  writeURL();
  window.BC.refresh();
}

function initFilters() {
  $$(".pl-chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      const g = btn.dataset.group;
      $$(`.pl-chip[data-group="${g}"]`).forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", String(on));
      });
      state[g] = btn.dataset.val;
      apply();
    })
  );
  const reset = $("#pl-reset");
  if (reset)
    reset.addEventListener("click", () => {
      state.d = state.disc = "all";
      $$(".pl-chip").forEach((b) => {
        const on = b.dataset.val === "all";
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", String(on));
      });
      apply();
    });
}

/* Le rail de la semaine — la structure PROPRE à cette page (les 5 autres
   sous-pages partagent .page-head, chacune avec son objet à elle : ici la
   semaine comme forme, une barre par créneau). Dérivé de PLANNING : il ne
   peut pas mentir sur le nombre de cours. Cliquable : c’est le raccourci
   « montre-moi juste mercredi ». */
function renderWeek() {
  const box = $("#pl-week");
  if (!box) return;
  /* barres et compte laissés VIDES : même règle que le bandeau de jour,
     c’est syncWeek() qui les écrit depuis le filtre courant. */
  box.innerHTML = PLANNING_DAYS.map(
    (day) => `<button class="pl-week__d" type="button" data-day="${day}" aria-label="Voir uniquement le ${day.toLowerCase()}">
      <span class="pl-week__n">${day.slice(0, 3)}</span>
      <span class="pl-week__bar" aria-hidden="true"></span>
      <span class="pl-week__c"></span>
    </button>`
  ).join("");
  $$(".pl-week__d", box).forEach((b) =>
    b.addEventListener("click", () => {
      const day = b.dataset.day;
      state.d = state.d === day ? "all" : day;
      $$('.pl-chip[data-group="d"]').forEach((c) => {
        const on = c.dataset.val === state.d;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-checked", String(on));
      });
      apply();
      $("#pl-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );
}

/* Le rail suit le filtre discipline — pas le filtre jour, dont il
   est le sélecteur. « Mer · 6 cours » au-dessus d’un mercredi filtré à 2
   créneaux, c’est la même erreur que le bandeau, un cran plus haut :
   corrigée à la même source, le prédicat matches(). */
function syncWeek() {
  const box = $("#pl-week");
  if (!box) return;
  $$(".pl-week__d", box).forEach((btn) => {
    const day = btn.dataset.day;
    const kept = $$(`.pl-slot[data-day="${day}"]`).filter((s) => matches(s, { ignoreDay: true }));
    const free = kept.filter((s) => s.classList.contains("pl-slot--free")).length;
    const bar = $(".pl-week__bar", btn);
    if (bar) bar.innerHTML = kept.map(() => "<i></i>").join("");
    /* le rail est étroit — six boutons sur 375px : le même compte, mais
       empilé sur deux lignes plutôt qu’étalé, sinon la semaine passe de
       deux rangées à trois sur téléphone. Même chiffres, autre mise en
       forme : jamais un autre calcul. */
    const cours = kept.length - free;
    const c = $(".pl-week__c", btn);
    if (c)
      c.innerHTML =
        (cours ? `<span>${cours} cours</span>` : "") +
          (free ? `<span class="pl-week__f">${free} libre</span>` : "") || "<span>rien</span>";
    btn.classList.toggle("is-empty", kept.length === 0);
    btn.setAttribute("aria-pressed", String(state.d === day));
  });
}

/* les repères — rendus depuis data.js, jamais tapés dans le markup */
function renderKeys() {
  const box = $("#reperes");
  if (!box) return;
  box.innerHTML = PLANNING_KEYS.map(
    (v) => `<div class="value"><span class="value__n">${v.n}</span><div><h3 class="value__t">${v.t}</h3><p class="value__d">${v.d}</p></div></div>`
  ).join("");
}

function boot() {
  const season = document.getElementById("season");
  if (season) season.textContent = SEASON_LABEL;   // anti-péremption §4

  readURL();
  renderWeek();
  renderFilters();
  renderGrid();
  renderKeys();
  initFilters();
  apply();
  markNow();
  /* la salle bouge toutes les heures, pas toutes les secondes */
  setInterval(markNow, 60000);

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);
  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
