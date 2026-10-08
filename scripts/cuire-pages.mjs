/* =====================================================================
   MINIMES · scripts/cuire-pages.mjs — le texte entre dans le HTML

   LE PROBLÈME, MESURÉ EN LIGNE (20/08/2026). Beaucoup de HTML servi,
   presque aucun contenu. Une fois les <script> retirés :

       /coachs      25 729 o servis  ->    768 o de texte
       /activites   24 100 o servis  ->    629 o
       /tarifs      25 097 o servis  ->  1 250 o
       /plannings   31 336 o servis  ->  1 284 o

   Autrement dit : plus de 90 % de ce que lit un visiteur n'existait que
   dans le JavaScript. Google finit par l'exécuter, avec retard et sous
   budget ; GPTBot, ClaudeBot et PerplexityBot ne l'exécutent pas du
   tout. Les quatre pages qui portent l'offre étaient donc muettes pour
   exactement les moteurs qu'on cherche à séduire.

   CE QUE FAIT CE SCRIPT. Après le build, il écrit dans les creux le même
   contenu que le JS peindra ensuite, tiré des MÊMES fichiers de données.
   Balisage sobre (h3/p/ul) plutôt qu'une copie du rendu riche : c'est le
   TEXTE qui doit être lisible, et une copie du markup dériverait au
   premier changement de style. Chaque module fait `el.innerHTML = …` au
   chargement : le visiteur voit le rendu complet, à l'identique.

   Effet de bord assumé : sans JavaScript, les pages restent lisibles.

   GARDE-FOU. Si un creux n'est plus vide ou change de nom, le script
   s'arrête en erreur au lieu de cuire à côté.

   Usage : `npm run postbuild`, après cuire-galerie.mjs.
   ===================================================================== */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = (f) => pathToFileURL(join(ROOT, "public", "assets", "js", f)).href;
const { COACHES, FAQ, SALLE, PROMOS } = await import(url("data.js"));
const { TARIFS } = await import(url("data-accueil.js"));
const { MONEY_FAQ, REVIEWS } = await import(url("data-argent.js"));
const { PLANNING, PLANNING_DAYS } = await import(url("data-planning.js"));
const { DISCIPLINES } = await import(url("data-disciplines.js"));

const e = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ul = (xs) => (xs && xs.length ? `<ul>${xs.map((x) => `<li>${e(x)}</li>`).join("")}</ul>` : "");
const faq = (items, id) => (items || []).map((f, i) =>
  `<div class="faq__item"><button class="faq__q" type="button" id="${id}-q-${i}" aria-expanded="false" aria-controls="${id}-a-${i}"><span>${e(f.q)}</span><span class="faq__sign" aria-hidden="true"></span></button><div class="faq__a" id="${id}-a-${i}" role="region" aria-labelledby="${id}-q-${i}"><p>${e(f.a)}</p></div></div>`
).join("");

/* /coachs — le pilier de la maison, puis le reste de l'encadrement */
const p = COACHES.pillar;
const pillar = p
  ? `<article><h3>${e(p.name)}</h3><p><b>${e(p.role)}</b>${p.tag ? ` · ${e(p.tag)}` : ""}</p>${
      p.bio ? `<p>${e(p.bio)}</p>` : ""
    }${ul(p.disciplines)}</article>`
  : "";

const roster = (COACHES.roster || [])
  .map(
    (c) =>
      `<article><h3>${e(c.name)}</h3><p><b>${e(c.role || "")}</b>${c.tag ? ` · ${e(c.tag)}` : ""}</p>${
        c.bio || c.note ? `<p>${e(c.bio || c.note)}</p>` : ""
      }${ul(c.disciplines)}</article>`
  )
  .join("");

/* /activites — les disciplines, une par une */
const actRows = DISCIPLINES.map(
  (d) =>
    `<article><h3>${e(d.name)}</h3><p><b>${e(d.tag || "")}</b></p>${
      d.teaser ? `<p>${e(d.teaser)}</p>` : ""
    }${d.desc ? `<p>${e(d.desc)}</p>` : ""}</article>`
).join("");
const actIndex = DISCIPLINES.map((d, i) =>
  `<a class="act-chip" href="#${e(d.key)}"><span class="act-chip__n">${String(i + 1).padStart(2, "0")}</span>${e(d.actName || d.name)}</a>`
).join("");

/* /plannings — la semaine, jour par jour */
const plGrid = PLANNING_DAYS.map((j) => {
  const cours = PLANNING.filter((c) => c.d === j);
  if (!cours.length) return "";
  return `<section><h3>${e(j)}</h3><ul>${cours
    .map(
      (c) =>
        `<li>${e(c.h)}${c.end ? `–${e(c.end)}` : ""} — ${e(c.name)}${c.age ? ` · ${e(c.age)}` : ""}${
          c.coach ? ` · ${e(c.coach)}` : ""
        }</li>`
    )
    .join("")}</ul></section>`;
}).join("");

