/* =====================================================================
   MINIMES · site.js (v2) — chrome + heavy motion engine
   window.BC = { reveal, magnetic, refresh, media, split, scramble,
                 initKinetics, faq, lenis, velocity }
   ===================================================================== */
import { NAV, LINKS, SALLE, MEDIA, CTA, CTA_HREF, NETWORK, PROMOS } from "./data.js?v=b56";
import { initPlaces } from "./places.js?v=b56";
/* L’assistant : il promeut la pastille `.chatbot` (qui reste un lien tel:
   dans le HTML) en vraie conversation. Voir armChatbot() plus bas — le
   module ne descend QU’À l’intention de parler, jamais au premier rendu. */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
if (!gsap) document.documentElement.classList.remove("fx");

let lenis = null;
let velocity = 0;          // smoothed scroll velocity (shared)

/* ----------------------------- NAV / MENU ------------------------- */
function currentPath() {
  let p = location.pathname.replace(/index\.html$/, "");
  if (!p.endsWith("/")) p += "/";
  return p;
}
/* Icône de lien sortant — un seul tracé, partout où on quitte le domaine.
   Le visiteur doit voir qu’il change de site AVANT de cliquer. */
const EXT = `<svg class="ext" width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/* Maillage de marque VOULU : les liens vers le réseau propriétaire ne
   sont PAS en nofollow (ce serait saborder notre propre maillage).
   target=_blank impose rel="noopener" — sécurité, pas SEO. */
const extLink = (href, label, cls = "") =>
  `<a${cls ? ` class="${cls}"` : ""} href="${href}" target="_blank" rel="noopener">${label} ${EXT}</a>`;

function mountNav() {
  const path = currentPath();
  const links = NAV.filter((n) => n.top !== false).map(
    (n) => `<a href="${n.href}"${n.href === path ? ' aria-current="page"' : ""}>${n.label}</a>`
  ).join("");
  document.getElementById("nav").innerHTML = `
    <nav class="nav" id="site-nav">
      <a class="nav__brand" href="/" aria-label="Boxing Center Minimes — accueil">
        <img class="nav__logo" src="/assets/img/logo.png" alt="" width="342" height="160" />
        <span class="nav__salle">Minimes</span>
      </a>
      <div class="nav__links">${links}</div>
      <div class="nav__right">
        <div class="nav__ext">
          ${extLink(LINKS.groupe, "Le groupe")}
          ${extLink(LINKS.boutique, "Boutique")}
        </div>
        <a class="btn btn--primary nav__cta" data-magnetic href="${CTA_HREF.primary}"><span>${CTA.chrome}</span></a>
        <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </nav>`;

  const menuLinks = NAV.map(
    (n, i) => `<a class="menu__link" href="${n.href}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${n.label}</a>`
  ).join("");
  document.getElementById("drawer").innerHTML = `
    <div class="menu" id="menu" aria-hidden="true">
      <div class="menu__bg" aria-hidden="true"><video data-video-defer data-video="/assets/media/clip-mats.mp4" data-poster="/assets/img/photos/salle-plongee-1200.webp" muted loop playsinline></video></div>
      <div class="menu__top">
        <a class="nav__brand" href="/" aria-label="Boxing Center Minimes — accueil">
          <img class="nav__logo" src="/assets/img/logo.png" alt="" width="342" height="160" />
          <span class="nav__salle">Minimes</span>
        </a>
        <button class="menu__close" id="menu-close">Fermer <span aria-hidden="true">✕</span></button>
      </div>
      <nav class="menu__nav">${menuLinks}</nav>
      <div class="menu__foot">
        <a class="btn btn--primary" data-magnetic href="${CTA_HREF.primary}"><span>${CTA.primary}</span></a>
        <a class="btn btn--ghost" data-magnetic href="${CTA_HREF.second}"><span>${CTA.second}</span></a>
        <div style="display:flex;gap:1.4rem;flex-wrap:wrap">
          ${extLink(LINKS.groupe, "Le groupe")}
          ${extLink(LINKS.boutique, "Boutique")}
          ${extLink(LINKS.instagram, "Instagram")}
          <a href="tel:${SALLE.phoneHref}">${SALLE.phone}</a>
        </div>
      </div>
    </div>`;

  const nav = document.getElementById("site-nav");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  const items = menu.querySelectorAll(".menu__link");
  const setOpen = (open) => {
    if (open) armMenuBg();
    document.documentElement.classList.toggle("is-menu-open", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("is-locked", open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (gsap && !reduce) {
      if (open) gsap.fromTo(items, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.06, delay: 0.18 });
    }
  };
  /* La texture du menu descend à l’INTENTION d’ouvrir, jamais avant : la
     souris qui arrive sur le burger, le focus clavier, le doigt qui se
     pose. Ces trois signaux précèdent le clic, donc le poster est déjà là
     quand le panneau s’ouvre (l’animation d’entrée dure 0,18 s + 0,7 s).
     Si aucun ne passe — ouverture programmée — setOpen l’arme lui-même :
     jamais de fond vide, jamais de trou noir. */
  let bgArmed = false;
  const armMenuBg = () => {
    if (bgArmed) return; bgArmed = true;
    menu.querySelectorAll("video[data-video-defer]").forEach((v) => v.removeAttribute("data-video-defer"));
    hydrateMedia(menu);
  };
  ["pointerenter", "focus", "pointerdown", "touchstart"].forEach((ev) =>
    burger.addEventListener(ev, armMenuBg, { once: true, passive: true })
  );

  burger.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
  document.getElementById("menu-close").addEventListener("click", () => setOpen(false));
  menu.querySelectorAll(".menu__link, .menu__foot a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // scroll state: hide on down, show on up, solid bg after hero
  let last = 0;
  ScrollTrigger?.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 80);
      if (y > last && y > 400 && !menu.classList.contains("is-open")) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
      last = y;
    },
  });
}

function mountFooter() {
  const cols = [
    { h: "Le club", links: NAV.slice(1, 5) },
    /* « Première fois » ouvre la colonne Pratique : c’est la question que
       se pose le visiteur avant l’horaire et avant le prix. */
    { h: "Pratique", links: [{ href: "/premiere-seance/", label: "Ta première séance" }, { href: "/plannings/", label: "Planning" }, { href: "/tarifs/", label: "Tarifs" }, { href: "/contact/", label: "Contact" }, { href: LINKS.boutique, label: "Boutique", ext: true }] },
    { h: "Le réseau", links: [{ href: LINKS.groupe, label: "Boxing Center", ext: true }, { href: LINKS.boutique, label: "La boutique", ext: true }, { href: LINKS.instagram, label: "Instagram", ext: true }, { href: LINKS.facebook, label: "Facebook", ext: true }] },
  ];
  /* Les salles sœurs — le bloc réseau existait en données et n’était
     rendu nulle part. `go` dit la VÉRITÉ sur la destination : tant qu’une
     salle n’a pas son domaine en ligne, on n’écrit pas « Découvrir » sur
     un lien qui atterrit sur la home du groupe. */
  const salles = NETWORK.map((s) => `
    <a class="netcard" href="${s.url}" target="_blank" rel="noopener">
      <span class="netcard__tag">${s.tag}</span>
      <span class="netcard__name">${s.name}</span>
      <span class="netcard__feat">${s.feat}</span>
      <span class="netcard__go">${s.go} ${EXT}</span>
    </a>`).join("");
  document.getElementById("footer").innerHTML = `
    <footer class="footer">
      <div class="wrap">
        <div class="footer__big" data-skew aria-hidden="true">Le berceau des champions</div>
        <div class="footer__grid">
          <div class="footer__col">
            <h4>Boxing Center Minimes</h4>
            <p>${SALLE.address.full}</p>
            <p><a href="tel:${SALLE.phoneHref}">${SALLE.phone}</a></p>
            <p>${SALLE.hours}</p>
            <a class="btn btn--primary" data-magnetic href="${CTA_HREF.primary}" style="margin-top:1rem"><span>${CTA.primary}</span></a>
          </div>
          ${cols.map((c) => `<div class="footer__col"><h4>${c.h}</h4>${c.links.map((l) => l.ext ? extLink(l.href, l.label) : `<a href="${l.href}">${l.label}</a>`).join("")}</div>`).join("")}
        </div>
        <div class="netband">
          <h4 class="netband__h">Les autres salles du réseau</h4>
          <div class="netband__grid">${salles}</div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Boxing Center — Maquette Minimes</span>
          <span>Toulouse · Les Minimes · 31200</span>
        </div>
      </div>
    </footer>`;
}

/* ------------------------------ LENIS ----------------------------- */
function initSmooth() {
  if (reduce || !window.Lenis || !gsap) return;
  lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", (e) => { velocity = e.velocity; ScrollTrigger?.update(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1) {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -80 }); }
    }
  });
}

/* ------------------------------ CURSOR ---------------------------- */
function initCursor() {
  if (window.matchMedia("(hover: none)").matches) return;
  const ring = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor__dot");
  const label = ring?.querySelector(".cursor__label");
  if (!ring) return;
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
  const loop = () => { rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
  loop();
  const sel = "a, button, [data-magnetic], .disc, .value, .tarif";
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest(sel);
    if (t) { ring.classList.add("is-hover"); if (label) label.textContent = t.dataset.cursor || (t.closest(".disc") ? "voir" : "→"); }
  });
  document.addEventListener("mouseout", (e) => { if (e.target.closest(sel)) ring.classList.remove("is-hover"); });
}

/* ----------------------------- MAGNETIC --------------------------- */
function magnetic(scope = document) {
  if (reduce || window.matchMedia("(hover: none)").matches) return;
  scope.querySelectorAll("[data-magnetic]").forEach((el) => {
    if (el.dataset.magBound) return; el.dataset.magBound = "1";
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.4, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.5, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }));
  });
}

/* ----------------------------- SPLIT ------------------------------ */
function split(el) {
  if (el.dataset.splitDone) return [...el.querySelectorAll(".char")];
  el.dataset.splitDone = "1";
  const text = el.textContent;
  el.textContent = "";
  const chars = [];
  [...text].forEach((ch) => {
    const s = document.createElement("span");
    s.className = "char";
    s.textContent = ch === " " ? " " : ch;
    el.appendChild(s); chars.push(s);
  });
  return chars;
}

/* ----------------------------- SCRAMBLE --------------------------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\*";
function scramble(el, opts = {}) {
  if (reduce) return;
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  const dur = opts.dur || 700;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min(1, (ts - start) / dur);
    const reveal = Math.floor(p * final.length);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      out += i < reveal || final[i] === " " ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step); else el.textContent = final;
  };
  requestAnimationFrame(step);
}

/* ----------------------------- REVEAL ----------------------------- */
function reveal(scope = document) {
  if (reduce) { document.documentElement.classList.remove("fx"); return; }
  if (!gsap) return;
  scope.querySelectorAll(".reveal-mask").forEach((m) => {
    const kids = [...m.children];
    if (m.dataset.revBound || !kids.length) return; m.dataset.revBound = "1";
    gsap.set(kids, { yPercent: 110, opacity: 0 });
    gsap.to(kids, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: m, start: "top 90%" } });
  });
  scope.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.dataset.revBound) return; el.dataset.revBound = "1";
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } });
  });
  scope.querySelectorAll("[data-reveal-group]").forEach((g) => {
    const kids = [...g.children];
    if (g.dataset.revBound || !kids.length) return; g.dataset.revBound = "1";
    gsap.set(kids, { opacity: 0, y: 40 });
    gsap.to(kids, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: g, start: "top 88%" } });
  });
}