/* /tarifs — les offres, les questions d'argent, les avis */
const offers = TARIFS.map(
  (t) =>
    `<article><h3>${e(t.name)}</h3><p><b>${e(t.price)}</b>${t.period ? ` ${e(t.period)}` : ""}</p>${
      t.feature ? `<p>${e(t.feature)}</p>` : ""
    }${ul(t.items)}</article>`
).join("");

const moneyFaq = [...MONEY_FAQ, ...FAQ]
  .map((f) => `<section><h3>${e(f.q)}</h3><p>${e(f.a)}</p></section>`)
  .join("");

const reviews = (REVIEWS.quotes || [])
  .map((q) => `<blockquote><p>${e(q.text)}</p><cite>${e(q.author)}</cite></blockquote>`)
  .join("");
const bonus = `<span class="bonus__badge">Bonus</span><p class="bonus__txt">${e(PROMOS.bonus)}</p>`;

const FOURNEES = [
  ["coachs", "pillar", pillar, "le pilier"],
  ["coachs", "roster", roster, (COACHES.roster || []).length + " coachs"],
  ["activites", "act-rows", actRows, DISCIPLINES.length + " disciplines"],
  ["plannings", "pl-grid", plGrid, PLANNING.length + " creneaux"],
  ["tarifs", "offers", offers, TARIFS.length + " offres"],
  ["tarifs", "bonus", bonus, "le bonus enfant"],
  ["tarifs", "money-faq", moneyFaq, MONEY_FAQ.length + FAQ.length + " questions"],
  ["tarifs", "reviews", reviews, (REVIEWS.quotes || []).length + " avis"],
];

const pages = new Map();
for (const [page, id, contenu, quoi] of FOURNEES) {
  if (!contenu) { console.error(`[pages] rien a cuire pour #${id} — donnees vides`); process.exit(1); }
  const f = join(ROOT, "dist", page, "index.html");
  if (!pages.has(f)) pages.set(f, await readFile(f, "utf8"));
  const creux = new RegExp(`(<(?:div|section|ul|ol)[^>]*\\s+id="${id}"[^>]*>)\\s*(</(?:div|section|ul|ol)>)`);
  const html = pages.get(f);
  if (!creux.test(html)) {
    console.error(`[pages] #${id} de /${page}/ n'est plus vide ou a change de forme — rien de cuit`);
    process.exit(1);
  }
  pages.set(f, html.replace(creux, `$1${contenu}$2`));
  console.log(`[pages] /${page}/ #${id} : ${quoi}`);
}
for (const [f, html] of pages) await writeFile(f, html);

/* /contact/ : les cibles ne sont pas toutes des <div> vides. On remplit
   leurs formes exactes ; toute dérive du gabarit fait tomber le build. */
const contactFile = join(ROOT, "dist", "contact", "index.html");
let contact = await readFile(contactFile, "utf8");
const contactReplacements = [
  ['<a id="addr" href="#" target="_blank" rel="noopener"></a>', `<a id="addr" href="${e(SALLE.mapsLink)}" target="_blank" rel="noopener">${e(SALLE.address.full)}</a>`],
  ['<ul id="access"></ul>', `<ul id="access">${(SALLE.access || []).map((x) => `<li>${e(x)}</li>`).join("")}</ul>`],
  ['<p id="hours"></p>', `<p id="hours">${(SALLE.hoursData || []).map((h) => `${e(h.d)} · ${e(h.h)}`).join("<br>")}</p>`],
  ['<a id="phone" href="#"></a>', `<a id="phone" href="tel:${e(SALLE.phoneHref)}">${e(SALLE.phone)}</a>`],
  ['<a id="email" href="#"></a>', `<a id="email" href="mailto:${e(SALLE.email)}">${e(SALLE.email)}</a>`],
  ['<iframe id="map" loading="lazy"', `<iframe id="map" src="${e(SALLE.mapsUrl)}" loading="lazy"`],
  ['<div class="faq" id="faq"></div>', `<div class="faq" id="faq">${faq(FAQ, "faq")}</div>`],
];
for (const [from, to] of contactReplacements) {
  if (!contact.includes(from)) {
    console.error(`[pages] cible contact introuvable : ${from}`);
    process.exit(1);
  }
  contact = contact.replace(from, to);
}
await writeFile(contactFile, contact);
console.log(`[pages] /contact/ : adresse, ${(SALLE.access || []).length} accès, ${(SALLE.hoursData || []).length} horaires et ${FAQ.length} réponses`);

/* /activites/ : le sommaire est un <nav>, hors du four générique. */
const activitiesFile = join(ROOT, "dist", "activites", "index.html");
let activities = await readFile(activitiesFile, "utf8");
const emptyIndex = '<nav class="wrap act-index" id="act-index" aria-label="Sommaire des disciplines"></nav>';
if (!activities.includes(emptyIndex)) {
  console.error("[pages] #act-index n'est plus vide ou a changé de forme");
  process.exit(1);
}
activities = activities.replace(emptyIndex, `<nav class="wrap act-index" id="act-index" aria-label="Sommaire des disciplines">${actIndex}</nav>`);
await writeFile(activitiesFile, activities);

console.log("[pages] contenu cuit — activités, coachs, planning, tarifs et contact sont lisibles sans JavaScript");