/* --------------------------- MEDIA HYDRATE ------------------------
   `local()` décide si un chemin est SERVI PAR NOUS ou par le pool photo
   distant (MEDIA). ⚠ Le piège déjà payé : l’exemption ne couvrait que
   /assets, donc /media/clip-mats.mp4 et /img/gym-21.jpg — des fichiers
   LOCAUX — se faisaient préfixer du domaine Portet, qui répond 403 depuis
   l’anti-scraping → une erreur console sur les 8 pages. Une maquette
   Minimes ne dépend JAMAIS du domaine de Portet pour son propre poster. */
const local = (p) => /^(https?:|data:|\/assets|\/media|\/img)/.test(p);

/* ------------------- LES PHOTOS ARRIVENT À L’APPROCHE --------------
   Le défaut mesuré : `new Image()` recevait son `src` AVANT d’entrer
   dans le document. Sur une image détachée, le navigateur part chercher
   le fichier tout de suite — le `loading="lazy"` posé juste après ne
   gouverne plus rien. Résultat sur l’accueil : 20 photos marquées
   « lazy », 20 téléchargées au premier rendu, 571 ko dont la plus haute
   attendait à 3 000 px sous le pli. Un visiteur qui vient lire les
   horaires payait la page entière avant d’avoir lu une ligne.

   On ne se contente pas de remettre l’attribut dans le bon ordre : on
   tient la porte nous-mêmes, avec 1 200 px de marge devant. Une photo
   est donc déjà en route quand elle est encore un écran et demi plus
   bas — elle est peinte bien avant d’entrer dans le champ, et le reveal
   GSAP qui la découvre dure encore 1 s après. Rien ne change à l'œil.

   FILET DEAD-MAN — la règle de la maison : si l’IntersectionObserver
   n’existe pas, ou existe mais ne parle jamais (contextes automatisés,
   impression, moteurs qui rendent la page sans la « regarder »), la
   première salve de callbacks n’arrive pas. On le détecte — un
   observer sain rend TOUJOURS un premier verdict par cible — et on
   sert alors la totalité des photos, en priorité basse, une fois la
   page chargée. Le pire scénario redevient exactement le comportement
   d’avant : tout arrive. Une photo ne peut jamais rester vide. */
let _io = null, _ioAlive = false, _netArmed = false;
const _waiting = new Set();

function _serve(img) {
  if (!img || !img.dataset.src) return;
  const url = img.dataset.src;
  delete img.dataset.src;
  _waiting.delete(img);
  if (_io) _io.unobserve(img);
  /* on repasse en `eager` À L’INSTANT du service : c’est nous la porte,
     le lazy natif n’a plus à ajouter son propre seuil par-dessus. */
  img.loading = "eager";
  img.src = url;
}

/** Sert tout ce qui attend encore — priorité basse, jamais devant le LCP. */
function _serveAll() {
  _waiting.forEach((img) => { img.fetchPriority = "low"; _serve(img); });
}

/* Une photo qu’on vient de RÉAFFICHER n’attend pas le prochain tour de
   l’observer : la galerie filtre en `display:none`, et une vignette qui
   revient doit avoir son image, pas un trou. */
function serveMedia(scope = document) {
  scope.querySelectorAll("img[data-src]").forEach(_serve);
}
/* À l’impression, la page n’est pas « regardée » : on sert tout. */
addEventListener("beforeprint", _serveAll);

function _defer(img) {
  _waiting.add(img);
  if (!("IntersectionObserver" in window)) return _serve(img);
  if (!_io) {
    _io = new IntersectionObserver((entries) => {
      _ioAlive = true;                 // l’observer répond : le filet peut dormir
      entries.forEach((e) => { if (e.isIntersecting) _serve(e.target); });
    }, { rootMargin: "1200px 0px" });
  }
  _io.observe(img);
  if (_netArmed) return; _netArmed = true;
  /* Le filet s’arme une fois, après le chargement complet : s’il n’a
     toujours pas eu signe de vie de l’observer, il sert tout. */
  const arm = () => setTimeout(() => { if (!_ioAlive) _serveAll(); }, 2000);
  if (document.readyState === "complete") arm();
  else addEventListener("load", arm, { once: true });
}

function hydrateMedia(scope = document) {
  scope.querySelectorAll(".media[data-img]").forEach((el) => {
    if (el.dataset.mediaBound) return; el.dataset.mediaBound = "1";
    /* Une <img> déjà posée dans le HTML (galerie cuite au build, pour que
       Google Images ait quelque chose à indexer) : on ne la double pas. */
    if (el.querySelector("img")) return;
    const eager = el.hasAttribute("data-eager");
    const url = (local(el.dataset.img) ? "" : MEDIA) + el.dataset.img;
    const img = document.createElement("img");
    img.alt = el.dataset.label || "";
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    if (eager) img.fetchPriority = "high";
    el.prepend(img);                   // DANS le document d’abord…
    if (eager) img.src = url;          // …le src ensuite, et seulement alors.
    else { img.dataset.src = url; _defer(img); }
  });
  scope.querySelectorAll("video[data-video]").forEach((v) => {
    /* [data-video-defer] : la vidéo existe dans le DOM mais ne part PAS au
       premier rendu. Une seule porteuse aujourd’hui — le fond du menu, une
       texture en opacité .16, grise, à 60 % de luminosité, que 1,8 Mo
       payait sur les 8 pages y compris quand le menu n’était jamais
       ouvert (mesuré : 2 279 904 octets servis sur /tarifs/). Elle part
       maintenant à l’INTENTION d’ouvrir — voir armMenuBg(). */
    if (v.hasAttribute("data-video-defer")) return;
    if (v.dataset.mediaBound) return; v.dataset.mediaBound = "1";
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = true;
    if (v.dataset.poster) v.poster = (local(v.dataset.poster) ? "" : MEDIA) + v.dataset.poster;
    /* [data-video-mobile] : sur téléphone on sert une copie plus petite.
       Le hero pesait 1 171 Ko servis à tout le monde ; la version mobile en
       fait 382. Le seuil est 820px — au-delà, l'écran est assez large pour
       que la version 1280 se justifie. On lit la largeur UNE fois, avant
       d'affecter le src : changer de source après coup relancerait un
       téléchargement, ce qui coûterait plus que ça ne rapporte. */
    const petit = window.matchMedia("(max-width: 820px)").matches;
    const source = petit && v.dataset.videoMobile ? v.dataset.videoMobile : v.dataset.video;
    v.src = (local(source) ? "" : MEDIA) + source;
    v.load();
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    v.addEventListener("loadeddata", play, { once: true });
    v.addEventListener("canplay", play, { once: true });
    play();
    _pendingVideos.push(v);
  });
}
const _pendingVideos = [];
/* autoplay can be blocked until a gesture — kick all videos on first input */
["pointerdown", "touchstart", "scroll", "keydown"].forEach((ev) =>
  addEventListener(ev, () => _pendingVideos.forEach((v) => { v.muted = true; v.play().catch(() => {}); }), { once: true, passive: true })
);

/* --------------------- VELOCITY: skew + marquees ------------------ */
let kineticsOn = false;
function initKinetics() {
  if (reduce || kineticsOn || !gsap) return; kineticsOn = true;
  const skews = [...document.querySelectorAll("[data-skew]")];
  const tracks = [...document.querySelectorAll(".marquee__track")].map((t) => {
    const dir = t.dataset.dir === "rtl" ? 1 : -1;
    const half = t.scrollWidth / 2 || 1;
    return { el: t, dir, half, x: 0, base: parseFloat(t.dataset.speed || "1") };
  });
  let smooth = 0;
  gsap.ticker.add(() => {
    smooth += (velocity - smooth) * 0.1;
    const sk = gsap.utils.clamp(-7, 7, smooth * 0.35);
    skews.forEach((el) => (el.style.transform = `skewY(${sk * 0.5}deg)`));
    tracks.forEach((m) => {
      m.x += (m.base + Math.abs(smooth) * 0.25) * m.dir;
      if (m.dir < 0 && m.x <= -m.half) m.x += m.half;
      if (m.dir > 0 && m.x >= 0) m.x -= m.half;
      m.el.style.transform = `translateX(${m.x}px) skewX(${gsap.utils.clamp(-6, 6, -smooth * 0.18)}deg)`;
    });
    velocity *= 0.9;
  });
}

const refresh = () => ScrollTrigger?.refresh();

/* ------------------------- FAQ / ACCORDÉON ------------------------
   Deux pages posent des questions : /contact/ (la FAQ canonique, celle
   qui porte le FAQPage) et /tarifs/ (les questions d’argent). Le rendu
   ET le comportement vivent ici, une fois — sinon on maintient deux
   accordéons dont un seul reçoit la prochaine correction d’accessibilité.

   `id` préfixe les identifiants : deux accordéons sur une même page
   auraient des `aria-controls` en collision, et le lecteur d’écran
   ouvrirait la mauvaise réponse.

   Sur ouverture, `max-height` est posé en PIXELS — c’est ce qui rend la
   transition possible (`auto` ne s’anime pas). Mais figée à la valeur
   mesurée, une réponse qui se re-wrappe (rotation du téléphone, zoom
   texte, police système plus grosse) se retrouve tronquée par sa propre
   animation : le dernier paragraphe disparaît sous le pli.
   On relâche donc à `none` AU REDIMENSIONNEMENT, pas sur `transitionend` —
   cet événement ne se déclenche pas de façon fiable (transition annulée,
   onglet en arrière-plan, moteur qui coalesce le changement de style), et
   un filet qui ne tombe que parfois n’est pas un filet. */
let _faqResizeBound = false;
function bindFaqResize() {
  if (_faqResizeBound) return;
  _faqResizeBound = true;
  let t;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      document.querySelectorAll(".faq__item.is-open .faq__a").forEach((a) => (a.style.maxHeight = "none"));
      refresh();
    }, 150);
  });
}

function faq(box, items) {
  if (!box || !items?.length) return;
  bindFaqResize();
  const id = box.id || "faq";
  box.innerHTML = items
    .map(
      (f, i) => `<div class="faq__item">
      <button class="faq__q" type="button" id="${id}-q-${i}" aria-expanded="false" aria-controls="${id}-a-${i}"><span>${f.q}</span><span class="faq__sign" aria-hidden="true"></span></button>
      <div class="faq__a" id="${id}-a-${i}" role="region" aria-labelledby="${id}-q-${i}"><p>${f.a}</p></div>
    </div>`
    )
    .join("");
  box.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      clearTimeout(a._faqT);
      if (open) {
        a.classList.remove("is-closing");
        a.style.maxHeight = a.scrollHeight + "px";
      } else {
        /* `.is-closing` garde le texte VISIBLE le temps du repli — sinon
           il disparaît d’un coup pendant que la boîte, elle, se ferme
           tranquillement. Retiré sur horloge à la fin de l’animation :
           le panneau sort alors vraiment de l’arbre d’accessibilité,
           d’accord avec l’aria-expanded="false" du bouton. */
        a.classList.add("is-closing");
        /* on RE-FIXE la hauteur mesurée avant de retomber à 0 : une
           transition qui part de `none` ne s’anime pas, elle claque. */
        a.style.maxHeight = a.scrollHeight + "px";
        void a.offsetHeight;
        a.style.maxHeight = "0px";
        a._faqT = setTimeout(() => a.classList.remove("is-closing"), 520);
      }
      refresh();
    });
  });
}

/* --------------------------- L’ASSISTANT --------------------------- */
/* Le module de conversation pèse 14 ko : il n’a rien à faire dans le
   premier rendu d’un visiteur qui vient lire les horaires. On l’arme
   ici en trois lignes, et il ne descend QUE sur une intention de
   parler — survol, focus clavier, doigt posé, ou clic.

   La pastille reste un <a href="tel:"> dans le HTML : sans JS elle
   appelle la salle, et si le module tombe (réseau coupé, 404) on
   REPART sur le tel:. Jamais de bouton mort, à aucun moment de la
   chaîne — y compris pendant la seconde de chargement. */
function armChatbot() {
  const launcher = document.querySelector(".chatbot");
  if (!launcher) return;
  let state = "idle";   // idle → loading → ready | failed
  let pending = null;

  const load = () => {
    if (state !== "idle") return pending;
    state = "loading";
    pending = import("./chatbot.js?v=b56")
      .then(() => { state = "ready"; })
      .catch(() => { state = "failed"; });
    return pending;
  };

  /* Pré-chargement à l’intention : au clic, c’est déjà là. */
  ["pointerenter", "focus", "touchstart"].forEach((ev) =>
    launcher.addEventListener(ev, load, { once: true, passive: true }));

  launcher.addEventListener("click", (e) => {
    /* Une fois le module en place, c’est LUI qui pilote la pastille :
       on s’efface pour ne pas doubler l’ouverture. */
    if (state === "ready") return;
    /* Module injoignable : on laisse le tel: partir, comme sans JS. */
    if (state === "failed") return;
    e.preventDefault();
    load().then(() => {
      /* Le module s’est branché sur la pastille pendant l’import :
         on rejoue le clic pour qu’il ouvre le panneau lui-même. */
      if (state === "ready") launcher.click();
      else location.href = launcher.href;   // repli : on appelle la salle
    });
  });
}

/* ================================================================
   L'ASSISTANT SE PRESENTE TOUT SEUL — une fois, au bon moment.

   Une pastille muette dans un coin ne se remarque pas : personne ne
   clique sur ce qu'il n'a pas compris. Le bot se presente donc de
   lui-meme, mais seulement quand le visiteur a montre qu'il lisait
   (il a fait defiler). Jamais a l'arrivee : s'ouvrir sur le nez de
   quelqu'un qui vient d'atterrir, c'est le geste qui fait fermer
   l'onglet.

   POURQUOI UN CLIC SIMULE plutot qu'un appel de fonction : le module
   du bot ne descend qu'a l'intention de parler, et chaque salle a sa
   propre mecanique de chargement. Cliquer la pastille, c'est le chemin
   qu'emprunte un vrai visiteur — il marche partout, sans rien savoir
   de ce qu'il y a derriere.

   Trois garde-fous : une seule fois par session ; jamais si le panneau

   Sur telephone, le panneau couvre l'ecran : on y pose une BULLE avec
   la premiere phrase et un bouton. Le message est vu, la page reste au
   visiteur.
   ================================================================ */
function presentationAssistant() {
  const CLE = "bcm-chat-auto", SEUIL_PX = 900, SEUIL_PART = 0.28;
  const pastille = document.querySelector("a.chatbot, .chatbot");
  if (!pastille) return;
  try { if (sessionStorage.getItem(CLE)) return; } catch (e) { /* stockage indispo */ }

  let fait = false, bulle = null;
  const dejaLa = () => !!document.querySelector('[class*="chat__panel"], [class*="chat-panel"], #bcr-panel, #scchat-panel');
  const congedier = () => { if (bulle) { bulle.remove(); bulle = null; } };
  const ouvrir = () => pastille.click();

  function poserBulle(texte) {
    if (bulle) return;
    bulle = document.createElement("div");
    bulle.className = "bc-amorce";
    bulle.setAttribute("role", "status");
    bulle.innerHTML =
      '<button type="button" class="bc-amorce__fermer" aria-label="Masquer le message de l’assistant">×</button>' +
      '<p class="bc-amorce__texte">' + texte + "</p>" +
      '<span class="bc-amorce__cta">Discuter →</span>';
    bulle.addEventListener("click", (e) => {
      const ferme = e.target.closest(".bc-amorce__fermer");
      congedier();
      if (!ferme) ouvrir();
    });
    document.body.appendChild(bulle);
  }

  function regarder() {
    if (fait || dejaLa()) return;
    const h = document.documentElement;
    const y = window.scrollY || h.scrollTop || 0;
    const total = Math.max(1, h.scrollHeight - h.clientHeight);
    if (y < SEUIL_PX && y / total < SEUIL_PART) return;
    fait = true;
    try { sessionStorage.setItem(CLE, "1"); } catch (e) { /* stockage indispo */ }
    setTimeout(() => {
      if (dejaLa()) return;
      if (window.matchMedia("(max-width: 480px)").matches) poserBulle("Une question sur les offres, les horaires ou l’école enfants ? Je réponds tout de suite.");
      else ouvrir();
    }, 650);
  }

  /* On LIT la position, on n'attend pas qu'on nous la signale : aucun
     evenement `scroll` n'est emis sur ce site (Lenis les absorbe — mesure
     faite au navigateur). Un intervalle plutot que requestAnimationFrame,
     parce que rAF est gele des que la page ne compose plus d'images
     (onglet d'arriere-plan) : la presentation ne partirait jamais pour
     quelqu'un qui ouvre le site dans un onglet et y revient. 300 ms coute
     cent fois moins qu'une image. On s'arrete pour de bon au premier
     declenchement, et on abandonne au bout de deux minutes. */
  const minuteur = setInterval(() => {
    regarder();
    if (fait) clearInterval(minuteur);
  }, 300);
  setTimeout(() => clearInterval(minuteur), 120000);
  regarder();   // page deja defilee (retour arriere, ancre) : on tranche tout de suite
}

/* ------------------- REVEAL v4 (sans dépendance GSAP) --------------
   Les révélations de v3 passent toutes par GSAP + ScrollTrigger, chargés
   depuis un CDN. C'est bien tant que le CDN répond ; le jour où il ne
   répond pas, `.fx` tombe et tout s'affiche d'un bloc — acceptable, mais
   la page perd son rythme.
   Les sections alternées de la refonte utilisent donc un IntersectionObserver
   natif : aucune dépendance, ~20 lignes, et il survit à tout. Les deux
   systèmes cohabitent — [data-reveal] reste piloté par GSAP. */
function revealNative(scope = document) {
  const els = [...scope.querySelectorAll(".reveal-up, .reveal-fade, .reveal-media")];
  if (!els.length) return;
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  /* C'est CE drapeau, et lui seul, qui autorise le CSS à masquer l'état
     de départ (cf. refonte.css §10). Il n'est posé qu'ici — donc jamais
     si le script ne s'exécute pas, et jamais retiré ensuite. */
  document.documentElement.classList.add("has-reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);          /* une révélation, pas un yo-yo */
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach((el) => { if (!el.dataset.ioBound) { el.dataset.ioBound = "1"; io.observe(el); } });

  /* ⚠ FILET DE SÉCURITÉ — indispensable, pas décoratif.
     Mesuré sur cette page de 22 000 px : après un défilement rapide,
     7 sections sur 24 n'avaient JAMAIS reçu `is-in` et restaient à
     opacité 0 — définitivement invisibles. Un IntersectionObserver
     n'échantillonne qu'aux images d'animation : ce qui traverse le
     viewport entre deux échantillons n'est jamais signalé, et comme on
     retire l'observation au premier passage, l'élément est perdu.
     Ce balayage rattrape tout ce qui a dépassé le bas de l'écran, quelle
     qu'ait été la vitesse. Il s'arrête de lui-même une fois la page
     entièrement révélée : aucun coût résiduel. */
  let pending = els.length, ticking = false;
  const sweep = () => {
    ticking = false;
    const limit = innerHeight;
    els.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      if (el.getBoundingClientRect().top < limit) { el.classList.add("is-in"); io.unobserve(el); }
    });
    pending = els.filter((el) => !el.classList.contains("is-in")).length;
    if (!pending) removeEventListener("scroll", onScroll);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } };
  addEventListener("scroll", onScroll, { passive: true });
  requestAnimationFrame(sweep);       /* et au premier rendu, pour le haut de page */

  /* la cascade dans une grille : chaque enfant hérite de son rang */
  scope.querySelectorAll(".stagger").forEach((g) => {
    [...g.children].forEach((c, i) => c.style.setProperty("--i", i));
  });
}

/* ---------------------- L'ALTERNANCE IMAGE/TEXTE ------------------
   Le brief demande le rythme « image à gauche, puis à droite, puis à
   gauche… ». En CSS pur, :nth-of-type compte les <section> et non les
   .split-sec : dès qu'une grille de tarifs s'intercale, la parité saute
   et deux photos se retrouvent du même côté (voir refonte.css §1).
   On numérote donc les sections alternées ENTRE ELLES, ici, une fois. */
function alternate(scope = document) {
  scope.querySelectorAll(".split-sec").forEach((s, i) => {
    if (s.classList.contains("split-sec--flip") || s.classList.contains("split-sec--noflip")) return;
    s.classList.add(i % 2 ? "split-sec--flip" : "split-sec--noflip");
  });
}

/* ------------------- BARRE D'ACTION MOBILE ------------------------
   Mesuré avant refonte : 13 000 px de page d'accueil sans un seul bouton
   d'inscription entre le hero et la grille de tarifs, et deux pastilles
   flottantes qui se chevauchaient de 65×25 px en bas de l'écran mobile.
   Une seule barre remplace tout ça : elle apparaît une fois le hero passé
   (avant, elle masquerait le CTA du hero pour rien) et disparaît quand le
   pied de page arrive (là, les liens sont déjà à l'écran). */
function mountActionBar() {
  if (document.querySelector(".actionbar")) return;
  const bar = document.createElement("div");
  bar.className = "actionbar";
  bar.innerHTML = `
    <a class="btn btn--primary" href="${CTA_HREF.primary}"><span>${CTA.chrome}</span></a>
    <a class="actionbar__call" href="tel:${SALLE.phoneHref}" aria-label="Appeler la salle au ${SALLE.phone}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>
    </a>`;
  document.body.appendChild(bar);

  const hero = document.querySelector(".hero, .page-head");
  const foot = document.querySelector(".footer, #footer");
  let pastHero = !hero, atFoot = false;
  const sync = () => bar.classList.toggle("is-in", pastHero && !atFoot);

  if ("IntersectionObserver" in window) {
    if (hero) new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); },
      { threshold: 0, rootMargin: "-70% 0px 0px 0px" }).observe(hero);
    if (foot) new IntersectionObserver(([e]) => { atFoot = e.isIntersecting; sync(); },
      { threshold: 0 }).observe(foot);
  } else {
    pastHero = true; sync();
  }
}

/* ======================= LA ROULETTE PROMO ========================
   DEUX offres, pas une. La roulette ne montrait que la rentrée à 29 € —
   or le club en vend deux, et ce sont deux publics différents : celui qui
   teste quatre semaines, et celui qui prend l'année. Une roulette qui
   n'a qu'une seule case n'est pas une roulette, c'est une affiche.
   Elle tourne donc entre les deux offres, et TOUT suit la case gagnante :
   le prix au centre, le titre, le détail, et surtout la DESTINATION du
   lien — un visiteur qui clique pendant que « la saison » est affichée
   doit arriver sur la saison, jamais sur la rentrée.

   Deux formes, un seul code :
   · flottante  — pastille fixe, présente sur toute la page
   · intégrée   — posée dans le flux à un endroit choisi (`[data-promo]`),
                  là où le visiteur vient de comprendre la valeur et où
                  la question du prix se pose d'elle-même.
   ================================================================== */

/* Les deux offres mises en avant, lues depuis PROMOS — jamais réécrites
   ici. Si le staff change un prix dans les données, la roulette suit. */
function promoOffers() {
  const carte = (k) => PROMOS.cards?.find((c) => c.key === k);
  const rentree = carte("rentree") || PROMOS.cards?.[0];
  const saison = carte("saison");
  const out = [];
  if (rentree) out.push({
    price: rentree.price || "29€",
    name: rentree.name || "L’offre Rentrée",
    detail: `${rentree.unit || "par personne"} · ${(rentree.period || "4 semaines").replace(/^·\s*/, "")} illimitées`,
    was: rentree.was || "44€",
    cut: "-34%",
    /* La fiche de l’offre, pas le tunnel de commande : on clique sur une
       offre pour la LIRE. rentree.href vaut /offre/29, exactement comme la
       carte tarifs — la saison lisait déjà sa donnée, la rentrée l’écrasait. */
    href: rentree.href || CTA_HREF.primary,
    cta: "Je profite de l’offre",
  });
  if (saison) out.push({
    price: saison.price || "259€",
    name: saison.name || "La saison complète",
    detail: `${(saison.period || "les 12 mois").replace(/^·\s*/, "")} · 4× sans frais`,
    was: saison.was || "400€",
    cut: "-35%",
    href: saison.href || CTA_HREF.primary,
    cta: "Je réserve ma saison",
  });
  return out;
}

function buildWheel(offers, inline) {
  const el = document.createElement(inline ? "div" : "aside");
  el.className = "promo-wheel" + (inline ? " promo-wheel--inline" : "");
  el.setAttribute("aria-label", "Nos deux offres — rentrée et saison");
  /* Le ruban porte les faits des DEUX offres : même arrêtée sur l'une,
     la roulette dit qu'il en existe une seconde. */
  const strip = offers.flatMap((o) => [
    { t: o.price, d: o.name.replace(/^L[’']/, "").replace(/^La /, "") },
    { t: o.cut, d: `au lieu de ${o.was}` },
  ]);
  el.innerHTML = `
    <a class="promo-wheel__link" href="${offers[0].href}">
      <span class="promo-wheel__flag">Offre à saisir</span>
      <span class="promo-wheel__stage" aria-hidden="true">
        <span class="promo-wheel__pointer"></span>
        <span class="promo-wheel__disc">
          <span class="promo-wheel__slice promo-wheel__slice--top">${offers[0].price}</span>
          <span class="promo-wheel__slice promo-wheel__slice--right">${offers[0].cut}</span>
          <span class="promo-wheel__slice promo-wheel__slice--bottom">${(offers[1] || offers[0]).price}</span>
          <span class="promo-wheel__slice promo-wheel__slice--left">${(offers[1] || offers[0]).cut}</span>
        </span>
        <span class="promo-wheel__core"><span class="promo-wheel__core-v">${offers[0].price}</span></span>
      </span>
      <span class="promo-wheel__copy">
        <b class="promo-wheel__name">${offers[0].name}</b>
        <span class="promo-wheel__detail">${offers[0].detail}</span>
        <span class="promo-wheel__go">${offers[0].cta} <i aria-hidden="true">→</i></span>
      </span>
      <span class="promo-wheel__ticker" aria-hidden="true">
        ${strip.map((s) => `<span><b>${s.t}</b>${s.d}</span>`).join("")}
      </span>
    </a>`;
  return el;
}

/* Fait tourner la roulette entre les offres et recâble le lien.
   S'arrête dès que la roulette sort de l'écran ou que l'onglet passe en
   arrière-plan : une animation qu'on ne regarde pas ne doit rien coûter. */
function armWheel(el, offers) {
  if (offers.length < 2) return;
  const link = el.querySelector(".promo-wheel__link");
  const core = el.querySelector(".promo-wheel__core-v");
  const name = el.querySelector(".promo-wheel__name");
  const detail = el.querySelector(".promo-wheel__detail");
  const go = el.querySelector(".promo-wheel__go");
  let i = 0, timer = null, visible = true;

  const land = (n) => {
    const o = offers[n];
    core.textContent = o.price;
    name.textContent = o.name;
    detail.textContent = o.detail;
    go.firstChild.nodeValue = o.cta + " ";
    link.setAttribute("href", o.href);
    el.dataset.offer = String(n);
  };

  const tour = () => {
    i = (i + 1) % offers.length;
    if (reduce) { land(i); return; }      /* pas de spin : on échange, point */
    el.classList.add("is-spinning");
    /* la case change AU MILIEU du tour — quand le disque va trop vite
       pour qu'on lise l'ancienne valeur. Changer avant ou après, c'est
       montrer la bascule au lieu de la faire. */
    setTimeout(() => land(i), 520);
    setTimeout(() => el.classList.remove("is-spinning"), 1150);
  };

  const start = () => { if (!timer && visible) timer = setInterval(tour, 5200); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

  land(0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); },
      { threshold: 0.25 }).observe(el);
  } else start();
  document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
}

function mountPromoWheels() {
  const offers = promoOffers();
  if (!offers.length) return;

  /* 1. LES ROULETTES INTÉGRÉES — une par ancre `[data-promo]`, posée par
        la page à l'endroit où le prix devient la question suivante. */
  const ancres = document.querySelectorAll("[data-promo]:not([data-promo-mounted])");
  ancres.forEach((a) => {
    a.setAttribute("data-promo-mounted", "1");
    const el = buildWheel(offers, true);
    a.appendChild(el);
    armWheel(el, offers);
  });

  /* 2. LA ROULETTE FLOTTANTE — le rappel permanent. Elle s'efface quand
        une roulette intégrée est à l'écran : deux fois la même offre au
        même moment, c'est une de trop. */
  if (document.querySelector("aside.promo-wheel")) return;
  const wheel = buildWheel(offers, false);
  document.body.appendChild(wheel);
  armWheel(wheel, offers);

  const hero = document.querySelector(".hero, .page-head");
  const foot = document.querySelector(".footer, #footer");
  let pastHero = !hero, atFoot = false, surInline = false;
  const sync = () => wheel.classList.toggle("is-in", pastHero && !atFoot && !surInline);
  if ("IntersectionObserver" in window) {
    if (hero) new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); },
      { threshold: 0, rootMargin: "-48% 0px 0px 0px" }).observe(hero);
    if (foot) new IntersectionObserver(([e]) => { atFoot = e.isIntersecting; sync(); },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }).observe(foot);
    if (ancres.length) {
      const io = new IntersectionObserver((es) => {
        surInline = es.some((e) => e.isIntersecting) ||
          [...ancres].some((a) => { const r = a.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
        sync();
      }, { threshold: 0 });
      ancres.forEach((a) => io.observe(a));
    }
  } else {
    pastHero = true; sync();
  }
}

/* ------------------------- LES ÉTOILES D'AVIS ---------------------
   La note Google ne vivait que dans le JSON-LD : elle
   servait au moteur de recherche et à personne d'autre. Ce composant la
   rend visible partout où l'on écrit `<span data-rating>`. */
function mountRatings(scope = document) {
  const nodes = scope.querySelectorAll("[data-rating]:not([data-rated])");
  nodes.forEach((el) => {
    el.dataset.rated = "1";
    /* Aucun repli chiffre ici : une note en dur finit toujours par mentir
       (c'est ainsi que 4,5 a survecu alors que Google disait 4,3). Sans
       valeur, on n'affiche pas d'etoiles. La source est
       src/avis-google.json, repandue au build par scripts/avis-google.mjs. */
    const val = parseFloat(el.dataset.rating);
    if (!Number.isFinite(val)) return;
    const count = el.dataset.ratingCount || "";
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      const fill = Math.max(0, Math.min(1, val - i + 1));
      const id = `g${i}${Math.random().toString(36).slice(2, 7)}`;
      stars += fill >= .98
        ? `<svg viewBox="0 0 20 20" aria-hidden="true"><path class="s-full" d="M10 1.6l2.5 5.1 5.6.8-4 3.9 1 5.6L10 14.3 5 17l1-5.6-4-3.9 5.6-.8z"/></svg>`
        : `<svg viewBox="0 0 20 20" aria-hidden="true"><defs><linearGradient id="${id}"><stop offset="${fill * 100}%" stop-color="#F5A623"/><stop offset="${fill * 100}%" stop-color="currentColor" stop-opacity=".28"/></linearGradient></defs><path fill="url(#${id})" d="M10 1.6l2.5 5.1 5.6.8-4 3.9 1 5.6L10 14.3 5 17l1-5.6-4-3.9 5.6-.8z"/></svg>`;
    }
    el.classList.add("rating");
    el.innerHTML = `<span class="rating__stars" aria-hidden="true">${stars}</span>` +
      `<span class="rating__val">${String(val).replace(".", ",")}</span>` +
      (count ? `<span class="rating__cnt">sur ${count} avis Google</span>` : "");
    el.setAttribute("aria-label", `Note de ${String(val).replace(".", ",")} sur 5${count ? `, sur ${count} avis Google` : ""}`);
  });
}

/* ------------------------------ BOOT ------------------------------ */
window.BC = { reveal, revealNative, alternate, mountRatings, magnetic, refresh, media: hydrateMedia, serveMedia, split, scramble, initKinetics, faq, get lenis() { return lenis; }, get velocity() { return velocity; } };
mountNav();
mountFooter();
alternate();
revealNative();
mountRatings();
mountActionBar();
mountPromoWheels();
initSmooth();
initCursor();
hydrateMedia(document);   // hydrate menu/footer bg video etc.
magnetic(document);
armChatbot();

/* « Plus que N places » : le nombre vient des ventes reelles de la
   boutique. Sans reponse, aucun compteur ne s'affiche — voir places.js. */
void initPlaces();
presentationAssistant();

export const BC = window.BC;
